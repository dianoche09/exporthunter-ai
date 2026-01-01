import { Campaign } from '../../models/Campaign';
import { Lead } from '../../models/Lead';
import { EmailActivity } from '../../models/EmailActivity';

class CampaignStatsSync {
    async syncCampaignStats(campaignId: string) {
        try {
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }

            // Get all email activities for this campaign
            const activities = await EmailActivity.find({ campaignId });

            // Calculate stats
            const stats = {
                totalSent: activities.filter(a => a.sentAt).length,
                totalOpened: activities.filter(a => a.openedAt).length,
                totalClicked: activities.filter(a => a.clickedAt).length,
                totalReplied: activities.filter(a => a.repliedAt).length,
                totalFailed: activities.filter(a => a.status === 'failed').length
            };

            // Update campaign stats
            campaign.stats = {
                ...campaign.stats,
                sent: stats.totalSent,
                opened: stats.totalOpened,
                clicked: stats.totalClicked,
                replied: stats.totalReplied,
                failed: stats.totalFailed,
                openRate: stats.totalSent > 0 ? (stats.totalOpened / stats.totalSent) * 100 : 0,
                clickRate: stats.totalSent > 0 ? (stats.totalClicked / stats.totalSent) * 100 : 0,
                replyRate: stats.totalSent > 0 ? (stats.totalReplied / stats.totalSent) * 100 : 0
            };

            await campaign.save();
            return campaign;
        } catch (error) {
            console.error('Error syncing campaign stats:', error);
            throw error;
        }
    }

    async syncAllCampaigns() {
        try {
            const campaigns = await Campaign.find();
            for (const campaign of campaigns) {
                await this.syncCampaignStats(campaign._id.toString());
            }
        } catch (error) {
            console.error('Error syncing all campaigns:', error);
        }
    }
}

export const campaignStatsSync = new CampaignStatsSync();
