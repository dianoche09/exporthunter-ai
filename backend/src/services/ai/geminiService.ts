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
