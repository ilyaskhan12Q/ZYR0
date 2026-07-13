// Edge Function: send-email
// POST /functions/v1/send-email
// Body: { to, subject, html, from, text, attachments }
// Uses SMTP (if configured) or Resend fallback

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import nodemailer from 'npm:nodemailer@6.9.13';

interface EmailAttachment {
  filename: string;
  content: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { to, subject, html, from, text, attachments } = body;
    console.log(`[send-email] Incoming email request. To: ${JSON.stringify(to)}, Subject: "${subject}", From: "${from || 'default'}"`);

    const SMTP_HOST = Deno.env.get('SMTP_HOST');
    const SMTP_PORT = Deno.env.get('SMTP_PORT');
    const SMTP_USER = Deno.env.get('SMTP_USER');
    const SMTP_PASS = Deno.env.get('SMTP_PASS');
    const SMTP_FROM = Deno.env.get('SMTP_FROM') || from;
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    let lastError;

    // Try SMTP first
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      console.log(`[send-email] Attempting SMTP delivery via ${SMTP_HOST}:${SMTP_PORT || '587'}`);
      try {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: parseInt(SMTP_PORT || '587'),
          secure: SMTP_PORT === '465',
          auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        const info = await transporter.sendMail({
          from: SMTP_FROM || `Zyro <${SMTP_USER}>`,
          to: Array.isArray(to) ? to.join(', ') : to,
          subject,
          text,
          html,
          attachments: attachments?.map((att: EmailAttachment) => ({
            filename: att.filename,
            content: att.content,
            encoding: 'base64',
          })),
        });

        console.log(`[send-email] SMTP delivery successful. MessageId: ${info.messageId}`);
        return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (smtpErr) {
        console.error('[send-email] SMTP delivery failed:', smtpErr);
        lastError = smtpErr;
      }
    } else {
      console.log('[send-email] SMTP is not configured or incomplete (host, user, or pass missing).');
    }

    // Fallback to Resend API
    if (RESEND_API_KEY) {
      console.log('[send-email] Attempting Resend API delivery');
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: from || 'Zyro <noreply@zyroo.dpdns.org>',
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            attachments: attachments?.map((att: EmailAttachment) => ({
              filename: att.filename,
              content: att.content,
            })),
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Resend error: ${err}`);
        }

        const data = await res.json();
        console.log(`[send-email] Resend API delivery successful. Id: ${data.id}`);
        return new Response(JSON.stringify({ success: true, id: data.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (resendErr) {
        console.error('[send-email] Resend API delivery failed:', resendErr);
        lastError = resendErr;
      }
    } else {
      console.log('[send-email] RESEND_API_KEY is not configured.');
    }

    const message = lastError
      ? `Email sending failed. SMTP/Resend errors: ${lastError.message || lastError}`
      : 'Neither SMTP nor Resend API keys are configured.';

    console.error(`[send-email] ${message}`);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[send-email] Unexpected function error:', err);
    return new Response(JSON.stringify({ error: err.message || err }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

