import { Response } from 'express';
import { Lead } from '../models/Lead';
import { AuthRequest } from '../middleware/auth';
import { geminiService } from '../services/ai/geminiService';

export const getLeads = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const userId = req.user._id;

    const query: any = { userId };
    if (status) query.status = status;

    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
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
 */
export const discoverLeadsBatch = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { product, targetMarkets, industry, count = 20 } = req.body;

    // Validate required fields
    if (!product || !targetMarkets || !industry) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: product, targetMarkets, industry'
      });
    }

    // Validate targetMarkets is an array
    if (!Array.isArray(targetMarkets) || targetMarkets.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'targetMarkets must be a non-empty array'
      });
    }

    console.log(`🔍 Discovering ${count} leads for user ${userId}...`);
    console.log(`📦 Product: ${product}`);
    console.log(`🌍 Markets: ${targetMarkets.join(', ')}`);
    console.log(`🏭 Industry: ${industry}`);

    // Call Gemini AI to discover leads
    const discoveredLeads = await geminiService.discoverLeadsBatch({
      product,
      targetMarkets,
      industry,
      count
    });

    if (!discoveredLeads || discoveredLeads.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No leads discovered. Try different parameters.'
      });
    }

    // Format and save leads to database
    const savedLeads = [];
    const errors = [];

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
          tags: targetMarkets,
          notes: discoveredLead.reason || '',
          aiScore: discoveredLead.aiScore || 0
        };

        const lead = await Lead.create(leadData);
        savedLeads.push(lead);
        console.log(`✅ Saved lead: ${leadData.companyName}`);
      } catch (error: any) {
        console.error(`❌ Failed to save lead: ${discoveredLead.companyName}`, error.message);
        errors.push({
          company: discoveredLead.companyName,
          error: error.message
        });
      }
    }

    console.log(`🎉 Successfully saved ${savedLeads.length}/${discoveredLeads.length} leads`);

    res.status(201).json({
      success: true,
      data: {
        leads: savedLeads,
        stats: {
          discovered: discoveredLeads.length,
          saved: savedLeads.length,
          failed: errors.length
        },
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error: any) {
    console.error('❌ Batch discovery error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to discover leads'
    });
  }
};

