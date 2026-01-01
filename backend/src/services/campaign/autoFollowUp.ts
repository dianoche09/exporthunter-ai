import { Campaign } from '../../models/Campaign';
import { Lead } from '../../models/Lead';
import { EmailActivity } from '../../models/EmailActivity';
import { resendService } from '../email/resendService';

class AutoFollowUpService {
    private schedulerRunning = false;
    private intervalId: NodeJS.Timeout | null = null;

    startScheduler() {
        if (this.schedulerRunning) {
            console.log('Auto follow-up scheduler already running');
            return;
        }

        this.schedulerRunning = true;

        // Run every hour
        this.intervalId = setInterval(() => {
            this.processFollowUps();
        }, 60 * 60 * 1000);

        // Run immediately on start
        this.processFollowUps();

        console.log('✅ Auto follow-up scheduler started');
    }

    stopScheduler() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.schedulerRunning = false;
        console.log('Auto follow-up scheduler stopped');
    }

    async processFollowUps() {
        try {
            console.log('Processing auto follow-ups...');

            // Get all active campaigns with follow-ups enabled
            const campaigns = await Campaign.find({
                status: 'active',
                'settings.followUpEnabled': true
            });

            for (const campaign of campaigns) {
                await this.processCampaignFollowUps(campaign);
            }

            console.log('Auto follow-ups processed successfully');
        } catch (error) {
            console.error('Error processing follow-ups:', error);
        }
    }

    async processCampaignFollowUps(campaign: any) {
        try {
            const now = new Date();

            // Get all email activities for this campaign
            const activities = await EmailActivity.find({
                campaignId: campaign._id,
                status: 'sent'
            }).populate('leadId');

            for (const activity of activities) {
                if (!activity.leadId || !activity.sentAt) continue;

                const daysSinceSent = Math.floor(
                    (now.getTime() - activity.sentAt.getTime()) / (1000 * 60 * 60 * 24)
                );

                // Follow-up on day 4 if not opened
                if (daysSinceSent === 4 && !activity.openedAt && !activity.followUp1SentAt) {
                    await this.sendFollowUp(campaign, activity, 1);
                }

                // Follow-up on day 11 if opened but not replied
                if (daysSinceSent === 11 && activity.openedAt && !activity.repliedAt && !activity.followUp2SentAt) {
                    await this.sendFollowUp(campaign, activity, 2);
                }
            }
        } catch (error) {
            console.error(`Error processing follow-ups for campaign ${campaign._id}:`, error);
        }
    }

    async sendFollowUp(campaign: any, activity: any, followUpNumber: number) {
        try {
            const lead = activity.leadId;

            // Build follow-up email
            const subject = followUpNumber === 1
                ? `Re: ${campaign.subject || campaign.name}`
                : `Following up - ${campaign.subject || campaign.name}`;

            const message = followUpNumber === 1
                ? `Hi there,\n\nI wanted to follow up on my previous email regarding ${campaign.name}.\n\nAre you interested in learning more?\n\nBest regards`
                : `Hi there,\n\nI noticed you viewed my previous email. I'd love to discuss how we can help your business.\n\nWould you be available for a quick call this week?\n\nBest regards`;

            // Send email
            await resendService.sendEmail({
                to: lead.email,
                subject,
                html: message.replace(/\n/g, '<br>')
            });

            // Update activity
            if (followUpNumber === 1) {
                activity.followUp1SentAt = new Date();
            } else {
                activity.followUp2SentAt = new Date();
            }
            await activity.save();

            console.log(`Sent follow-up ${followUpNumber} for lead ${lead.companyName}`);
        } catch (error) {
            console.error('Error sending follow-up:', error);
        }
    }
}

export const autoFollowUpService = new AutoFollowUpService();
