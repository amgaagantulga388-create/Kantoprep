/**
 * Reddit-style HTML email templates for offline chat alerts and pod notifications
 */

export interface ChatNotificationEmailParams {
  recipientName: string;
  senderName: string;
  senderSchool?: string;
  podTitle: string;
  podSubject: string;
  venueLabel: string;
  meetingTime: string;
  messageSnippet: string;
  podUrl: string;
}

export function generateChatNotificationHtml(params: ChatNotificationEmailParams): {
  subject: string;
  html: string;
} {
  const subject = `[KantoPrep] ${params.senderName} messaged in "${params.podTitle}"`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0E0D0B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #EDEDEB;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0E0D0B; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #161513; border: 1px solid rgba(245, 185, 66, 0.25); border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Top Header Bar -->
          <tr>
            <td style="padding: 24px 28px 16px 28px; border-bottom: 1px solid rgba(245, 185, 66, 0.15);">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="display: inline-block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0E0D0B; background-color: #F5B942; padding: 3px 8px; border-radius: 6px;">
                      KantoPrep Pod Alert
                    </span>
                    <h1 style="margin: 8px 0 0 0; font-size: 18px; font-weight: 700; color: #FFFFFF; line-height: 1.3;">
                      ${params.podTitle}
                    </h1>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #A8A39D;">
                      ${params.podSubject} &bull; ${params.venueLabel} &bull; ${params.meetingTime}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Card Body (Reddit/Slack style) -->
          <tr>
            <td style="padding: 24px 28px;">
              <p style="margin: 0 0 14px 0; font-size: 13px; color: #A8A39D;">
                Hi <strong style="color: #FFFFFF;">${params.recipientName}</strong>, someone just spoke in your study pod while you were away:
              </p>

              <!-- Chat Bubble -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1C1A17; border-left: 3px solid #F5B942; border-radius: 0 12px 12px 0; padding: 14px 18px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; color: #F5B942; margin-bottom: 6px;">
                      ${params.senderName} ${params.senderSchool ? `<span style="color: #7A756D; font-weight: 400;">(${params.senderSchool})</span>` : ''}
                    </div>
                    <div style="font-size: 14px; color: #FFFFFF; line-height: 1.5; white-space: pre-wrap;">
                      &ldquo;${params.messageSnippet}&rdquo;
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Action Button CTA -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${params.podUrl}" target="_blank" style="display: inline-block; background-color: #F5B942; color: #0E0D0B; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 12px; box-shadow: 0 4px 14px rgba(245, 185, 66, 0.25);">
                      Open Pod Chat &amp; Reply &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 18px 28px; background-color: #12110F; border-top: 1px solid rgba(245, 185, 66, 0.1); font-size: 11px; color: #7A756D; text-align: center; line-height: 1.5;">
              You received this because you joined or host this study pod on KantoPrep.<br>
              We only send email alerts when you are inactive so you never miss critical updates before meeting.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
