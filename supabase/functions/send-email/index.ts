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
      if (req.method === 'GET') {
        const url = new URL(req.url);
        const action = url.searchParams.get('action');
        const emailId = url.searchParams.get('id');
        
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
        if (!RESEND_API_KEY) {
          return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (action === 'domains') {
          const res = await fetch('https://api.resend.com/domains', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${RESEND_API_KEY}` },
          });
          const data = await res.json();
          return new Response(JSON.stringify(data), {
            status: res.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (action === 'domain_details') {
          const domainId = url.searchParams.get('domain_id');
          if (!domainId) {
            return new Response(JSON.stringify({ error: 'Missing domain_id parameter' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          const res = await fetch(`https://api.resend.com/domains/${domainId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${RESEND_API_KEY}` },
          });
          const data = await res.json();
          return new Response(JSON.stringify(data), {
            status: res.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (emailId) {
          const res = await fetch(`https://api.resend.com/emails/${emailId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${RESEND_API_KEY}` },
          });
          const data = await res.json();
          return new Response(JSON.stringify(data), {
            status: res.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const body = await req.json();
      const { to, subject, html, from, text, replyTo, reply_to, attachments } = body;
      console.log(`[send-email] Incoming email request. To: ${JSON.stringify(to)}, Subject: "${subject}", From: "${from || 'default'}"`);
      console.log(`[send-email] Attachment count: ${attachments?.length || 0}`);
      if (attachments && attachments.length > 0) {
        attachments.forEach((att: EmailAttachment, idx: number) => {
          console.log(`[send-email] Attachment #${idx + 1}: filename="${att.filename}", base64 content length=${att.content?.length || 0}`);
        });
      }

      const SMTP_HOST = Deno.env.get('SMTP_HOST');
      const SMTP_PORT = Deno.env.get('SMTP_PORT');
      const SMTP_USER = Deno.env.get('SMTP_USER');
      const SMTP_PASS = Deno.env.get('SMTP_PASS');
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

      console.log(`[send-email] SMTP configuration status: HOST=${SMTP_HOST ? 'Configured' : 'Not configured'}, USER=${SMTP_USER ? 'Configured' : 'Not configured'}`);
      console.log(`[send-email] Resend API key status: ${RESEND_API_KEY ? 'Configured' : 'Not configured'}`);

      let sanitizedFrom = from;
      if (!sanitizedFrom || 
          sanitizedFrom.includes('onboarding@resend.dev') || 
          sanitizedFrom.includes('noreply@') || 
          sanitizedFrom.includes('example.com') ||
          sanitizedFrom.includes('zyr0.com')) {
        sanitizedFrom = 'ZYR0 Team <team@zyroo.dpdns.org>';
      }

      let sanitizedReplyTo = replyTo || reply_to;
      if (!sanitizedReplyTo || 
          sanitizedReplyTo.includes('onboarding@resend.dev') ||
          sanitizedReplyTo.includes('example.com') ||
          sanitizedReplyTo.includes('zyr0.com')) {
        sanitizedReplyTo = 'team@zyroo.dpdns.org';
      }

      console.log(`[send-email] Sanitized sender info: from="${sanitizedFrom}", replyTo="${sanitizedReplyTo}"`);

      const SMTP_FROM = Deno.env.get('SMTP_FROM') || sanitizedFrom;

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
            from: SMTP_FROM || `ZYR0 Team <${SMTP_USER}>`,
            to: Array.isArray(to) ? to.join(', ') : to,
            replyTo: sanitizedReplyTo,
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
        console.log('[send-email] Skipping SMTP delivery: SMTP configuration is incomplete or missing.');
      }

      // Fallback to Resend API
      if (RESEND_API_KEY) {
        console.log(`[send-email] Attempting Resend API delivery to ${JSON.stringify(to)}...`);
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: sanitizedFrom,
              to: Array.isArray(to) ? to : [to],
              reply_to: sanitizedReplyTo,
              subject,
              html,
              text: text || undefined,
              attachments: attachments?.map((att: EmailAttachment) => ({
                filename: att.filename,
                content: att.content,
              })),
            }),
          });

          if (!res.ok) {
            const err = await res.text();
            console.error(`[send-email] Resend API response status: ${res.status}. Error body: ${err}`);
            throw new Error(`Resend error: ${err}`);
          }

          const data = await res.json();
          console.log(`[send-email] Resend API delivery successful. Email Id: ${data.id}`);
          return new Response(JSON.stringify({ success: true, id: data.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (resendErr) {
          console.error('[send-email] Resend API delivery failed:', resendErr);
          lastError = resendErr;
        }
      } else {
        console.log('[send-email] Skipping Resend API delivery: RESEND_API_KEY is not configured.');
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

