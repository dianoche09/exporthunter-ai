import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

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
      if (!resend) {
        console.warn('⚠️  Resend API key not configured. Email not sent.');
        return {
          success: false,
          error: 'Email service not configured. Please add RESEND_API_KEY to .env file.',
        };
      }

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

  /**
   * Send with professional template
   */
  async sendWithTemplate(params: {
    to: string;
    subject: string;
    body: string;
    senderName: string;
    companyName: string;
    recipientName?: string;
    language?: 'en' | 'tr';
    template?: 'professional' | 'minimal';
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { template = 'professional', to, subject, body, senderName, companyName } = params;

    const html = this.createEmailTemplate({
      subject,
      body,
      companyName,
      senderName
    });

    return this.sendEmail({
      to,
      subject,
      html
    });
  }
}

export const resendService = new ResendService();

