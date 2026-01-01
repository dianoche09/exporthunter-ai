export class EmailTemplates {
  /**
   * Professional template with company branding
   */
  professional(params: {
    subject: string;
    body: string;
    companyName: string;
    senderName: string;
    recipientName?: string;
    language?: 'en' | 'tr';
  }): string {
    const { subject, body, companyName, senderName, recipientName, language = 'en' } = params;

    const greeting = language === 'tr'
      ? `Sayın ${recipientName || 'Yetkili'},`
      : `Dear ${recipientName || 'Sir/Madam'},`;

    const footer = language === 'tr'
      ? 'Bu e-posta size tanıtım amaçlı gönderilmiştir. Listeden çıkmak için lütfen "KALDIRIN" yazarak yanıt verin.'
      : 'This email was sent to you for promotional purposes. To unsubscribe, please reply with "UNSUBSCRIBE".';

    return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">${companyName}</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                ${greeting}
              </p>
              
              <div style="color: #374151; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">
${body}
              </div>
              
              <!-- CTA Button (optional) -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                <tr>
                  <td align="center">
                    <a href="#" style="display: inline-block; padding: 14px 32px; background-color: #0ea5e9; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
                      ${language === 'tr' ? 'İletişime Geçin' : 'Get in Touch'}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Signature -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 2px solid #e5e7eb; padding-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      ${language === 'tr' ? 'Saygılarımla' : 'Best regards'},<br>
                      <strong style="color: #1f2937;">${senderName}</strong><br>
                      <span style="color: #9ca3af;">${companyName}</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.6; text-align: center;">
                ${footer}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Minimal clean template
   */
  minimal(params: {
    body: string;
    companyName: string;
    senderName: string;
    language?: 'en' | 'tr';
  }): string {
    const { body, companyName, senderName, language = 'en' } = params;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto;">
    <div style="color: #1f2937; font-size: 15px; line-height: 1.8; white-space: pre-wrap; margin-bottom: 30px;">
${body}
    </div>
    
    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        ${senderName}<br>
        ${companyName}
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }
}

export const emailTemplates = new EmailTemplates();
