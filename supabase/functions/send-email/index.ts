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
    const { to, subject, html, from, text, attachments } = await req.json();

    const SMTP_HOST = Deno.env.get('SMTP_HOST');
    const SMTP_PORT = Deno.env.get('SMTP_PORT');
    const SMTP_USER = Deno.env.get('SMTP_USER');
    const SMTP_PASS = Deno.env.get('SMTP_PASS');
    const SMTP_FROM = Deno.env.get('SMTP_FROM') || from;
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    let lastError;

    // Try SMTP first
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
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

        return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (smtpErr) {
        console.error('SMTP failed, trying Resend:', smtpErr);
        lastError = smtpErr;
      }
    }

    // Fallback to Resend API
    if (RESEND_API_KEY) {
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
        return new Response(JSON.stringify({ success: true, id: data.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (resendErr) {
        console.error('Resend also failed:', resendErr);
        lastError = resendErr;
      }
    }

    const message = lastError
      ? `Email sending failed: ${lastError.message}`
      : 'SMTP credentials are not configured, and RESEND_API_KEY is missing.';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
});
