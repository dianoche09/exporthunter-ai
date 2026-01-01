import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Lead } from '../models/Lead';
import { Campaign } from '../models/Campaign';
import { EmailActivity } from '../models/EmailActivity';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;

    // Get counts
    const totalLeads = await Lead.countDocuments({ userId });
    const activeLeads = await Lead.countDocuments({
      userId,
      status: { $in: ['new', 'contacted', 'interested', 'qualified'] }
    });
    const totalCampaigns = await Campaign.countDocuments({ userId });

    // Get email stats
    const emailActivities = await EmailActivity.find({ userId });
    const emailsSent = emailActivities.filter(a => a.sentAt).length;
    const emailsOpened = emailActivities.filter(a => a.openedAt).length;
    const emailsClicked = emailActivities.filter(a => a.clickedAt).length;

    // Calculate rates
    const openRate = emailsSent > 0 ? Math.round((emailsOpened / emailsSent) * 100) : 0;
    const clickRate = emailsSent > 0 ? Math.round((emailsClicked / emailsSent) * 100) : 0;

    // Get leads by status
    const leadsByStatus = await Lead.aggregate([
      { $match: { userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get leads by country (top 5)
    const leadsByCountry = await Lead.aggregate([
      { $match: { userId } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get recent activities (last 10)
    const recentActivities = await EmailActivity.find({ userId })
      .populate('leadId', 'companyName')
      .populate('campaignId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate growth (last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const leadsLast30 = await Lead.countDocuments({
      userId,
      createdAt: { $gte: thirtyDaysAgo }
    });
    const leadsPrevious30 = await Lead.countDocuments({
      userId,
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });
    const leadsGrowth = leadsPrevious30 > 0
      ? Math.round(((leadsLast30 - leadsPrevious30) / leadsPrevious30) * 100)
      : 100;

    res.json({
      success: true,
      data: {
        overview: {
          totalLeads,
          activeLeads,
          totalCampaigns,
          emailsSent,
          leadsGrowth,
          openRate,
          clickRate
        },
        leadsByStatus: leadsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as any),
        leadsByCountry: leadsByCountry.map(item => ({
          country: item._id,
          count: item.count
        })),
        recentActivities: recentActivities.map(activity => ({
          id: activity._id,
          type: activity.status,
          leadName: (activity.leadId as any)?.companyName || 'Unknown',
          campaignName: (activity.campaignId as any)?.name || 'Unknown',
          timestamp: activity.createdAt
        }))
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
