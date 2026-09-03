// Edge Function: send-broadcast
// POST /functions/v1/send-broadcast
// Body: { title, message, targetRole?, actionUrl? }
// Admin-only. Sends product update emails to users with emailProductUpdates enabled.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BATCH_SIZE = 100;

function normalizeActionUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const appUrl = Deno.env.get('APP_URL') || Deno.env.get('SITE_URL') || 'https://zyroo.org';
  const cleanBase = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${cleanBase}${cleanPath}`;
}

function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildBroadcastHtml(title: string, message: string, rawActionUrl?: string): string {
  const safeActionUrl = normalizeActionUrl(rawActionUrl);
  const sanitizedTitle = sanitizeHtml(title);
  const sanitizedMessage = sanitizeHtml(message);

  const actionButton = safeActionUrl
    ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 20px;">
        <tr>
          <td align="center">
            <a href="${safeActionUrl}" style="display: inline-block; padding: 13px 32px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px; background-color: #0f172a; letter-spacing: 0.2px;">
              View Details
            </a>
          </td>
        </tr>
      </table>`
    : '';

  const actionUrlFallback = safeActionUrl
    ? `<p style="margin: 20px 0 0; font-size: 12px; line-height: 1.5; color: #64748b; word-break: break-all;">
        If the button above does not work, copy and paste this link into your browser:<br>
        <a href="${safeActionUrl}" style="color: #0f172a; text-decoration: underline;">${safeActionUrl}</a>
      </p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sanitizedTitle}</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0f172a;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 16px 0;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);">
          
          <!-- Corporate Header -->
          <tr>
            <td style="padding: 28px 36px 20px; background-color: #0f172a; border-bottom: 2px solid #b89c56;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #ffffff;">ZYR0</span>
                  </td>
                  <td align="right">
                    <span style="font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #94a3b8;">PLATFORM NOTICE</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              <h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #0f172a; line-height: 1.4;">
                ${sanitizedTitle}
              </h1>

              <div style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #334155;">
                ${sanitizedMessage}
              </div>

              <!-- Primary Action CTA Button -->
              ${actionButton}

              <!-- Plain-text Link Fallback -->
              ${actionUrlFallback}
            </td>
          </tr>

          <!-- Formal Corporate Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; line-height: 1.6; color: #64748b;">
              <p style="margin: 0 0 4px; font-weight: 500; color: #475569;">
                This is an official administrative transmission from ZYR0.
              </p>
              <p style="margin: 0 0 8px; color: #94a3b8;">
                &copy; 2026 ZYR0 Global. All rights reserved. &bull; <a href="https://zyroo.org" style="color: #475569; text-decoration: underline;">zyroo.org</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Auth check — admin only
    const authHeader = req.headers.get('Authorization');
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!authHeader?.startsWith('Bearer ') || !serviceRole || !supabaseUrl) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRole);
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authErr } = await adminClient.auth.getUser(token);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { title, message, targetRole, actionUrl } = body;

    if (!title || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields: title, message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch users with emailProductUpdates enabled
    let query = adminClient
      .from('profiles')
      .select('id, email, full_name')
      .not('email', 'is', null);

    if (targetRole) {
      query = query.eq('role', targetRole);
    }

    const { data: users, error: usersErr } = await query;

    if (usersErr || !users) {
      return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Filter to users with emailProductUpdates enabled
    const enabledUsers: Array<{ id: string; email: string; full_name: string | null }> = [];

    for (const u of users) {
      const { data: p } = await adminClient
        .from('profiles')
        .select('settings')
        .eq('id', u.id)
        .single();

      const settings = (p?.settings as Record<string, unknown>) || {};
      const emailEnabled = (settings.emailProductUpdates as boolean) ?? true;

      if (emailEnabled) {
        enabledUsers.push(u);
      }
    }

    if (enabledUsers.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, reason: 'no_recipients' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send emails in batches
    let sent = 0;
    let failed = 0;
    const html = buildBroadcastHtml(title, message, actionUrl);
    const text = `${title}\n\n${message}\n\n${actionUrl ? `Learn more: ${actionUrl}` : ''}`;

    for (let i = 0; i < enabledUsers.length; i += BATCH_SIZE) {
      const batch = enabledUsers.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(async (u) => {
          const subject = `[ZYR0] ${title}`;
          const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': serviceRole,
              'Authorization': `Bearer ${serviceRole}`,
              'x-internal-token': Deno.env.get('EMAIL_INTERNAL_TOKEN') || '',
            },
            body: JSON.stringify({
              to: u.email,
              from: 'ZYR0 Team <team@zyroo.org>',
              replyTo: 'team@zyroo.org',
              subject,
              html,
              text,
            }),
          });

          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
      );

      for (const r of results) {
        if (r.status === 'fulfilled') sent++;
        else failed++;
      }
    }

    console.log(`[send-broadcast] Broadcast sent: ${sent} success, ${failed} failed, ${enabledUsers.length} total`);

    return new Response(JSON.stringify({ success: true, sent, failed, total: enabledUsers.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[send-broadcast] Unexpected error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
