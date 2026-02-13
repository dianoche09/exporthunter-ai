#!/bin/bash

echo "📧 Email Service (Resend) oluşturuluyor..."

cd exporthunter-ai/backend

# ===========================================
# EMAIL SERVICE - Resend Integration
# ===========================================

cat > src/services/email/resendService.ts << 'RESEND'
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export class ResendService {
  /**
   * Send single email
   */
  async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { to, subject, html, from } = params;

      const result = await resend.emails.send({
        from: from || process.env.EMAIL_FROM || 'ExportHunter <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      });

      return {
        success: true,
        messageId: result.data?.id,
      };
    } catch (error: any) {
      console.error('Resend Email Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Send batch emails (with rate limiting)
   */
  async sendBatchEmails(params: {
    emails: Array<{
      to: string;
      subject: string;
      html: string;
    }>;
    delayMs?: number;
  }): Promise<{
    success: number;
    failed: number;
    results: Array<{ email: string; success: boolean; messageId?: string; error?: string }>;
  }> {
    const { emails, delayMs = 1000 } = params;
    const results: Array<any> = [];
    let success = 0;
    let failed = 0;

    for (const email of emails) {
      const result = await this.sendEmail({
        to: email.to,
        subject: email.subject,
        html: email.html,
      });

      results.push({
        email: email.to,
        ...result,
      });

      if (result.success) {
        success++;
      } else {
        failed++;
      }

      // Rate limiting delay
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return {
      success,
      failed,
      results,
    };
  }

  /**
   * Send campaign email with tracking
   */
  async sendCampaignEmail(params: {
    to: string;
    subject: string;
    body: string;
    campaignId: string;
    leadId: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { to, subject, body, campaignId, leadId } = params;

    // Add tracking pixel
    const trackingPixel = `<img src="${process.env.FRONTEND_URL}/api/track/open/${campaignId}/${leadId}" width="1" height="1" style="display:none" />`;

    // Convert links to tracked links
    const htmlWithTracking = this.addLinkTracking(body, campaignId, leadId);

    const html = `
      ${htmlWithTracking}
      ${trackingPixel}
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Add tracking to links
   */
  private addLinkTracking(html: string, campaignId: string, leadId: string): string {
    // Simple link tracking - can be enhanced
    return html.replace(
      /<a\s+href="([^"]+)"/g,
      `<a href="${process.env.FRONTEND_URL}/api/track/click/${campaignId}/${leadId}?url=$1"`
    );
  }

  /**
   * Validate email address
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Create HTML email template
   */
  createEmailTemplate(params: {
    subject: string;
    body: string;
    companyName: string;
    senderName: string;
  }): string {
    const { body, companyName, senderName } = params;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email from ${companyName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      border-bottom: 2px solid #0ea5e9;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .content {
      white-space: pre-wrap;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
    .signature {
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0; color: #0ea5e9;">${companyName}</h2>
  </div>
  
  <div class="content">
    ${body.replace(/\n/g, '<br>')}
  </div>
  
  <div class="signature">
    <p>Best regards,<br>
    <strong>${senderName}</strong><br>
    ${companyName}</p>
  </div>
  
  <div class="footer">
    <p>This email was sent by ${companyName}. If you wish to unsubscribe, please reply with "UNSUBSCRIBE".</p>
  </div>
</body>
</html>
    `;
  }
}

export const resendService = new ResendService();
RESEND

# ===========================================
# EMAIL ACTIVITY MODEL
# ===========================================

cat > src/models/EmailActivity.ts << 'EMAILACTIVITY'
import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailActivity extends Document {
  campaignId: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed';
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  repliedAt?: Date;
  messageId?: string;
  errorMessage?: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

const emailActivitySchema = new Schema<IEmailActivity>({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['sent', 'opened', 'clicked', 'replied', 'bounced', 'failed'],
    default: 'sent'
  },
  sentAt: { type: Date },
  openedAt: { type: Date },
  clickedAt: { type: Date },
  repliedAt: { type: Date },
  messageId: { type: String },
  errorMessage: { type: String },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

emailActivitySchema.index({ campaignId: 1, leadId: 1 });
emailActivitySchema.index({ status: 1 });

export const EmailActivity = mongoose.model<IEmailActivity>('EmailActivity', emailActivitySchema);
EMAILACTIVITY

# ===========================================
# CAMPAIGNS CONTROLLER
# ===========================================

cat > src/controllers/campaignsController.ts << 'CAMPAIGNS'
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Campaign } from '../models/Campaign';
import { Lead } from '../models/Lead';
import { EmailActivity } from '../models/EmailActivity';
import { resendService } from '../services/email/resendService';

export const getCampaigns = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const campaigns = await Campaign.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Campaign.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        campaigns,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const createCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { name, subject, body, leadIds } = req.body;

    if (!name || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, subject, body'
      });
    }

    const campaign = await Campaign.create({
      userId,
      name,
      subject,
      body,
      leads: leadIds || [],
      status: 'draft',
      stats: {
        totalRecipients: leadIds?.length || 0,
        sentCount: 0,
        openedCount: 0,
        clickedCount: 0,
        repliedCount: 0
      }
    });

    res.status(201).json({
      success: true,
      data: { campaign },
      message: 'Campaign created successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const sendCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const campaign = await Campaign.findOne({ _id: id, userId });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    if (campaign.status === 'sending' || campaign.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Campaign already sent or in progress'
      });
    }

    // Update status
    campaign.status = 'sending';
    await campaign.save();

    // Get leads
    const leads = await Lead.find({
      _id: { $in: campaign.leads },
      userId
    });

    // Send emails
    const emailPromises = leads.map(async (lead) => {
      const result = await resendService.sendCampaignEmail({
        to: lead.email,
        subject: campaign.subject,
        body: campaign.body,
        campaignId: campaign._id.toString(),
        leadId: lead._id.toString()
      });

      // Create email activity
      await EmailActivity.create({
        campaignId: campaign._id,
        leadId: lead._id,
        userId,
        status: result.success ? 'sent' : 'failed',
        sentAt: result.success ? new Date() : undefined,
        messageId: result.messageId,
        errorMessage: result.error,
        metadata: {}
      });

      return result;
    });

    const results = await Promise.all(emailPromises);

    // Update campaign stats
    const successCount = results.filter(r => r.success).length;
    campaign.stats.sentCount = successCount;
    campaign.status = 'completed';
    await campaign.save();

    res.json({
      success: true,
      data: {
        campaign,
        sent: successCount,
        failed: results.length - successCount
      },
      message: `Campaign sent to ${successCount} leads`
    });
  } catch (error: any) {
    console.error('Send Campaign Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send campaign'
    });
  }
};

