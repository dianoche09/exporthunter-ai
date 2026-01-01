import { EmailActivity } from '../../models/EmailActivity';
import { Campaign } from '../../models/Campaign';
import { Lead } from '../../models/Lead';
import { geminiService } from '../ai/geminiService';
import { resendService } from './resendService';
import { emailTemplates } from './templates';

/**
 * Auto Follow-Up Service
 * - Day 4: First follow-up email
 * - Day 11: Second follow-up email
 * - Only sends to unopened emails
 * - Runs every 6 hours
 */
export class FollowUpService {
    private intervalId: NodeJS.Timeout | null = null;

    /**
     * Start the auto follow-up scheduler
     * Checks every 6 hours
     */
    start() {
        if (this.intervalId) {
            console.log('⚠️  Follow-up service already running');
            return;
        }

        console.log('🚀 Starting auto follow-up service...');

        // Run immediately on start
        this.processFollowUps();

        // Then run every 6 hours (6 * 60 * 60 * 1000 ms)
        this.intervalId = setInterval(() => {
            this.processFollowUps();
        }, 6 * 60 * 60 * 1000);

        console.log('✅ Auto follow-up service started (runs every 6 hours)');
    }

    /**
     * Stop the auto follow-up scheduler
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('⏹️  Auto follow-up service stopped');
        }
    }

    /**
     * Process all pending follow-ups
     */
    async processFollowUps() {
        try {
            console.log('🔄 Processing follow-ups...');

            const now = new Date();
            const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
            const elevenDaysAgo = new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000);

            // Find emails that need follow-up 1 (sent 4+ days ago, not opened, no follow-up sent)
            const followUp1Candidates = await EmailActivity.find({
                sentAt: { $lte: fourDaysAgo },
                openedAt: null,
                followUp1SentAt: null,
                status: 'sent'
            }).populate('campaignId').populate('leadId');

            // Find emails that need follow-up 2 (sent 11+ days ago, not opened, follow-up 1 sent, no follow-up 2 sent)
            const followUp2Candidates = await EmailActivity.find({
                sentAt: { $lte: elevenDaysAgo },
                openedAt: null,
                followUp1SentAt: { $ne: null },
                followUp2SentAt: null,
                status: 'sent'
            }).populate('campaignId').populate('leadId');

            console.log(`📬 Found ${followUp1Candidates.length} emails for Follow-Up 1`);
            console.log(`📬 Found ${followUp2Candidates.length} emails for Follow-Up 2`);

            // Send follow-up 1
            for (const activity of followUp1Candidates) {
                await this.sendFollowUp(activity, 1);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
            }

            // Send follow-up 2
            for (const activity of followUp2Candidates) {
                await this.sendFollowUp(activity, 2);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
            }

            console.log('✅ Follow-ups processed successfully');
        } catch (error) {
            console.error('❌ Error processing follow-ups:', error);
        }
    }

    /**
     * Send a single follow-up email
     */
    private async sendFollowUp(activity: any, followUpNumber: 1 | 2) {
        try {
            const campaign = activity.campaignId;
            const lead = activity.leadId;

            if (!campaign || !lead) {
                console.error('❌ Campaign or lead not found for activity:', activity._id);
                return;
            }

            console.log(`📧 Sending Follow-Up ${followUpNumber} to ${lead.email}...`);

            // Generate AI follow-up content
            const followUpContent = await this.generateFollowUpContent({
                originalSubject: campaign.subject,
                originalBody: campaign.body,
                companyName: lead.companyName,
                followUpNumber,
                language: 'en' // TODO: Get from user preferences
            });

            // Send email using the same template as original campaign
            const html = emailTemplates.professional({
                subject: followUpContent.subject,
                body: followUpContent.body,
                companyName: process.env.COMPANY_NAME || 'ExportHunter',
                senderName: process.env.SENDER_NAME || 'ExportHunter Team',
                recipientName: lead.companyName,
                language: 'en'
            });

            const result = await resendService.sendEmail({
                to: lead.email,
                subject: followUpContent.subject,
                html
            });

            if (result.success) {
                // Update activity
                const updateField = followUpNumber === 1 ? 'followUp1SentAt' : 'followUp2SentAt';
                await EmailActivity.findByIdAndUpdate(activity._id, {
                    [updateField]: new Date()
                });

                console.log(`✅ Follow-Up ${followUpNumber} sent to ${lead.email}`);
            } else {
                console.error(`❌ Failed to send Follow-Up ${followUpNumber} to ${lead.email}:`, result.error);
            }
        } catch (error) {
            console.error(`❌ Error sending follow-up:`, error);
        }
    }

    /**
     * Generate AI follow-up content
     */
    private async generateFollowUpContent(params: {
        originalSubject: string;
        originalBody: string;
        companyName: string;
        followUpNumber: 1 | 2;
        language: 'en' | 'tr';
    }): Promise<{ subject: string; body: string }> {
        const { originalSubject, originalBody, companyName, followUpNumber, language } = params;

        try {
            const prompt = language === 'tr'
                ? `Sen bir B2B satış uzmanısın. ${followUpNumber}. takip emailini oluştur.

Orijinal konu: ${originalSubject}
Orijinal mesaj: ${originalBody}
Alıcı firma: ${companyName}

${followUpNumber === 1
                    ? 'İlk takip emaili olduğu için nazik ve hatırlatıcı bir ton kullan. Önceki mesajımıza atıfta bulun ve değer sunduğumuzu vurgula.'
                    : 'İkinci takip emaili olduğu için daha kısa ve direkt ol. Son şans mesajı olduğunu ima et ama yine de profesyonel kal.'}

Sadece JSON formatında döndür:
{
  "subject": "takip email konusu",
  "body": "takip email içeriği (3-4 paragraf, kısa ve etkili)"
}`
                : `You are a B2B sales expert. Generate follow-up email #${followUpNumber}.

Original subject: ${originalSubject}
Original message: ${originalBody}
Recipient company: ${companyName}

${followUpNumber === 1
                    ? 'As this is the first follow-up, use a polite and gentle reminder tone. Reference our previous message and emphasize the value we offer.'
                    : 'As this is the second follow-up, be shorter and more direct. Imply this is a final attempt but remain professional.'}

Return ONLY in JSON format:
{
  "subject": "follow-up email subject",
  "body": "follow-up email content (3-4 paragraphs, short and impactful)"
}`;

            const response = await geminiService.generateText(prompt);

            // Parse JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed;
            }

            // Fallback if AI doesn't return JSON
            return this.getDefaultFollowUp(followUpNumber, language);
        } catch (error) {
            console.error('❌ Error generating AI follow-up:', error);
            return this.getDefaultFollowUp(followUpNumber, language);
        }
    }

    /**
     * Get default follow-up template (fallback)
     */
    private getDefaultFollowUp(followUpNumber: 1 | 2, language: 'en' | 'tr'): { subject: string; body: string } {
        if (language === 'tr') {
            if (followUpNumber === 1) {
                return {
                    subject: 'Takip: Önceki mesajım',
                    body: `Merhaba,

Geçen hafta gönderdiğim mesajımı takip etmek istedim. Şirketiniz için değerli bir çözüm sunabileceğimizi düşünüyorum.

Eğer ilgileniyorsanız, kısa bir görüşme ayarlayabilir miyiz?

Saygılarımla`
                };
            } else {
                return {
                    subject: 'Son hatırlatma',
                    body: `Merhaba,

Bu son hatırlatma mesajım. Eğer ilginiz varsa lütfen bana geri dönün.

Aksi takdirde sizi rahatsız etmeyeceğim.

Teşekkürler`
                };
            }
        } else {
            if (followUpNumber === 1) {
                return {
                    subject: 'Following up on my previous email',
                    body: `Hi there,

I wanted to follow up on the message I sent last week. I believe we can provide valuable solutions for your company.

Would you be interested in a quick call to discuss?

Best regards`
                };
            } else {
                return {
                    subject: 'Final reminder',
                    body: `Hi,

This is my final reminder. If you're interested, please let me know.

Otherwise, I won't bother you again.

Thanks`
                };
            }
        }
    }

    /**
     * Manually trigger follow-up for a specific campaign
     */
    async triggerCampaignFollowUp(campaignId: string, followUpNumber: 1 | 2) {
        try {
            const activities = await EmailActivity.find({
                campaignId,
                openedAt: null,
                status: 'sent',
                ...(followUpNumber === 1
                    ? { followUp1SentAt: null }
                    : { followUp1SentAt: { $ne: null }, followUp2SentAt: null }
                )
            }).populate('leadId');

            console.log(`📧 Triggering Follow-Up ${followUpNumber} for ${activities.length} emails...`);

            for (const activity of activities) {
                await this.sendFollowUp(activity, followUpNumber);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            return {
                success: true,
                sent: activities.length
            };
        } catch (error: any) {
            console.error('❌ Error triggering campaign follow-up:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export const followUpService = new FollowUpService();
