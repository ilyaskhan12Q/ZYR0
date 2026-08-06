// Edge Function: send-email
// POST /functions/v1/send-email
// Body: { to, subject, html, from, text, attachments, kind?, allowUserReplyTo?, website? }
// Uses SMTP (if configured) or Resend fallback
//
// Security model:
// - Non-contact sends require header `x-internal-token` == EMAIL_INTERNAL_TOKEN (env).
//   These are the app's own flows (shortlist, offer letters, certificates).
// - Contact sends (kind: 'contact') are public (contact/support form):
//   * `to` is allowlisted to ZYR0's own mailboxes (no open relay)
//   * `allowUserReplyTo: true` permits the submitter's email as reply-to
//   * honeypot `website` field: if non-empty, pretend success, send nothing
//   * rate limit per email + per IP (DB-backed: counts recent contact_messages rows)
//   * submissions are also persisted to `contact_messages` (service role)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import nodemailer from 'npm:nodemailer@6.9.13';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface EmailAttachment {
  filename: string;
  content: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-token',
};

// Contact-mode guards
const CONTACT_TO_ALLOWLIST = [
  'support@zyroo.org',
  'info@zyroo.org',
  'partnerships@zyroo.org',
  'careers@zyroo.org',
];
const MAX_NAME_LEN = 100;
const MAX_SUBJECT_LEN = 200;
const MAX_MESSAGE_LEN = 5000;
const RATE_EMAIL_MAX = 3;        // per 10 min per email
const RATE_IP_MAX = 5;           // per 10 min per IP
const RATE_WINDOW_MS = 10 * 60 * 1000;

