
import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  private getModel(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('Gemini API Key is missing. Please add it in Settings.');
    }
    const genAI = new GoogleGenerativeAI(key);
    return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  /**
   * Discover potential leads based on product and markets
   */
  async discoverLeads(params: {
    product: string;
    targetMarkets: string[];
    industry: string;
    language?: string;
    apiKey?: string;
  }): Promise<any[]> {
    const { product, targetMarkets, industry, language = 'English', apiKey } = params;

    const prompt = `You are a professional B2B lead generation expert. Find 5 real companies that would be potential buyers for:
    Product: ${product}
    Target Markets: ${targetMarkets.join(', ')}
    Industry: ${industry}

    CRITICAL: All descriptions, names, and reasons must be in ${language}.

    For each company, provide:
    1. Company Name
    2. Country
    3. Website
    4. A likely contact email (info@, sales@, etc.)
    5. A brief "reason" why they are a good lead (1-2 sentences).
    6. "aiScore": A number between 0-100 indicating match quality.

    Return the results as a JSON array:
    [
      {
        "companyName": "Example Corp",
        "country": "Germany",
        "website": "example.com",
        "email": "info@example.com",
        "reason": "Large wholesale distributor of...",
        "aiScore": 85
      }
    ]

    Return ONLY the JSON array.`;

    try {
      const model = this.getModel(apiKey);
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [];
    } catch (error: any) {
      console.error('Gemini Discovery Error:', error);
      throw new Error(error.message || 'Failed to discover leads with AI');
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
    language?: string;
    isTemplate?: boolean;
    apiKey?: string;
  }): Promise<{ subject: string; body: string }> {
    const { companyName, product, senderCompany, tone = 'professional', language = 'English', isTemplate = false, apiKey } = params;

    const toneGuide = {
      professional: 'formal and business-like',
      friendly: 'warm and approachable',
      casual: 'relaxed and conversational',
    };

    const prompt = `You are an expert B2B sales email writer. Create a compelling cold outreach email.

Context:
- Recipient Company: ${isTemplate ? '[Target Company]' : companyName}
- Our Product: ${product}
- Our Company: ${senderCompany}
- Tone: ${toneGuide[tone]}
- Language: ${language}

Requirements:
1. Subject line should be attention-grabbing but not spammy
2. Email should be 150-200 words maximum
3. Focus on VALUE to the recipient, not features
4. Include a clear call-to-action
5. ${isTemplate ? 'Use placeholders like [Company Name], [Name] for dynamic fields. This is a template for multiple recipients.' : `Personalize to ${companyName} specifically`}
6. Tone should be ${toneGuide[tone]}

Return your response as JSON:
{
  "subject": "Your subject line here",
  "body": "Your email body here"
}

IMPORTANT: Return ONLY the JSON object, no markdown, no explanations.`;

    try {
      const model = this.getModel(apiKey);
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const email = JSON.parse(jsonMatch[0]);
        return email;
      }

      throw new Error('Invalid AI response format');
    } catch (error: any) {
      console.error('Gemini Email Generation Error:', error);
      throw new Error(error.message || 'Failed to generate email with AI');
    }
  }

  /**
   * Generate a multi-step campaign sequence
   */
  async generateSequence(params: {
    product: string;
    targetAudience: string;
    stepCount?: number;
    senderCompany: string;
    apiKey?: string;
  }): Promise<any[]> {
    const { product, targetAudience, stepCount = 4, senderCompany, apiKey } = params;

    const prompt = `Act as an expert Outreach Strategist. Create a high-converting ${stepCount}-step cold outreach sequence for selling "${product}" to "${targetAudience}". My company is "${senderCompany}".

    Rules:
    - Include a mix of Emails and Delays (and optionally LinkedIn steps if relevant).
    - Step 1 must be an Email.
    - Subsequent steps should follow up naturally.
    - Delays should be in days (e.g. 2 days).
    
    Return a JSON array of steps:
    [
      { "order": 1, "type": "email", "content": { "subject": "...", "body": "..." } },
      { "order": 2, "type": "delay", "delay": { "days": 2 } },
      { "order": 3, "type": "email", "content": { "subject": "...", "body": "..." } }
    ]

    CRITICAL: All content must be in English. Body text should be ready to send (use [Name] for placeholders).
    Return ONLY the JSON array.`;

    try {
      const model = this.getModel(apiKey);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (error: any) {
      console.error('Gemini Sequence Error:', error);
      throw new Error('Failed to generate sequence');
    }
  }

  /**
   * Analyze recipient response
   */
  async analyzeResponse(emailContent: string, apiKey?: string): Promise<any> {
    const prompt = `Analyze this email response from a potential lead:
    "${emailContent}"

    Identify:
    1. Sentiment (Positive, Neutral, Negative)
    2. Interest level (0-10)
    3. Key concerns (array of strings)
    4. Next recommended steps

    Return as JSON:
    {
      "sentiment": "Positive",
      "interestLevel": 8,
      "concerns": ["pricing", "timeline"],
      "nextSteps": "Schedule a demo call"
    }`;

    try {
      const model = this.getModel(apiKey);
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return null;
    } catch (error: any) {
      console.error('Gemini Response Analysis Error:', error);
      throw new Error(error.message || 'Failed to analyze response');
    }
  }

  /**
   * Improve an existing email draft
   */
  async improveEmail(emailContent: string, apiKey?: string): Promise<string> {
    const prompt = `Improve this sales email to make it more professional and persuasive:
    "${emailContent}"

    Return ONLY the improved email body text.`;

    try {
      const model = this.getModel(apiKey);
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error: any) {
      console.error('Gemini Email Improvement Error:', error);
      throw new Error(error.message || 'Failed to improve email');
    }
  }

  /**
   * Generate a follow-up email
   */
  async generateFollowUp(params: {
    companyName: string;
    previousEmail: string;
    daysSince: number;
    apiKey?: string;
  }): Promise<string> {
    const { companyName, previousEmail, daysSince, apiKey } = params;

    const prompt = `Write a polite follow-up email to ${companyName} after ${daysSince} days of no response to this email:
    "${previousEmail}"

    The follow-up should be brief, professional, and add value.
    Return ONLY the email body text.`;

    try {
      const model = this.getModel(apiKey);
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error: any) {
      console.error('Gemini Follow-up Generation Error:', error);
      throw new Error(error.message || 'Failed to generate follow-up');
    }
  }

  /**
   * Generate generic text from prompt
   */
  async generateText(prompt: string, apiKey?: string): Promise<string> {
    try {
      const model = this.getModel(apiKey);
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error: any) {
      console.error('Gemini Generate Text Error:', error);
      throw new Error(error.message || 'Failed to generate text with AI');
    }
  }

  /**
   * Discover multiple leads using AI batch processing
   */
  async discoverLeadsBatch(params: {
    product: string;
    targetMarkets: string[];
    industry: string;
    count?: number;
    apiKey?: string;
    userProductGroups?: string[];
  }): Promise<any[]> {
    const { product, targetMarkets, industry, count = 15, apiKey, userProductGroups } = params;

    const userProductsContext = userProductGroups && userProductGroups.length > 0
      ? `\nOur company also sells: ${userProductGroups.join(', ')}.`
      : '';

    const prompt = `You are a Global Lead Generation Expert. Find ${count} real-world companies that would be potential buyers for "${product}".

    Context:
    Target Markets: ${targetMarkets.join(', ')}
    Target Industry: ${industry}
    ${userProductsContext}

    For each company provide:
    - companyName: Full name
    - country: Country name
    - city: Major city
    - email: Generic or purchasing/procurement email if known (or a likely pattern like info@domain.com)
    - emailSource: 'website' or 'predicted'
    - website: Main domain
    - logic: 1-2 sentences on why they are a match.
    - aiScore: 0-100 score.
    - potentialProducts: 2-3 specific things they might buy from us.

    CRITICAL: All text output must be in English.
    Return ONLY a JSON array.`;

    try {
      const model = this.getModel(apiKey);
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log('--- RAW AI DISCOVERY RESPONSE ---');
      console.log(text);

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [];
    } catch (error: any) {
      console.error('Gemini Batch Discovery Error:', error);
      throw new Error(error.message || 'Failed to discover leads batch');
    }
  }

  /**
   * Analyze and recommend target markets based on user profile
   */
  async analyzeTargetMarkets(params: {
    companyName: string;
    industry: string;
    productGroups: string[];
    country: string;
    apiKey?: string;
  }): Promise<any[]> {
    const { companyName, industry, productGroups, country, apiKey } = params;

    const prompt = `You are a Global Trade Analyst. Analyze the following company profile and recommend the top 5 most profitable export markets (countries) based on real-world trade data, import trends, and geographical/economic advantages.

    Company Profile:
    - Name: ${companyName}
    - Industry: ${industry}
    - Products: ${productGroups.join(', ')}
    - Source Country (Base): ${country}

    Analysis Criteria:
    1. Identify countries with high import demand for these specific products.
    2. Consider existing trade agreements or logistic advantages from ${country}.
    3. Look for emerging markets or regions with supply shortages.
    4. Provide a very specific "logic" for each country (e.g., "Germany has a 12% YoY increase in organic food imports from the MENA region").

    Return the result as a JSON array:
    [
      { 
        "country": "Germany", 
        "logic": "Detailed explanation of demand and trade logic...", 
        "score": 92 
      }
    ]

    CRITICAL: All text output (especially the 'logic' field) must be in English.
    Return ONLY the JSON array.`;

    try {
      const model = this.getModel(apiKey);
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [];
    } catch (error: any) {
      console.error('Gemini Market Analysis Error:', error);
      throw new Error(error.message || 'Failed to analyze markets');
    }
  }

  /**
   * Suggest target industries and markets based on a product
   */
  async suggestDiscoveryParams(product: string, originCountry: string = 'Global', apiKey?: string): Promise<{ industries: string[], markets: { country: string, reason: string }[] }> {
    const prompt = `Act as a global trade analyst. Identify top export markets for "${product}" originating from "${originCountry}". Return logic based on recent trade volumes and industry growth.

    1. Correct any typos in the product name (e.g. "Chemisrty" -> "Chemistry").
    2. Identify the top 5 most relevant target industries/sectors that would buy this product.
    3. Identify the top 5 best target countries (markets) for this product and provide a brief 1-sentence reason for each based on import demand and logistics from ${originCountry}.

    Return the result as a JSON object:
    {
      "industries": ["Industry 1", "Industry 2", ...],
      "suggested_markets": [
        { "country": "Country Name", "reason": "Brief reason why" },
        ...
      ]
    }

    CRITICAL: All text output must be in English.
    Return ONLY the JSON object.`;

    try {
      console.log('🤖 Suggesting industries/markets for:', product);
      const model = this.getModel(apiKey);
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      console.log('🤖 Raw AI Suggestion text:', text);

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const json = JSON.parse(jsonMatch[0]);
        return {
          industries: json.industries || [],
          markets: json.suggested_markets || json.markets || []
        };
      }

      console.warn('⚠️ No JSON found in AI suggestions');
      return { industries: [], markets: [] };
    } catch (error: any) {
      console.error('Gemini Suggest Params Error:', error);
      return { industries: [], markets: [] };
    }
  }

  /**
   * Analyze Supply Chain and Competitors (Market Intelligence)
   * Enhanced for the Strategy Matrix module
   */
  async getSupplyChainIntel(params: { product: string; origin: string; target: string; apiKey?: string }): Promise<any> {
    const { product, origin, target, apiKey } = params;
    const prompt = `Act as a Global Logistics & Trade Analyst. 
    Analyze the export route for "${product}" from "${origin}" to "${target}".

    1. Identify the most likely dominant competitor country for this product in "${target}" (usually China, but be specific).
    2. Estimate the transit time (in days) from "${origin}" to "${target}".
    3. Estimate the transit time (in days) from the competitor country to "${target}".
    4. Identify the most likely "pain point" for the buyer in "${target}" when buying from that competitor (e.g., High Inventory Costs, Supply Chain Risk, Quality Inconsistency).
    5. Suggest a "winning strategy" for the exporter in "${origin}" (e.g., Faster Delivery, EU Quality Standards, Flexible MOQ, Manufacturer Direct).

    Return JSON:
    {
      "competitor": {
        "name": "Competitor Country Name (e.g. China)",
        "transit_time_days": number,
        "likely_pain_point": "High Inventory Costs"
      },
      "user": {
        "origin_country": "${origin}",
        "transit_time_days": number,
        "suggested_strategy": "Faster Delivery"
      }
    }
    
    Return ONLY JSON.`;

    try {
      const model = this.getModel(apiKey);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (error: any) {
      console.error('Supply Chain Intel Error:', error);
      return {};
    }
  }

  /**
   * Generate a strategic sales pitch based on supply chain advantages
   * Refactored to focus on strategy and logistics, strictly avoiding price.
   */
  async generatePitch(params: {
    leadName: string;
    leadCountry: string;
    userStrategy: string;
    targetPainPoint: string;
    timeComparison: string;
    product: string;
    leadReasoning?: string;
    leadProducts?: string[];
    sender: {
      name: string;
      company: string;
      jobTitle?: string;
      phone?: string;
      email?: string;
      website?: string;
    };
    apiKey?: string;
  }): Promise<{ subject: string; body: string }> {
    const { leadName, leadCountry, userStrategy, targetPainPoint, timeComparison, product, leadReasoning, leadProducts, sender, apiKey } = params;

    const prompt = `Act as an export sales expert. Write a short, highly personalized cold outreach email to a buyer at "${leadName}" in "${leadCountry}" for "${product}".
    
    Goal: Position "${sender.company}" as the ideal partner.
    
    VERY IMPORTANT: Avoid generic templates. Use the specific context below to make the email feel like it was written after researching this specific lead.
    
    Lead Specific Context:
    ${leadReasoning ? `- Why we matched this lead: ${leadReasoning}` : ''}
    ${leadProducts && leadProducts.length > 0 ? `- Recommended products for them: ${leadProducts.join(', ')}` : ''}
    
    Strategy Context:
    - Our Edge: ${userStrategy}
    - Their Pain Point: ${targetPainPoint}
    - Logistic Argument: ${timeComparison}
    
    Sender Details:
    - Name: ${sender.name}
    - Company: ${sender.company}
    - Job Title: ${sender.jobTitle || 'Export Manager'}
    - Contact: ${sender.email || ''} ${sender.phone || ''}
    - Website: ${sender.website || ''}

    Tone: Professional, direct, human, and solution-oriented. 
    Constraint: No generic sales buzzwords. No mentions of price.
    Identify as a "Strategic Logistics Partner".
    
    Return JSON:
    {
      "subject": "Email subject line mentioning their specific needs",
      "body": "Personalized email body with clear signature"
    }
    
    Return ONLY JSON.`;

    try {
      const model = this.getModel(apiKey);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid AI response');
    } catch (error: any) {
      console.error('Generate Pitch Error:', error);
      throw error;
    }
  }

  /**
   * Enrich Lead with Match Analysis (Company Intelligence)
   */
  async enrichLead(params: { company: string; website: string; product: string; apiKey?: string }): Promise<any> {
    const { company, website, product, apiKey } = params;
    const prompt = `Analyze "${company}" (${website}) as a potential buyer for "${product}".
    
    1. Why do they match? (Summary - 1 sentence)
    2. List 3 potential use cases.
    3. List 2 buying signals (e.g. recent expansion, import history).

    Return JSON:
    {
      "matchSummary": "...",
      "potentialUseCases": ["..."],
      "buyingSignals": ["..."]
    }

    Return ONLY JSON.`;

    try {
      const model = this.getModel(apiKey);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (error: any) {
      console.error('Lead Enrichment Error:', error);
      return {};
    }
  }

  /**
   * Suggest HS Codes for a product
   */
  async suggestHsCodes(product: string, apiKey?: string): Promise<{ code: string, description: string }[]> {
    const prompt = `You are a Global Trade Expert and Customs Broker. A user is looking for the correct HS Code (HTS) for their product: "${product}".
    
    1. Provide the top 5 most likely HS Code (6-digit or 4-digit) matches.
    2. For each match, provide a very clear and descriptive official description.
    
    Return as a JSON array:
    [
      { "code": "3912.39", "description": "Cellulose ethers (e.g., Methylcellulose, Ethylcellulose) in primary forms" },
      { "code": "3209.10", "description": "Paints and varnishes based on acrylic or vinyl polymers" }
    ]
    
    CRITICAL: The 'description' field MUST be in English, even if the input product name is in another language.
    Return ONLY the JSON array.`;

    try {
      const model = this.getModel(apiKey);
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error: any) {
      console.error('Gemini HS Code Suggest Error:', error);
      return [];
    }
  }
}

export const geminiService = new GeminiService();
