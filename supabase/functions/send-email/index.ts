// Edge Function: send-email
// POST /functions/v1/send-email
// Body: { to, subject, html, from, text, attachments }
// Uses SMTP (if configured) or Resend fallback

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import nodemailer from 'npm:nodemailer';

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

    let result;

    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      // Use SMTP (e.g. Gmail or custom)
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || '587'),
        secure: SMTP_PORT === '465', // true for 465, false for 587
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      const mailOptions = {
        from: SMTP_FROM || `Zyro <${SMTP_USER}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        text,
        html,
        attachments: attachments?.map((att: any) => ({
          filename: att.filename,
          content: att.content, // base64 string
          encoding: 'base64',
        })),
      };

      const info = await transporter.sendMail(mailOptions);
      result = { success: true, messageId: info.messageId };
    } else {
      // Fallback to Resend API
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
      if (!RESEND_API_KEY) {
        throw new Error('SMTP credentials are not configured, and RESEND_API_KEY is missing.');
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: from || 'Zyro <noreply@zyro.app>',
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          attachments: attachments?.map((att: any) => ({
            filename: att.filename,
            content: att.content, // base64 string
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Resend error: ${err}`);
      }

      const data = await res.json();
      result = { success: true, id: data.id };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
