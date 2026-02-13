#!/bin/bash

echo "🎯 Final Features ekleniyor..."

cd exporthunter-ai/backend

# ===========================================
# 1. DASHBOARD STATS API
# ===========================================

cat > src/controllers/statsController.ts << 'STATS'
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
          leadName: activity.leadId?.companyName || 'Unknown',
          campaignName: activity.campaignId?.name || 'Unknown',
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
STATS

cat > src/routes/stats.ts << 'STATSROUTE'
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getDashboardStats } from '../controllers/statsController';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', getDashboardStats);

export { router as statsRouter };
STATSROUTE

# ===========================================
# 2. CAMPAIGN STATS SYNC (Fix Tracking)
# ===========================================

cat > src/services/campaign/statsSync.ts << 'STATSSYNC'
import { Campaign } from '../../models/Campaign';
import { EmailActivity } from '../../models/EmailActivity';

export class CampaignStatsSync {
  /**
   * Update campaign stats from email activities
   */
  async syncCampaignStats(campaignId: string): Promise<void> {
    try {
      const activities = await EmailActivity.find({ campaignId });

      const stats = {
        sentCount: activities.filter(a => a.sentAt).length,
        openedCount: activities.filter(a => a.openedAt).length,
        clickedCount: activities.filter(a => a.clickedAt).length,
        repliedCount: activities.filter(a => a.repliedAt).length,
        totalRecipients: activities.length
      };

      await Campaign.findByIdAndUpdate(campaignId, {
        'stats.sentCount': stats.sentCount,
        'stats.openedCount': stats.openedCount,
        'stats.clickedCount': stats.clickedCount,
        'stats.repliedCount': stats.repliedCount,
        'stats.totalRecipients': stats.totalRecipients
      });
    } catch (error) {
      console.error('Campaign Stats Sync Error:', error);
    }
  }

  /**
   * Sync all campaigns
   */
  async syncAllCampaigns(): Promise<void> {
    try {
      const campaigns = await Campaign.find({ status: 'completed' });

      for (const campaign of campaigns) {
        await this.syncCampaignStats(campaign._id.toString());
      }
    } catch (error) {
      console.error('Sync All Campaigns Error:', error);
    }
  }
}

export const campaignStatsSync = new CampaignStatsSync();
STATSSYNC

# Update tracking routes to sync stats
cat > src/routes/tracking.ts << 'TRACKINGROUTE'
import { Router } from 'express';
import { EmailActivity } from '../models/EmailActivity';
import { campaignStatsSync } from '../services/campaign/statsSync';

const router = Router();

// Track email opens (pixel)
router.get('/open/:campaignId/:leadId', async (req, res) => {
  try {
    const { campaignId, leadId } = req.params;

    await EmailActivity.findOneAndUpdate(
      { campaignId, leadId, openedAt: { $exists: false } },
      {
        status: 'opened',
        openedAt: new Date()
      }
    );

    // Sync campaign stats
    await campaignStatsSync.syncCampaignStats(campaignId);

    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length
    });
    res.end(pixel);
  } catch (error) {
    res.status(500).end();
  }
});

// Track link clicks
router.get('/click/:campaignId/:leadId', async (req, res) => {
  try {
    const { campaignId, leadId } = req.params;
    const { url } = req.query;

    await EmailActivity.findOneAndUpdate(
      { campaignId, leadId },
      {
        status: 'clicked',
        clickedAt: new Date()
      }
    );

    // Sync campaign stats
    await campaignStatsSync.syncCampaignStats(campaignId);

    // Redirect to original URL
    res.redirect(url as string);
  } catch (error) {
    res.status(500).send('Tracking error');
  }
});

export { router as trackingRouter };
TRACKINGROUTE

# ===========================================
# 3. PROFESSIONAL EMAIL TEMPLATES
# ===========================================

cat > src/services/email/templates.ts << 'TEMPLATES'
export class EmailTemplates {
  /**
   * Professional template with company branding
   */
  professional(params: {
    subject: string;
    body: string;
    companyName: string;
    senderName: string;
    recipientName?: string;
    language?: 'en' | 'tr';
  }): string {
    const { subject, body, companyName, senderName, recipientName, language = 'en' } = params;

    const greeting = language === 'tr' 
      ? `Sayın ${recipientName || 'Yetkili'},`
      : `Dear ${recipientName || 'Sir/Madam'},`;

    const footer = language === 'tr'
      ? 'Bu e-posta size tanıtım amaçlı gönderilmiştir. Listeden çıkmak için lütfen "KALDIRIN" yazarak yanıt verin.'
      : 'This email was sent to you for promotional purposes. To unsubscribe, please reply with "UNSUBSCRIBE".';

    return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">${companyName}</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                ${greeting}
              </p>
              
              <div style="color: #374151; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">
${body}
              </div>
              
              <!-- CTA Button (optional) -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                <tr>
                  <td align="center">
                    <a href="#" style="display: inline-block; padding: 14px 32px; background-color: #0ea5e9; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
                      ${language === 'tr' ? 'İletişime Geçin' : 'Get in Touch'}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Signature -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 2px solid #e5e7eb; padding-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      ${language === 'tr' ? 'Saygılarımla' : 'Best regards'},<br>
                      <strong style="color: #1f2937;">${senderName}</strong><br>
                      <span style="color: #9ca3af;">${companyName}</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.6; text-align: center;">
                ${footer}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Minimal clean template
   */
  minimal(params: {
    body: string;
    companyName: string;
    senderName: string;
  }): string {
    const { body, companyName, senderName } = params;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto;">
    <div style="color: #1f2937; font-size: 15px; line-height: 1.8; white-space: pre-wrap; margin-bottom: 30px;">
${body}
    </div>
    
    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        ${senderName}<br>
        ${companyName}
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }
}

export const emailTemplates = new EmailTemplates();
TEMPLATES

# Update resendService to use templates
cat >> src/services/email/resendService.ts << 'RESENDUPDATE'

  /**
   * Send with professional template
   */
  async sendWithTemplate(params: {
    to: string;
    subject: string;
    body: string;
    senderName: string;
    companyName: string;
    recipientName?: string;
    language?: 'en' | 'tr';
    template?: 'professional' | 'minimal';
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { template = 'professional', ...rest } = params;

    const html = template === 'professional'
      ? emailTemplates.professional(rest)
      : emailTemplates.minimal(rest);

    return this.sendEmail({
      to: rest.to,
      subject: rest.subject,
      html
    });
  }
RESENDUPDATE

echo ""
echo "✅ Part 1/2 tamamlandı!"
echo ""
