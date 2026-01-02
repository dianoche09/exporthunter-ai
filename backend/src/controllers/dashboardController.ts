
import { Request, Response } from 'express';
import { Briefing, Notification } from '../models/Dashboard';
import { Lead } from '../models/Lead';
import { Campaign } from '../models/Campaign';
import { geminiService } from '../services/ai/geminiService';
import mongoose from 'mongoose';

// In-memory cache for speed (Replace with Redis in production)
const CACHE = new Map<string, any>();
const CACHE_TTL = 300 * 1000; // 5 minutes

// Helper: Calculate percentage change
const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
};

// Helper: Get date range
const getDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

export const getBriefing = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const userName = (req as any).user.name || 'Hunter';
        const cacheKey = `briefing_${userId}`;

        // Check Cache
        if (CACHE.has(cacheKey)) {
            const cached = CACHE.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_TTL) {
                return res.json(cached.data);
            }
        }

        // Check DB for today's briefing
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        let briefing = await Briefing.findOne({
            user: userId,
            createdAt: { $gte: startOfDay }
        }).sort({ createdAt: -1 });

        // Generate AI-powered briefing if not exists
        if (!briefing) {
            // Fetch real-time data for context
            const [newOpportunities, totalLeads, activeCampaigns, recentLeads] = await Promise.all([
                Lead.countDocuments({ userId, status: 'new', aiScore: { $gt: 70 } }),
                Lead.countDocuments({ userId }),
                Campaign.countDocuments({ userId, status: { $in: ['active', 'sending'] } }),
                Lead.find({ userId, status: 'new' }).sort({ createdAt: -1 }).limit(5)
            ]);

            // Get campaign performance
            const campaigns = await Campaign.find({ userId, status: { $in: ['active', 'completed'] } })
                .select('name stats')
                .limit(3);

            const avgOpenRate = campaigns.length > 0
                ? Math.round(campaigns.reduce((sum, c) => sum + (c.stats.openRate || 0), 0) / campaigns.length)
                : 0;

            // Prepare context for AI
            const aiContext = {
                userName,
                newOpportunityCount: newOpportunities,
                totalLeads,
                activeCampaignsCount: activeCampaigns,
                avgOpenRate,
                topLeadCountries: recentLeads.slice(0, 3).map(l => l.country),
                bestCampaign: campaigns[0]?.name || 'N/A'
            };

            // Generate AI briefing
            let aiMessage = '';
            try {
                const prompt = `You are an Export Sales AI Assistant. Generate a motivating, professional daily briefing for ${userName}.

Context:
- New High-Potential Leads Today: ${newOpportunities}
- Total Leads in System: ${totalLeads}
- Active Campaigns: ${activeCampaigns}
- Average Open Rate: ${avgOpenRate}%
- Top Lead Countries: ${aiContext.topLeadCountries.join(', ')}
- Best Performing Campaign: ${aiContext.bestCampaign}

Write a single-sentence welcome message that:
1. Greets the user warmly
2. Highlights the BEST metric or achievement
3. Creates urgency to take action

Examples:
- "Welcome back! Your Germany campaign hit 85% open rate—I've found 12 similar leads ready for outreach."
- "Hunter 👋 You're on fire! 23 high-potential buyers from India just entered your radar."

Return ONLY the message text, no JSON, no formatting.`;

                const aiResponse = await geminiService.generateText(prompt, (req as any).user.apiKeys?.gemini);

                aiMessage = aiResponse.trim();
            } catch (error) {
                console.error('AI Briefing Generation Failed:', error);
                aiMessage = `Welcome back, ${userName}! ${newOpportunities > 0 ? `I've found ${newOpportunities} new high-potential leads for you.` : "Your campaigns are performing well. Let's discover new opportunities!"}`;
            }

            briefing = await Briefing.create({
                user: userId,
                greeting: `Welcome back, ${userName} 👋`,
                summary: aiMessage,
                highlight: {
                    metric: String(newOpportunities),
                    label: "New Leads"
                },
                actions: [
                    { label: "Start AI Discovery", icon: "Sparkles", primary: true, href: "/leads?open_wizard=true" },
                    { label: `Review ${newOpportunities} Opportunities`, icon: "Target", primary: false, href: "/leads?filter=new_opportunities" }
                ]
            });
        }

        const responseData = {
            greeting: briefing.greeting,
            summary: briefing.summary,
            highlight: briefing.highlight,
            actions: briefing.actions
        };

        CACHE.set(cacheKey, { timestamp: Date.now(), data: responseData });
        res.json(responseData);
    } catch (error) {
        console.error('Briefing Error:', error);
        res.status(500).json({ error: 'Failed to generate briefing' });
    }
};

