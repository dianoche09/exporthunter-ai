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
    const { companyName, product, tone, language, isTemplate } = req.body;
    const senderCompany = req.user.company;
    const geminiKey = req.user.apiKeys?.gemini;

    if (!product) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: product',
      });
    }

    if (!isTemplate && !companyName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: companyName (required for non-template emails)',
      });
    }

    const email = await geminiService.generateEmail({
      companyName: companyName || '',
      product,
      senderCompany,
      tone: tone || 'professional',
      language: language || 'English',
      isTemplate: !!isTemplate,
      apiKey: geminiKey
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

export const getDiscoverySuggestions = async (req: AuthRequest, res: Response) => {
  try {
    const { product, originCountry } = req.body;
    const geminiKey = req.user.apiKeys?.gemini;

    if (!product) {
      return res.status(400).json({ success: false, error: 'Product is required' });
    }

    const suggestions = await geminiService.suggestDiscoveryParams(
      product,
      originCountry || req.user.country || 'Global',
      geminiKey
    );
    res.json({ success: true, data: suggestions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getHsCodeSuggestions = async (req: AuthRequest, res: Response) => {
  try {
    const { product } = req.body;
    const geminiKey = req.user.apiKeys?.gemini;
    if (!product) return res.status(400).json({ success: false, error: 'Product name is required' });
    const suggestions = await geminiService.suggestHsCodes(product, geminiKey);
    res.json({ success: true, data: suggestions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const analyzeSupplyChain = async (req: AuthRequest, res: Response) => {
  try {
    const { product, origin, target } = req.body;
    if (!product || !target) return res.status(400).json({ success: false, error: 'Product and target are required' });

    const senderCountry = origin || req.user.country || 'Turkey';

    const data = await geminiService.getSupplyChainIntel({
      product,
      origin: senderCountry,
      target,
      apiKey: req.user.apiKeys?.gemini
    });

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const enrichLead = async (req: AuthRequest, res: Response) => {
  try {
    const { company, website, product } = req.body;
    if (!company || !product) return res.status(400).json({ success: false, error: 'Company and product are required' });

    const data = await geminiService.enrichLead({
      company,
      website: website || '',
      product,
      apiKey: req.user.apiKeys?.gemini
    });

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const handleCommand = async (req: AuthRequest, res: Response) => {
  try {
    const { command } = req.body;
    if (!command) return res.status(400).json({ error: 'Command is required' });

    // Intent Classification (Mock)
    const lowerCmd = command.toLowerCase();
    let intent = 'unknown';
    let params: any = {};
    let redirectUrl = null;

    if (lowerCmd.includes('campaign') || lowerCmd.includes('email') || lowerCmd.includes('outreach')) {
      intent = 'create_campaign';
      params = {
        target: lowerCmd.includes('germany') ? 'Germany' : 'Global',
        industry: lowerCmd.includes('auto') ? 'Automotive' : 'General'
      };
      redirectUrl = '/campaigns/new';
    } else if (lowerCmd.includes('lead') || lowerCmd.includes('find') || lowerCmd.includes('prospect')) {
      intent = 'find_leads';
      redirectUrl = '/leads';
    }

    // Simulate Async Processing via Job Queue
    // In reality, this would submit a job to BullMQ/RabbitMQ

    return res.status(202).json({
      success: true,
      message: 'AI Command Accepted',
      data: {
        jobId: Date.now().toString(),
        intent,
        params,
        status: 'processing',
        estimatedCompletion: '2s',
        actionResult: {
          redirectUrl,
          autoFill: params
        }
      }
    });

  } catch (error: any) {
    console.error("AI Command Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const generatePitch = async (req: AuthRequest, res: Response) => {
  try {
    const {
      lead_name, lead_country, user_strategy, target_pain_point,
      time_difference, product, lead_reasoning, lead_products
    } = req.body;
    const senderCompany = req.user.company;

    if (!lead_name || !user_strategy || !product) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const pitch = await geminiService.generatePitch({
      leadName: lead_name,
      leadCountry: lead_country || 'Target Country',
      userStrategy: user_strategy,
      targetPainPoint: target_pain_point || 'High Inventory Costs',
      timeComparison: time_difference,
      product,
      leadReasoning: lead_reasoning,
      leadProducts: lead_products,
      sender: {
        name: req.user.name,
        company: req.user.company,
        jobTitle: req.user.jobTitle,
        phone: req.user.phone,
        email: req.user.email,
        website: req.user.website
      },
      apiKey: req.user.apiKeys?.gemini
    });

    res.json({
      success: true,
      data: pitch
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
