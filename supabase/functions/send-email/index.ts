// Edge Function: send-email
// POST /functions/v1/send-email
// Body: { to, subject, html, from, text, attachments, kind?, allowUserReplyTo?, website? }
// Uses SMTP (if configured) or Resend fallback
// Responds with { success: true, id, provider } where `id` is the provider
// message/email id regardless of which backend delivered (SMTP → messageId,
// Resend → email id), so callers can persist a single traceable id.
//
// Security model:
// - Non-contact (internal) sends require EITHER an authenticated admin/company JWT
//   (browser flows: TeamApplications shortlists, company offer letters) OR the
//   server-only `x-internal-token` == EMAIL_INTERNAL_TOKEN (server-to-server:
//   issue-certificate). The token is never shipped to browsers; clients rely on
//   their session JWT, attached automatically by supabase.functions.invoke.
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
      mailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Submission</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #f8fafc; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 36px 40px 24px; text-align: center; background-color: #1e3a8a; border-bottom: 3px solid #b89c56;">
              <p style="margin: 0 0 6px; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #ffffff;">ZYR0</p>
              <p style="margin: 0; font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #f1c40f;">New Inquiry Received</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 40px;">
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #334155;">
                A user has submitted a new message through the ZYR0 platform contact form. Details are summarized below:
              </p>

              <!-- Submission Details Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #f8fafc;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; line-height: 1.7; color: #334155;">
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; width: 110px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Name</td>
                        <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${sanitizeHtml(cleanName)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; width: 110px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Email</td>
                        <td style="padding: 6px 0;"><a href="mailto:${sanitizeHtml(senderEmail)}" style="color: #1e3a8a; font-weight: 600; text-decoration: none;">${sanitizeHtml(senderEmail)}</a></td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; width: 110px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Subject</td>
                        <td style="padding: 6px 0; color: #0f172a;">${sanitizeHtml(cleanSubject || '—')}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; width: 110px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Category</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${sanitizeHtml(cleanCategory)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #b89c56;">Message</p>
              <div style="margin: 0 0 28px; padding: 16px 20px; background-color: #f1f5f9; border-left: 4px solid #1e3a8a; border-radius: 4px; font-size: 14.5px; line-height: 1.8; color: #0f172a; white-space: pre-wrap;">${sanitizeHtml(cleanMessage)}</div>

              <!-- Quick Action Bar for Admins -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; text-align: center;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #1e3a8a; box-shadow: 0 4px 12px rgba(30, 58, 138, 0.25);">
                    <a href="mailto:${sanitizeHtml(senderEmail)}" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 8px; border: 1px solid #b89c56;">✉️ Reply Directly to Sender</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 6px; font-size: 11px; color: #94a3b8;">Sent automatically from the ZYR0 platform contact engine.</p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">© 2026 ZYR0. All rights reserved. | <a href="mailto:team@zyroo.org" style="color: #1e3a8a; text-decoration: none;">team@zyroo.org</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
      mailText = `New Contact Submission (${cleanCategory})\n\nName: ${cleanName}\nEmail: ${senderEmail}\nSubject: ${cleanSubject || '—'}\n\nMessage:\n${cleanMessage}\n\n— Sent automatically from the ZYR0 contact form. Reply directly to this email to reach the user.`;
      mailReplyTo = senderEmail; // replies go back to the submitter
    } else {
      // Internal (authenticated) mode. Accept the call when EITHER:
      //  1. a valid JWT whose profile role is admin or company
      //     (browser flows: TeamApplications shortlists, company offer letters), or
      //  2. the server-only token `x-internal-token` == EMAIL_INTERNAL_TOKEN
      //     (reserved for server-to-server callers such as issue-certificate).
      const providedToken = req.headers.get('x-internal-token');
      const tokenOk = !!INTERNAL_TOKEN && !!providedToken && providedToken === INTERNAL_TOKEN;

      let jwtOk = false;
      const authHeader = req.headers.get('Authorization');
      const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      if (authHeader?.startsWith('Bearer ') && serviceRole && supabaseUrl) {
        try {
          const adminClient = createClient(supabaseUrl, serviceRole);
          const { data: { user }, error: authError } = await adminClient.auth.getUser(authHeader.replace('Bearer ', ''));
          if (!authError && user) {
            const { data: profile } = await adminClient
              .from('profiles').select('role').eq('id', user.id).single();
            jwtOk = profile?.role === 'admin' || profile?.role === 'company';
          }
        } catch (authErr) {
          console.warn('[send-email] JWT auth check failed:', authErr);
        }
      }

      if (!tokenOk && !jwtOk) {
        console.warn('[send-email] Internal send rejected: missing/invalid JWT or x-internal-token.');
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
        return new Response(JSON.stringify({ success: true, id: info.messageId, provider: 'smtp' }), {
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
        return new Response(JSON.stringify({ success: true, id: data.id, provider: 'resend' }), {
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