export const getOpportunities = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        // Fetch or create notifications
        let opportunities = await Notification.find({ user: userId })
            .sort({ confidenceScore: -1, createdAt: -1 })
            .limit(5);

        if (opportunities.length === 0) {
            // Generate real opportunities based on actual data
            const [
                highScoreLeads,
                countryClusters,
                activeCampaigns
            ] = await Promise.all([
                Lead.find({ userId, aiScore: { $gte: 85 }, status: 'new' }).limit(3),
                Lead.aggregate([
                    { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'new' } },
                    { $group: { _id: '$country', count: { $sum: 1 } } },
                    { $match: { count: { $gte: 3 } } },
                    { $sort: { count: -1 } },
                    { $limit: 2 }
                ]),
                Campaign.find({ userId, status: 'active' }).select('name stats').limit(1)
            ]);

            const seedOpportunities: any[] = [];

            // Hot leads
            if (highScoreLeads.length > 0) {
                const lead = highScoreLeads[0];
                seedOpportunities.push({
                    user: userId,
                    type: 'hot',
                    title: `🔥 High Intent: ${lead.companyName}`,
                    description: `AI Match Score: ${lead.aiScore}%. ${lead.aiReasoning || 'Strong buying signals detected.'}`,
                    confidenceScore: lead.aiScore,
                    action: {
                        label: "View Lead",
                        endpoint: `/leads/${lead._id}`
                    }
                });
            }

            // Country surge
            if (countryClusters.length > 0) {
                const cluster = countryClusters[0];
                seedOpportunities.push({
                    user: userId,
                    type: 'opportunity',
                    title: `📍 ${cluster._id} Market Signal`,
                    description: `${cluster.count} companies from ${cluster._id} are actively searching. High demand detected.`,
                    confidenceScore: 92,
                    action: {
                        label: "Start Campaign",
                        endpoint: `/campaigns?target=${cluster._id}`
                    }
                });
            }

            // Campaign performance
            if (activeCampaigns.length > 0) {
                const campaign = activeCampaigns[0];
                const openRate = campaign.stats.openRate || 0;
                seedOpportunities.push({
                    user: userId,
                    type: 'insight',
                    title: "📊 Campaign Performance",
                    description: `"${campaign.name}" is achieving ${openRate}% open rate. ${openRate > 40 ? 'Above industry average!' : 'Consider optimization.'}`,
                    confidenceScore: Math.min(openRate * 2, 100),
                    action: {
                        label: "View Analytics",
                        endpoint: `/campaigns/${campaign._id}`
                    }
                });
            }

            if (seedOpportunities.length > 0) {
                await Notification.insertMany(seedOpportunities);
                opportunities = await Notification.find({ user: userId }).sort({ confidenceScore: -1 }).limit(5);
            }
        }

        res.json(opportunities);
    } catch (error) {
        console.error('Opportunities Error:', error);
        res.status(500).json({ error: 'Failed to fetch opportunities' });
    }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        // Date ranges
        const thisWeek = getDateRange(7);
        const lastWeek = { start: new Date(thisWeek.start.getTime() - 7 * 24 * 60 * 60 * 1000), end: thisWeek.start };

        // Parallel queries
        const [
            totalLeads,
            leadsThisWeek,
            leadsLastWeek,
            statusCounts,
            campaigns,
            campaignsActive
        ] = await Promise.all([
            Lead.countDocuments({ userId }),
            Lead.countDocuments({ userId, createdAt: { $gte: thisWeek.start, $lte: thisWeek.end } }),
            Lead.countDocuments({ userId, createdAt: { $gte: lastWeek.start, $lte: lastWeek.end } }),
            Lead.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId) } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Campaign.find({ userId }).select('stats'),
            Campaign.countDocuments({ userId, status: { $in: ['active', 'sending'] } })
        ]);

        // Calculate metrics
        const leadsGrowth = calculateGrowth(leadsThisWeek, leadsLastWeek);

        const avgOpenRate = campaigns.length > 0
            ? Math.round(campaigns.reduce((sum, c) => sum + (c.stats.openRate || 0), 0) / campaigns.length)
            : 0;

        const avgClickRate = campaigns.length > 0
            ? Math.round(campaigns.reduce((sum, c) => sum + (c.stats.clickRate || 0), 0) / campaigns.length)
            : 0;

        const totalEmailsSent = campaigns.reduce((sum, c) => sum + (c.stats.sentCount || 0), 0);

        // Status breakdown
        const leadsByStatus: Record<string, number> = {
            new: 0,
            contacted: 0,
            interested: 0,
            qualified: 0,
            customer: 0,
            rejected: 0
        };

        statusCounts.forEach((status: any) => {
            if (leadsByStatus.hasOwnProperty(status._id)) {
                leadsByStatus[status._id] = status.count;
            }
        });

        // AI Performance ROI
        const qualificationRate = totalLeads > 0
            ? Math.round(((leadsByStatus.qualified + leadsByStatus.customer) / totalLeads) * 100)
            : 0;

        const stats = {
            overview: {
                totalLeads,
                leadsGrowth,
                openRate: avgOpenRate,
                totalCampaigns: campaignsActive,
                emailsSent: totalEmailsSent,
                clickRate: avgClickRate
            },
            leadsByStatus,
            aiPerformance: {
                matchAccuracy: 94, // Placeholder - could be calculated from user feedback
                roi: 2.4, // Placeholder - needs revenue tracking
                qualificationRate
            }
        };

        res.json(stats);
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

