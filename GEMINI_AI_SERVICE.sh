#!/bin/bash

echo "🌟 Google Gemini AI Service'e geçiş yapılıyor..."

cd exporthunter-ai/backend

# ===========================================
# GEMINI AI SERVICE
# ===========================================

cat > src/services/ai/geminiService.ts << 'GEMINI'
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  /**
   * Discover potential leads based on product and target markets
   */
  async discoverLeads(params: {
    product: string;
    targetMarkets: string[];
    industry: string;
  }): Promise<any[]> {
    const { product, targetMarkets, industry } = params;

    const prompt = `You are a B2B lead generation expert. Help me find potential companies that might need ${product}.

Target Markets: ${targetMarkets.join(', ')}
Industry: ${industry}

Please provide a list of 10 real companies that could be potential customers. For each company, provide:
1. Company name
2. Country
3. City
4. Estimated email format (e.g., info@company.com, contact@company.com)
5. Website (if known)
6. Brief reason why they're a good lead (1 sentence)
7. AI Score (0-100) based on fit

Format your response as a JSON array with this structure:
[
  {
    "companyName": "Example Company",
    "country": "UAE",
    "city": "Dubai",
    "email": "info@examplecompany.com",
    "website": "https://examplecompany.com",
    "reason": "Leading construction materials distributor in Gulf region",
    "aiScore": 85
  }
]

IMPORTANT: Return ONLY the JSON array, no markdown formatting, no explanations.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const leads = JSON.parse(jsonMatch[0]);
        return leads;
      }

      return [];
    } catch (error) {
      console.error('Gemini Lead Discovery Error:', error);
      throw new Error('Failed to discover leads with AI');
    }
  }

  /**
   * Generate personalized email content
   */
  async generateEmail(params: {
    companyName: string;
    product: string;
    senderCompany: string;
    tone?: 'professional' | 'friendly' | 'casual';
    language?: 'en' | 'tr';
  }): Promise<{ subject: string; body: string }> {
    const { companyName, product, senderCompany, tone = 'professional', language = 'en' } = params;

    const toneGuide = {
      professional: 'formal and business-like',
      friendly: 'warm and approachable',
      casual: 'relaxed and conversational',
    };

    const languageGuide = language === 'tr' ? 'Turkish' : 'English';

    const prompt = `You are an expert B2B sales email writer. Create a compelling cold outreach email.

Context:
- Recipient Company: ${companyName}
- Our Product: ${product}
- Our Company: ${senderCompany}
- Tone: ${toneGuide[tone]}
- Language: ${languageGuide}

Requirements:
1. Subject line should be attention-grabbing but not spammy
2. Email should be 150-200 words maximum
3. Focus on VALUE to the recipient, not features
4. Include a clear call-to-action
5. Personalize to ${companyName} specifically
6. Tone should be ${toneGuide[tone]}

Return your response as JSON:
{
  "subject": "Your subject line here",
  "body": "Your email body here"
}

IMPORTANT: Return ONLY the JSON object, no markdown, no explanations.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const email = JSON.parse(jsonMatch[0]);
        return email;
      }

      throw new Error('Invalid AI response format');
    } catch (error) {
      console.error('Gemini Email Generation Error:', error);
      throw new Error('Failed to generate email with AI');
    }
  }

  /**
   * Analyze email response and categorize lead interest
   */
  async analyzeResponse(emailContent: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    interest: 'high' | 'medium' | 'low' | 'none';
    nextAction: string;
    summary: string;
  }> {
    const prompt = `Analyze this email response from a potential B2B customer:

"${emailContent}"

Provide analysis in JSON format:
{
  "sentiment": "positive|neutral|negative",
  "interest": "high|medium|low|none",
  "nextAction": "Specific recommended next step",
  "summary": "Brief 1-sentence summary"
}

Criteria:
- "high interest": Wants pricing, demo, or meeting
- "medium interest": Asks questions, wants more info
- "low interest": Polite but vague
- "none": Clear rejection or unsubscribe

IMPORTANT: Return ONLY the JSON object.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Invalid AI response format');
    } catch (error) {
      console.error('Gemini Response Analysis Error:', error);
      throw new Error('Failed to analyze response with AI');
    }
  }

  /**
   * Improve existing email content
   */
  async improveEmail(originalEmail: string): Promise<string> {
    const prompt = `Improve this B2B sales email to make it more effective:

Original Email:
"${originalEmail}"

Improvements to make:
1. Stronger subject line if needed
2. More compelling opening
3. Clear value proposition
4. Better call-to-action
5. Remove any salesy/pushy language
6. Keep it concise (under 200 words)

Return ONLY the improved email text, nothing else.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini Email Improvement Error:', error);
      throw new Error('Failed to improve email with AI');
    }
  }

  /**
   * Generate follow-up email
   */
  async generateFollowUp(params: {
    companyName: string;
    previousEmail: string;
    daysSince: number;
  }): Promise<string> {
    const { companyName, previousEmail, daysSince } = params;

    const prompt = `Generate a follow-up email for a B2B cold outreach.

Context:
- Company: ${companyName}
- Days since first email: ${daysSince}
- Previous email: "${previousEmail}"

Requirements:
1. Reference the previous email subtly
2. Add NEW value or information
3. Different angle/approach
4. Keep it short (under 100 words)
5. Gentle nudge, not pushy

Return ONLY the follow-up email body text.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini Follow-up Generation Error:', error);
      throw new Error('Failed to generate follow-up with AI');
    }
  }

  /**
   * Batch lead discovery with higher limits
   */
  async discoverLeadsBatch(params: {
    product: string;
    targetMarkets: string[];
    industry: string;
    count?: number;
  }): Promise<any[]> {
    const { product, targetMarkets, industry, count = 20 } = params;

    const prompt = `You are a B2B lead generation expert. Find ${count} potential companies for ${product}.

Target Markets: ${targetMarkets.join(', ')}
Industry: ${industry}

Provide ${count} real companies as JSON array with: companyName, country, city, email, website, reason, aiScore.

Return ONLY the JSON array.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [];
    } catch (error) {
      console.error('Gemini Batch Discovery Error:', error);
      throw new Error('Failed to discover leads batch');
    }
  }
}

