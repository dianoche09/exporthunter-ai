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