export const getCampaignStats = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const campaign = await Campaign.findOne({ _id: id, userId });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    const activities = await EmailActivity.find({ campaignId: id });

    const stats = {
      sent: activities.filter(a => a.status === 'sent' || a.openedAt).length,
      opened: activities.filter(a => a.openedAt).length,
      clicked: activities.filter(a => a.clickedAt).length,
      replied: activities.filter(a => a.repliedAt).length,
      failed: activities.filter(a => a.status === 'failed').length,
      openRate: 0,
      clickRate: 0
    };

    if (stats.sent > 0) {
      stats.openRate = Math.round((stats.opened / stats.sent) * 100);
      stats.clickRate = Math.round((stats.clicked / stats.sent) * 100);
    }

    res.json({
      success: true,
      data: {
        campaign,
        stats,
        activities
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
CAMPAIGNS

# ===========================================
# UPDATE CAMPAIGNS ROUTES
# ===========================================

cat > src/routes/campaigns.ts << 'CAMPAIGNSROUTE'
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getCampaigns,
  createCampaign,
  sendCampaign,
  getCampaignStats
} from '../controllers/campaignsController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getCampaigns);
router.post('/', createCampaign);
router.post('/:id/send', sendCampaign);
router.get('/:id/stats', getCampaignStats);

export { router as campaignsRouter };
CAMPAIGNSROUTE

# ===========================================
# EMAIL TRACKING ROUTES
# ===========================================

cat > src/routes/tracking.ts << 'TRACKING'
import { Router } from 'express';
import { EmailActivity } from '../models/EmailActivity';

const router = Router();

// Track email opens (pixel)
router.get('/open/:campaignId/:leadId', async (req, res) => {
  try {
    const { campaignId, leadId } = req.params;

    await EmailActivity.findOneAndUpdate(
      { campaignId, leadId, status: 'sent' },
      {
        status: 'opened',
        openedAt: new Date()
      }
    );

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

    // Redirect to original URL
    res.redirect(url as string);
  } catch (error) {
    res.status(500).send('Tracking error');
  }
});

export { router as trackingRouter };
TRACKING

# ===========================================
# UPDATE SERVER.TS TO INCLUDE TRACKING
# ===========================================

cat >> src/server.ts << 'SERVERUPDATE'

// Add tracking routes (before other routes)
import { trackingRouter } from './routes/tracking';
app.use('/api/track', trackingRouter);
SERVERUPDATE

echo ""
echo "✅ Email Service hazır!"
echo ""
echo "📧 Özellikler:"
echo "  - Single email gönderimi"
echo "  - Batch email (toplu gönderim)"
echo "  - Campaign emails (tracking ile)"
echo "  - Email tracking (opens, clicks)"
echo "  - HTML email templates"
echo "  - Rate limiting"
echo ""
echo "📊 API Endpoints:"
echo "  GET  /api/campaigns - Liste"
echo "  POST /api/campaigns - Oluştur"
echo "  POST /api/campaigns/:id/send - Gönder"
echo "  GET  /api/campaigns/:id/stats - İstatistikler"
echo ""
echo "🔍 Tracking:"
echo "  GET /api/track/open/:campaignId/:leadId - Open tracking"
echo "  GET /api/track/click/:campaignId/:leadId - Click tracking"
echo ""