export const geminiService = new GeminiService();
GEMINI

# ===========================================
# UPDATE AI CONTROLLER TO USE GEMINI
# ===========================================

cat > src/controllers/aiController.ts << 'AICONTROLLER'
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
AICONTROLLER

# ===========================================
# UPDATE PACKAGE.JSON
# ===========================================

cat > backend/package.json << 'PACKAGE'
{
  "name": "exporthunter-backend",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "compression": "^1.7.4",
    "dotenv": "^16.3.1",
    "zod": "^3.22.4",
    "axios": "^1.6.2",
    "resend": "^3.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.6",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cors": "^2.8.17",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2"
  }
}
PACKAGE

# ===========================================
# UPDATE .env.example
# ===========================================

cat > .env.example << 'ENV'
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

MONGODB_URI=mongodb://localhost:27017/exporthunter

JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=1h

# Google Gemini API (ÜCRETSİZ!)
GEMINI_API_KEY=your-gemini-api-key-here

# Email Service
RESEND_API_KEY=re_your-key-here
EMAIL_FROM=noreply@exporthunter.ai
ENV

echo ""
echo "✅ Google Gemini AI Service hazır!"
echo ""
echo "🌟 Gemini Avantajları:"
echo "  ✅ ÜCRETSİZ 15 request/minute (60/minute paid)"
echo "  ✅ ÜCRETSİZ 1,500 requests/day"
echo "  ✅ ÜCRETSİZ 1 million tokens/minute"
echo "  ✅ Gemini 1.5 Flash - Hızlı ve Güçlü"
echo ""
echo "💰 Maliyet Karşılaştırması:"
echo "  Claude API: ~$15-20/ay (normal kullanım)"
echo "  Gemini Free: $0/ay (günde 1,500 request!)"
echo ""
echo "📝 Gemini API Key Nasıl Alınır:"
echo "  1. https://aistudio.google.com/app/apikey"
echo "  2. 'Get API Key' butonuna tıkla"
echo "  3. API Key'i kopyala"
echo "  4. .env dosyasına ekle: GEMINI_API_KEY=..."
echo ""
echo "🚀 Kurulum:"
echo "  cd backend && npm install"
echo "  # .env dosyasını güncelle"
echo "  npm run dev"
echo ""
