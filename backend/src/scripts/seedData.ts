
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/User';
import { Lead } from '../models/Lead';
import { Campaign } from '../models/Campaign';
import { EmailActivity } from '../models/EmailActivity';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const seedData = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find the test user
        const user = await User.findOne({ email: 'test@exporthunter.com' });
        if (!user) {
            throw new Error('Test user not found! Please run seedUser.ts first.');
        }

        console.log('Found user:', user.email);

        // Clear existing data for this user
        await Lead.deleteMany({ userId: user._id });
        await Campaign.deleteMany({ userId: user._id });
        await EmailActivity.deleteMany({ userId: user._id });
        console.log('🧹 Cleared existing data for user');

        // 1. Create Leads
        const leads = [
            {
                companyName: 'TechCorp Solutions',
                country: 'Germany',
                city: 'Berlin',
                email: 'contact@techcorp.de',
                industry: 'Software',
                source: 'ai-discovery',
                status: 'new',
                aiScore: 85
            },
            {
                companyName: 'Global Trade Partners',
                country: 'UK',
                city: 'London',
                email: 'info@gtp.co.uk',
                industry: 'Logistics',
                source: 'manual',
                status: 'contacted',
                aiScore: 92
            },
            {
                companyName: 'Nordic Innovations',
                country: 'Sweden',
                city: 'Stockholm',
                email: 'hello@nordic.se',
                industry: 'Manufacturing',
                source: 'import',
                status: 'interested',
                aiScore: 78
            },
            {
                companyName: 'Alpha Industries',
                country: 'USA',
                city: 'New York',
                email: 'sales@alphaind.com',
                industry: 'Automotive',
                source: 'ai-discovery',
                status: 'qualified',
                aiScore: 95
            },
            {
                companyName: 'Future Systems',
                country: 'Japan',
                city: 'Tokyo',
                email: 'info@futuresys.jp',
                industry: 'Robotics',
                source: 'ai-discovery',
                status: 'customer',
                aiScore: 88
            }
        ];

        const createdLeads = await Lead.insertMany(
            leads.map(lead => ({ ...lead, userId: user._id }))
        );
        console.log(`✅ Created ${createdLeads.length} leads`);

        // 2. Create Campaigns
        const campaigns = [
            {
                name: 'Q1 Outreach - Europe',
                subject: 'Partnership Opportunity',
                body: 'Hello...',
                status: 'active',
                stats: {
                    sent: 150,
                    opened: 85,
                    clicked: 45,
                    replied: 12,
                    totalRecipients: 1000,
                    sentCount: 150,
                    openedCount: 85,
                    clickedCount: 45,
                    repliedCount: 12
                }
            },
            {
                name: 'US Market Expansion',
                subject: 'Introducing ExportHunter',
                body: 'Hi there...',
                status: 'completed',
                stats: {
                    sent: 500,
                    opened: 200,
                    clicked: 80,
                    replied: 25,
                    totalRecipients: 500,
                    sentCount: 500,
                    openedCount: 200,
                    clickedCount: 80,
                    repliedCount: 25
                }
            }
        ];

        const createdCampaigns = await Campaign.insertMany(
            campaigns.map(camp => ({ ...camp, userId: user._id }))
        );
        console.log(`✅ Created ${createdCampaigns.length} campaigns`);

        // 3. Create Email Activities (to show recent activity and charts)
        const activities = [];
        const statuses = ['sent', 'opened', 'clicked', 'replied'] as const;

        // Generate some random activities for the last 7 days
        for (let i = 0; i < 20; i++) {
            const randomLead = createdLeads[Math.floor(Math.random() * createdLeads.length)];
            const randomCampaign = createdCampaigns[Math.floor(Math.random() * createdCampaigns.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            const daysAgo = Math.floor(Math.random() * 7);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            activities.push({
                userId: user._id,
                leadId: randomLead._id,
                campaignId: randomCampaign._id,
                status: status,
                sentAt: (status as string) !== 'failed' ? date : undefined,
                openedAt: ['opened', 'clicked', 'replied'].includes(status) ? new Date(date.getTime() + 1000 * 60 * 60) : undefined,
                clickedAt: ['clicked', 'replied'].includes(status) ? new Date(date.getTime() + 2 * 1000 * 60 * 60) : undefined,
                repliedAt: status === 'replied' ? new Date(date.getTime() + 3 * 1000 * 60 * 60) : undefined,
                createdAt: date
            });
        }

        await EmailActivity.insertMany(activities);
        console.log(`✅ Created ${activities.length} email activities`);

        console.log('🎉 Database seeded successfully!');

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
    }
};

seedData();
