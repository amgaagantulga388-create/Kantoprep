import { NextResponse } from 'next/server';
import { generateChatNotificationHtml } from '@/lib/emailTemplates';

interface Recipient {
  email: string;
  name: string;
}

interface ChatEmailRequestBody {
  recipients: Recipient[];
  senderName: string;
  senderSchool?: string;
  podTitle: string;
  podSubject: string;
  venueLabel: string;
  meetingTime: string;
  messageSnippet: string;
  podId: string;
  appBaseUrl?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatEmailRequestBody;

    const {
      recipients,
      senderName,
      senderSchool,
      podTitle,
      podSubject,
      venueLabel,
      meetingTime,
      messageSnippet,
      podId,
      appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kantoprep.org',
    } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients provided' }, { status: 400 });
    }

    if (!senderName || !podTitle || !messageSnippet) {
      return NextResponse.json({ error: 'Missing required email payload fields' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.EMAIL_FROM || 'KantoPrep Alerts <alerts@kantoprep.org>';
    const podUrl = `${appBaseUrl}?pod=${encodeURIComponent(podId)}`;

    const deliveryResults: Array<{ email: string; status: 'sent' | 'simulated' | 'failed'; error?: string }> = [];

    for (const recipient of recipients) {
      if (!recipient.email || !recipient.email.includes('@')) {
        deliveryResults.push({ email: recipient.email || 'unknown', status: 'failed', error: 'Invalid email' });
        continue;
      }

      const { subject, html } = generateChatNotificationHtml({
        recipientName: recipient.name || 'Student',
        senderName,
        senderSchool,
        podTitle,
        podSubject,
        venueLabel,
        meetingTime,
        messageSnippet,
        podUrl,
      });

      if (resendApiKey) {
        // Send email via Resend API
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [recipient.email],
            subject,
            html,
          }),
        });

        if (response.ok) {
          deliveryResults.push({ email: recipient.email, status: 'sent' });
        } else {
          const errData = await response.text();
          deliveryResults.push({ email: recipient.email, status: 'failed', error: errData });
        }
      } else {
        // Simulated mode when running locally without an email API key
        console.log(`[Email Notification Simulated] To: ${recipient.email} | Subject: "${subject}"`);
        deliveryResults.push({ email: recipient.email, status: 'simulated' });
      }
    }

    return NextResponse.json({
      success: true,
      results: deliveryResults,
      configuredProvider: resendApiKey ? 'resend' : 'simulated (missing RESEND_API_KEY)',
    });
  } catch (error) {
    console.error('Failed to send chat notification email:', error);
    return NextResponse.json(
      { error: 'Internal server error processing notification' },
      { status: 500 }
    );
  }
}
