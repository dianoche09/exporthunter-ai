import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { geminiService } from '../services/ai/geminiService';
import { Lead } from '../models/Lead';

export const discoverLeads = async (req: AuthRequest, res: Response) => {
  try {
    const { product, targetMarkets, industry, count } = req.body;
    const userId = req.user._id;

    if (!product || !targetMarkets || !industry) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: product, targetMarkets, industry',
      });
    }

    // Use batch if count > 10
    const discoveredLeads = count && count > 10
      ? await geminiService.discoverLeadsBatch({ product, targetMarkets, industry, count })
      : await geminiService.discoverLeads({ product, targetMarkets, industry });

    // Save leads to database
    const savedLeads = await Promise.all(
      discoveredLeads.map((lead) =>
        Lead.create({
          userId,
          companyName: lead.companyName,
          country: lead.country,
          city: lead.city || '',
          email: lead.email,
          website: lead.website || '',
          industry,
          source: 'ai-discovery',
          notes: lead.reason || '',
          aiScore: lead.aiScore || 0,
          status: 'new',
        })
      )
    );

    res.json({
      success: true,
      data: {
        leads: savedLeads,
        count: savedLeads.length,
      },
      message: `✨ Discovered ${savedLeads.length} potential leads with Gemini AI`,
    });
  } catch (error: any) {
    console.error('Discover Leads Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to discover leads',
    });
  }
};

export const generateEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, product, tone, language } = req.body;
    const senderCompany = req.user.company;

    if (!companyName || !product) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: companyName, product',
      });
    }

    const email = await geminiService.generateEmail({
      companyName,
      product,
      senderCompany,
      tone: tone || 'professional',
      language: language || 'en',
    });

    res.json({
      success: true,
      data: email,
    });
  } catch (error: any) {
    console.error('Generate Email Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate email',
    });
  }
};

export const analyzeResponse = async (req: AuthRequest, res: Response) => {
  try {
    const { emailContent } = req.body;

    if (!emailContent) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: emailContent',
      });
    }

    const analysis = await geminiService.analyzeResponse(emailContent);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error('Analyze Response Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze response',
    });
  }
};

export const improveEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { emailContent } = req.body;

    if (!emailContent) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: emailContent',
      });
    }

    const improved = await geminiService.improveEmail(emailContent);

    res.json({
      success: true,
      data: {
        improvedEmail: improved,
      },
    });
  } catch (error: any) {
    console.error('Improve Email Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to improve email',
    });
  }
};

export const generateFollowUp = async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, previousEmail, daysSince } = req.body;

    if (!companyName || !previousEmail || !daysSince) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    const followUp = await geminiService.generateFollowUp({
      companyName,
      previousEmail,
      daysSince: Number(daysSince),
    });

    res.json({
      success: true,
      data: {
        followUpEmail: followUp,
      },
    });
  } catch (error: any) {
    console.error('Generate Follow-up Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate follow-up',
    });
  }
};
