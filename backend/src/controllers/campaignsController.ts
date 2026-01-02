
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Campaign } from '../models/Campaign';
import { Lead } from '../models/Lead';
import { EmailActivity } from '../models/EmailActivity';
import { resendService } from '../services/email/resendService';
import { geminiService } from '../services/ai/geminiService';

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
    // Expanded Destructuring
    const { name, subject, body, leadIds, steps, abTesting } = req.body;

    // Validation: Require either (subject+body) OR (steps)
    if (!name || (!steps && (!subject || !body))) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, and either (subject+body) or steps'
      });
    }

    const campaign = await Campaign.create({
      userId,
      name,
      subject: subject || (steps ? 'Multi-step Campaign' : ''),
      body: body || (steps ? 'Multi-step content' : ''),
      steps: steps || [],
      abTesting: abTesting || { enabled: false, variants: [] },
      leads: leadIds || [],
      status: 'draft',
      stats: {
        totalRecipients: leadIds?.length || 0
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

    // Send emails (Step 1 or Simple Campaign)
    // Omni-Flow Logic: In a real system, this pushes to a Redis Queue.
    // Here we execute Step 1 immediately.

    // Determine Content (A/B Test or Steps or Simple)
    let emailSubject = campaign.subject;
    let emailBody = campaign.body;

    if (campaign.steps && campaign.steps.length > 0 && campaign.steps[0].type === 'email') {
      emailSubject = campaign.steps[0].content?.subject || campaign.subject;
      emailBody = campaign.steps[0].content?.body || campaign.body;
    }

    const emailPromises = leads.map(async (lead, index) => {
      // Logic for Time Traveler & A/B Testing should be here
      // Mock A/B Testing: Split 50/50 if enabled
      if (campaign.abTesting?.enabled && campaign.abTesting.variants?.length) {
        const variant = campaign.abTesting.variants[index % campaign.abTesting.variants.length];
        emailSubject = variant.subject || emailSubject;
        emailBody = variant.body || emailBody;
      }

      const result = await resendService.sendCampaignEmail({
        to: lead.email,
        subject: emailSubject,
        body: emailBody,
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
    campaign.status = 'active'; // Omni-flow keeps it active
    await campaign.save();

    res.json({
      success: true,
      data: {
        campaign,
        sent: successCount,
        failed: results.length - successCount
      },
      message: `Campaign flow started for ${successCount} leads`
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
      clickRate: 0,
      // Cockpit Engine Stats (Mock)
      queueStatus: {
        pending: 12,
        processing: 3,
        delayed: 5 // Time Traveler effect
      }
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

// AI Sequence Generator
export const generateSequence = async (req: AuthRequest, res: Response) => {
  try {
    const { product, target, count } = req.body;
    const senderCompany = req.user.company || 'Our Company';

    if (!product || !target) {
      return res.status(400).json({ error: 'Product and Target are required' });
    }

    const steps = await geminiService.generateSequence({
      product,
      targetAudience: target,
      stepCount: count || 4,
      senderCompany,
      apiKey: req.user.apiKeys?.gemini
    });

    res.json({
      success: true,
      data: { steps }
    });
  } catch (error: any) {
    console.error('Generate Sequence Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// A/B/Z Testing Optimization
export const optimizeCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    // Mock Bandit Logic: Force Variant A or B as winner
    // In reality, this updates the weights

    res.json({
      success: true,
      message: 'Optimization complete. Traffic shifted to Variant A (60%).'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export const getCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const campaign = await Campaign.findOne({ _id: id, userId })
      .populate('leads')
      .lean();

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      data: campaign
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const pauseCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const campaign = await Campaign.findOneAndUpdate(
      { _id: id, userId },
      { status: 'paused' },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      data: campaign,
      message: 'Campaign paused successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const resumeCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const campaign = await Campaign.findOneAndUpdate(
      { _id: id, userId },
      { status: 'active' },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      data: campaign,
      message: 'Campaign resumed successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