// DB-backed rate limiting: contact submissions are persisted to contact_messages,
// so we count recent rows instead of relying on in-memory state (edge function
// isolates do not share memory).
async function countRecentRows(client: ReturnType<typeof createClient>, column: string, value: string): Promise<number> {
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
  const { count, error } = await client
    .from('contact_messages')
    .select('id', { count: 'exact', head: true })
    .eq(column, value)
    .gte('created_at', since);
  if (error) {
    console.warn(`[send-email] Rate-limit count query failed (${column}):`, error.message);
    return 0; // fail open: never block the form on a DB hiccup
  }
  return count || 0;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function sanitizeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isPlainEmail(value: unknown): boolean {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sanitizedFrom(from: unknown): string {
  let s = from;
  if (!s ||
      String(s).includes('onboarding@resend.dev') ||
      String(s).includes('noreply@') ||
      String(s).includes('example.com') ||
      !String(s).includes('zyroo.org')) {
    s = 'ZYR0 Team <team@zyroo.org>';
  }
  return String(s);
}

function sanitizedReplyTo(replyTo: unknown): string {
  let s = replyTo;
  if (!s ||
      String(s).includes('onboarding@resend.dev') ||
      String(s).includes('example.com') ||
      !String(s).includes('zyroo.org')) {
    s = 'team@zyroo.org';
  }
  return String(s);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── GET: diagnostics / status (requires RESEND_API_KEY) ───────────────
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

    // ── POST: send email ──────────────────────────────────────────────────
    const body = await req.json();
    const { to, subject, html, from, text, replyTo, reply_to, attachments, kind, allowUserReplyTo, website, name, message, category, email: contactEmail } = body;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const isContact = kind === 'contact';

    const SMTP_HOST = Deno.env.get('SMTP_HOST');
    const SMTP_PORT = Deno.env.get('SMTP_PORT');
    const SMTP_USER = Deno.env.get('SMTP_USER');
    const SMTP_PASS = Deno.env.get('SMTP_PASS');
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const INTERNAL_TOKEN = Deno.env.get('EMAIL_INTERNAL_TOKEN');

    console.log(`[send-email] Incoming ${isContact ? 'CONTACT' : 'INTERNAL'} request. To: ${JSON.stringify(to)}, Subject: "${subject}", From: "${from || 'default'}"`);
    console.log(`[send-email] Attachment count: ${attachments?.length || 0}`);

    // ── Build the mail pieces (contact mode transforms structured fields) ──
    const mailTo = Array.isArray(to) ? to : [to];
    let mailSubject = subject;
    let mailHtml = html;
    let mailText = text;
    let mailReplyTo = replyTo || reply_to || 'team@zyroo.org';
    const mailFrom = sanitizedFrom(from);

    if (isContact) {
      // Honeypot: silently accept bots without sending or storing.
      if (website && String(website).trim() !== '') {
        console.log('[send-email] Contact honeypot triggered — silently dropped.');
        return new Response(JSON.stringify({ success: true, id: null, honeypot: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const senderEmail = String(contactEmail || '').trim();
      const cleanName = String(name || '').trim().slice(0, MAX_NAME_LEN);
      const cleanSubject = String(subject || '').trim().slice(0, MAX_SUBJECT_LEN);
      const cleanMessage = String(message || '').trim().slice(0, MAX_MESSAGE_LEN);
      const cleanCategory = String(category || 'general').trim().slice(0, 40);

      if (!isPlainEmail(senderEmail) || !cleanName || !cleanMessage) {
        return new Response(JSON.stringify({ error: 'Name, a valid email and a message are required.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      for (const r of mailTo) {
        if (!CONTACT_TO_ALLOWLIST.includes(String(r).trim().toLowerCase())) {
          console.warn(`[send-email] Contact mode rejected non-allowlisted recipient: ${r}`);
          return new Response(JSON.stringify({ error: 'Invalid recipient' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const adminClient = serviceRole && supabaseUrl ? createClient(supabaseUrl, serviceRole) : null;

      if (adminClient) {
        const emailCount = await countRecentRows(adminClient, 'email', senderEmail.toLowerCase());
        if (emailCount >= RATE_EMAIL_MAX) {
          console.warn(`[send-email] Rate limited (email): ${senderEmail}`);
          return new Response(JSON.stringify({ error: 'Too many submissions. Please wait a few minutes and try again.' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const ipHash = await sha256Hex(ip);
        const ipCount = await countRecentRows(adminClient, 'ip_hash', ipHash);
        if (ipCount >= RATE_IP_MAX) {
          console.warn(`[send-email] Rate limited (ip): ${ip}`);
          return new Response(JSON.stringify({ error: 'Too many submissions. Please wait a few minutes and try again.' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Persist to contact_messages (service role) — best effort, non-blocking.
        try {
          const { error: dbErr } = await adminClient.from('contact_messages').insert({
            name: cleanName,
            email: senderEmail,
            subject: cleanSubject,
            category: cleanCategory,
            message: cleanMessage,
            ip_hash: ipHash, // stable SHA-256 of the client IP (never the raw IP)
          });
          if (dbErr) console.error('[send-email] Failed to persist contact message:', dbErr);
        } catch (dbErr) {
          console.error('[send-email] contact_messages persistence error:', dbErr);
        }
      } else {
        console.warn('[send-email] No service role configured — skipping rate limit + persistence.');
      }

      mailSubject = cleanSubject || `[Contact] ${cleanCategory}`;
      mailHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px;">
  <h2 style="color:#111827;">New Contact Submission (${sanitizeHtml(cleanCategory)})</h2>
  <table style="border-collapse:collapse; width:100%; font-size:14px;">
    <tr><td style="padding:6px 0; color:#6b7280; width:120px;">Name</td><td style="padding:6px 0; font-weight:600;">${sanitizeHtml(cleanName)}</td></tr>
    <tr><td style="padding:6px 0; color:#6b7280;">Email</td><td style="padding:6px 0;"><a href="mailto:${sanitizeHtml(senderEmail)}">${sanitizeHtml(senderEmail)}</a></td></tr>
    <tr><td style="padding:6px 0; color:#6b7280;">Subject</td><td style="padding:6px 0;">${sanitizeHtml(cleanSubject || '—')}</td></tr>
    <tr><td style="padding:6px 0; color:#6b7280;">Category</td><td style="padding:6px 0;">${sanitizeHtml(cleanCategory)}</td></tr>
  </table>
  <hr style="border:none; border-top:1px solid #e5e7eb; margin:16px 0;" />
  <p style="font-size:14px; line-height:1.6; white-space:pre-wrap; color:#374151;">${sanitizeHtml(cleanMessage)}</p>
  <hr style="border:none; border-top:1px solid #e5e7eb; margin:16px 0;" />
  <p style="color:#9ca3af; font-size:12px;">Sent from the ZYR0 contact form. Reply from your inbox to reach ${sanitizeHtml(senderEmail)} directly.</p>
</div>`;
      mailText = `New Contact Submission (${cleanCategory})\n\nName: ${cleanName}\nEmail: ${senderEmail}\nSubject: ${cleanSubject || '—'}\n\n${cleanMessage}\n\n— Sent from the ZYR0 contact form.`;
      mailReplyTo = senderEmail; // replies go back to the submitter
    } else {
      // Internal (authenticated) mode: caller must present the shared token.
      const providedToken = req.headers.get('x-internal-token');
      if (!INTERNAL_TOKEN || !providedToken || providedToken !== INTERNAL_TOKEN) {
        console.warn('[send-email] Internal send rejected: missing/invalid x-internal-token.');
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      mailReplyTo = allowUserReplyTo === true
        ? (replyTo || reply_to || 'team@zyroo.org')
        : sanitizedReplyTo(replyTo || reply_to);
    }

    console.log(`[send-email] Sanitized sender info: from="${mailFrom}", replyTo="${mailReplyTo}"`);

    const SMTP_FROM = Deno.env.get('SMTP_FROM') || mailFrom;
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
          to: mailTo.join(', '),
          replyTo: mailReplyTo,
          subject: mailSubject,
          text: mailText,
          html: mailHtml,
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
      const missingSmtp = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']
        .filter((key) => !Deno.env.get(key));
      console.log(`[send-email] Skipping SMTP delivery: missing env var(s): ${missingSmtp.join(', ')}`);
    }

    // Fallback to Resend API
    if (RESEND_API_KEY) {
      console.log(`[send-email] Attempting Resend API delivery to ${JSON.stringify(mailTo)}...`);
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: mailFrom,
            to: mailTo,
            reply_to: mailReplyTo,
            subject: mailSubject,
            html: mailHtml,
            text: mailText || undefined,
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

    const failureDetail = lastError
      ? `Email sending failed. SMTP/Resend errors: ${lastError.message || lastError}`
      : 'Neither SMTP nor Resend API keys are configured.';

    console.error(`[send-email] ${failureDetail}`);
    return new Response(JSON.stringify({ error: failureDetail }), {
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