export const getAcquisitionChart = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        // Last 7 days
        const chartData = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const [newLeads, emailsSent] = await Promise.all([
                Lead.countDocuments({
                    userId,
                    createdAt: { $gte: date, $lt: nextDate }
                }),
                Campaign.aggregate([
                    {
                        $match: {
                            userId: new mongoose.Types.ObjectId(userId),
                            createdAt: { $gte: date, $lt: nextDate }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$stats.sentCount' }
                        }
                    }
                ])
            ]);

            chartData.push({
                name: days[date.getDay()],
                leads: newLeads,
                emails: emailsSent[0]?.total || 0
            });
        }

        // Generate AI insight for the chart
        let chartInsight = '';
        try {
            const maxLeadsDay = chartData.reduce((max, day) => day.leads > max.leads ? day : max, chartData[0]);
            const totalLeads = chartData.reduce((sum, day) => sum + day.leads, 0);
            const totalEmails = chartData.reduce((sum, day) => sum + day.emails, 0);

            if (totalLeads > 0) {
                const prompt = `Analyze this week's lead acquisition data and write a single insightful sentence.

Data:
- Peak day: ${maxLeadsDay.name} with ${maxLeadsDay.leads} leads
- Total leads this week: ${totalLeads}
- Total emails sent: ${totalEmails}

Write a data-driven insight that:
1. Identifies the correlation between activity and results
2. Suggests what worked well
3. Is actionable

Example: "${maxLeadsDay.name}'s campaign blast drove 180% higher engagement, acquiring ${maxLeadsDay.leads} leads."

Return ONLY the insight sentence.`;

                const aiResponse = await geminiService.generateText(prompt, (req as any).user.apiKeys?.gemini);
                chartInsight = aiResponse.trim();
            }
        } catch (error) {
            console.error('Chart AI Insight Error:', error);
        }

        res.json({
            data: chartData,
            insight: chartInsight
        });
    } catch (error) {
        console.error('Chart Error:', error);
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
};
