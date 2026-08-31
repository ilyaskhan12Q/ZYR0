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

function buildBroadcastHtml(title: string, message: string, actionUrl?: string): string {
  const actionButton = actionUrl
    ? `<tr><td align="center" style="padding: 24px 0 0;"><a href="${actionUrl}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;background-color:#1e3a8a;border:1px solid #b89c56;">Learn More</a></td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:32px 16px;background-color:#f8fafc;font-family:'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc;">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 10px 25px rgba(15,23,42,0.06);">
      <tr><td style="padding:36px 40px 24px;text-align:center;background-color:#1e3a8a;border-bottom:3px solid #b89c56;">
        <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;letter-spacing:6px;color:#ffffff;">ZYR0</p>
        <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#f1c40f;">Product Update</p>
      </td></tr>
      <tr><td style="padding:36px 40px;">
        <h2 style="margin:0 0 16px;font-size:20px;color:#0f172a;">${title}</h2>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#334155;">${message}</p>
        ${actionButton}
      </td></tr>
      <tr><td style="padding:24px 40px 32px;text-align:center;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
        <p style="margin:0 0 6px;font-size:11px;color:#94a3b8;">You're receiving this because you opted in to product updates.</p>
        <p style="margin:0;font-size:11px;color:#94a3b8;">© 2026 ZYR0. All rights reserved. | <a href="https://zyroo.org/student/settings" style="color:#1e3a8a;text-decoration:none;">Manage Preferences</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
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
    const recipients = users.filter((u) => {
      // We need to check settings.emailProductUpdates
      // Since we can't filter jsonb in the query easily, we fetch all and filter here
      return true; // Will be filtered below when we check settings
    });

    // Fetch settings for each user and filter
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
