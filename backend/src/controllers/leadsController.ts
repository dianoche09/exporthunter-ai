
import { Response } from 'express';
import { Lead } from '../models/Lead';
import { AuthRequest } from '../middleware/auth';
import { geminiService } from '../services/ai/geminiService';
import { User } from '../models/User';
import { Activity, SearchHistory } from '../models/Core';

export const getLeads = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status, search, min_score, sort } = req.query;
    const userId = req.user._id;

    const query: any = { userId };

    if (status && status !== 'all') query.status = status;

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } }
      ];
    }

    if (min_score) {
      query.aiScore = { $gte: Number(min_score) };
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'score_desc') sortOption = { aiScore: -1 };
    else if (sort === 'score_asc') sortOption = { aiScore: 1 };
    else if (sort === 'companyName_asc') sortOption = { companyName: 1 };
    else if (sort === 'companyName_desc') sortOption = { companyName: -1 };

    const leads = await Lead.find(query)
      .sort(sortOption)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Lead.countDocuments(query);

    res.json({
      success: true,
      data: {
        leads,
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

export const getLeadStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;

    const [total, highPotential, activeDeals, topTargets] = await Promise.all([
      Lead.countDocuments({ userId }),
      Lead.countDocuments({ userId, aiScore: { $gt: 75 } }),
      Lead.countDocuments({ userId, status: { $in: ['contacted', 'negotiating', 'interested', 'qualified'] } }),
      Lead.find({ userId })
        .sort({ createdAt: -1, aiScore: -1 })
        .limit(5)
        .select('companyName aiScore country status')
    ]);

    res.json({
      success: true,
      data: {
        total,
        highPotential,
        activeDeals,
        topTargets
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createLead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const leadData = { ...req.body, userId };

    const lead = await Lead.create(leadData);

    res.status(201).json({
      success: true,
      data: { lead }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateLead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const lead = await Lead.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: { lead }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteLead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const lead = await Lead.findOneAndDelete({ _id: id, userId });

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Discover multiple leads using AI batch processing
 * Handles Credits, Tagging, and History Logging
 */
export const discoverLeadsBatch = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { product, targetMarkets, industry, count = 20, groupName, preview = false } = req.body;

    if (!product || !targetMarkets || !industry) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: product, targetMarkets, industry'
      });
    }

    // 1. Credit Check Logic
    const user = await User.findById(userId);
    const currentCredits = user?.credits ?? 0; // Default to 0 if undefined

    // Check credits only if not in preview mode
    if (!preview && currentCredits < count) {
      return res.status(402).json({
        success: false,
        error: `Insufficient credits. You have ${currentCredits} credits, but this action requires ${count}. Please upgrade your plan.`
      });
    }

    // Call Gemini AI
    const userProductGroups = req.user.productGroups || [];

    const discoveredLeads = await geminiService.discoverLeadsBatch({
      product,
      targetMarkets: Array.isArray(targetMarkets) ? targetMarkets : [targetMarkets],
      industry,
      count,
      apiKey: req.user.apiKeys?.gemini,
      userProductGroups
    });

    if (!discoveredLeads || discoveredLeads.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No leads discovered. Try different parameters.'
      });
    }

    if (preview) {
      return res.json({
        success: true,
        data: {
          leads: discoveredLeads.map(lead => ({
            ...lead,
            industry,
            tags: [...(Array.isArray(targetMarkets) ? targetMarkets : [targetMarkets]), groupName].filter(Boolean)
          })),
          stats: { discovered: discoveredLeads.length }
        }
      });
    }

    // 2. Format and Save Logic with Smart Tagging
    const savedLeads = [];
    const errors = [];

    const markets = Array.isArray(targetMarkets) ? targetMarkets : [targetMarkets];
    // Create Smart Tags: #Source:AI_Discovery #Product:RDP #Market:Germany
    const smartTags = [
      `Source:AI_Discovery`,
      `Product:${product}`,
      ...markets.map((m: string) => `Market:${m}`),
      industry,
      groupName
    ].filter(Boolean);

    for (const discoveredLead of discoveredLeads) {
      try {
        const leadData = {
          userId,
          companyName: discoveredLead.companyName,
          country: discoveredLead.country,
          city: discoveredLead.city || '',
          email: discoveredLead.email,
          website: discoveredLead.website || '',
          industry,
          status: 'new' as const,
          source: 'ai-discovery' as const,
          tags: smartTags,
          notes: discoveredLead.logic || discoveredLead.reason || '',
          aiScore: discoveredLead.aiScore || 0,
          aiReasoning: discoveredLead.logic || discoveredLead.reason,
          potentialProducts: discoveredLead.potentialProducts || [],
          emailSource: discoveredLead.emailSource || 'website',
          validationStatus: discoveredLead.emailSource === 'predicted' ? 'unknown' : 'valid'
        };

        const lead = await Lead.create(leadData);
        savedLeads.push(lead);
      } catch (error: any) {
        errors.push({
          company: discoveredLead.companyName,
          error: error.message
        });
      }
    }

    // 3. Post-Save Transaction (Deduct Credits, Log Activity, Save History)
    if (savedLeads.length > 0 && user) {
      // Deduct available credits
      user.credits = Math.max(0, user.credits - savedLeads.length);
      await user.save();

      // Log Activity
      await Activity.create({
        userId,
        type: 'lead_discovery',
        description: `Discovered and saved ${savedLeads.length} leads for ${product}`,
        metadata: { product, markets: targetMarkets }
      });

      // Save Search History
      await SearchHistory.create({
        userId,
        query: { product, industries: [industry], markets: targetMarkets },
        resultCount: savedLeads.length
      });
    }

    res.status(201).json({
      success: true,
      data: {
        leads: savedLeads,
        stats: {
          discovered: discoveredLeads.length,
          saved: savedLeads.length,
          failed: errors.length,
          remainingCredits: user?.credits
        },
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error: any) {
    console.error('Batch discovery error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to discover leads'
    });
  }
};

export const createLeadsBulk = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { leads } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ success: false, error: 'No leads provided' });
    }

    const savedLeads = [];
    const errors = [];

    for (const leadData of leads) {
      try {
        const finalLead = {
          ...leadData,
          userId,
          status: 'new',
          source: 'ai-discovery'
        };

        const saved = await Lead.create(finalLead);
        savedLeads.push(saved);
      } catch (err: any) {
        errors.push({ company: leadData.companyName, error: err.message });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        leads: savedLeads,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSupplyChainIntel = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const lead = await Lead.findOne({ _id: id, userId });
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    const senderCountry = req.user.country || 'Turkey';

    // We use the industry or product if saved in lead
    const product = lead.industry || 'Global Trade Products';

    const intel = await geminiService.getSupplyChainIntel({
      product,
      origin: senderCountry,
      target: lead.country,
      apiKey: req.user.apiKeys?.gemini
    });

    res.json({
      success: true,
      data: intel
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
