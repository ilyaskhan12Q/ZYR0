// Edge Function: send-notification-email
// POST /functions/v1/send-notification-email
// Body: { userId, type, title, message, actionUrl }
// Checks user preferences in profiles.settings, sends email via Resend if enabled.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STUDENT_SETTINGS_DEFAULTS = {
  emailApps: true,
  emailTasks: true,
  emailMessages: true,
  emailDeadlines: true,
  emailProductUpdates: true,
};

function getEmailEnabled(type: string, settings: Record<string, unknown>): boolean {
  const defaults = STUDENT_SETTINGS_DEFAULTS;
  switch (type) {
    case 'application': return (settings.emailApps as boolean) ?? defaults.emailApps;
    case 'task': return (settings.emailTasks as boolean) ?? defaults.emailTasks;
    case 'message': return (settings.emailMessages as boolean) ?? defaults.emailMessages;
    case 'deadline': return (settings.emailDeadlines as boolean) ?? defaults.emailDeadlines;
    case 'product_update': return (settings.emailProductUpdates as boolean) ?? defaults.emailProductUpdates;
    default: return true;
  }
}

function getSubjectPrefix(type: string): string {
  switch (type) {
    case 'application': return 'Application Update';
    case 'task': return 'New Task Assignment';
    case 'message': return 'New Message';
    case 'deadline': return 'Deadline Reminder';
    case 'product_update': return 'Product Update';
    default: return 'Notification';
  }
}

function buildEmailHtml(title: string, message: string, actionUrl?: string): string {
  const actionButton = actionUrl
    ? `<tr><td align="center" style="padding: 24px 0 0;"><a href="${actionUrl}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;background-color:#1e3a8a;border:1px solid #b89c56;">View Details</a></td></tr>`
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
        <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#f1c40f;">Notification</p>
      </td></tr>
      <tr><td style="padding:36px 40px;">
        <h2 style="margin:0 0 16px;font-size:20px;color:#0f172a;">${title}</h2>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#334155;">${message}</p>
        ${actionButton}
      </td></tr>
      <tr><td style="padding:24px 40px 32px;text-align:center;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
        <p style="margin:0 0 6px;font-size:11px;color:#94a3b8;">This is a transactional notification from ZYR0.</p>
        <p style="margin:0;font-size:11px;color:#94a3b8;">© 2026 ZYR0. All rights reserved. | <a href="mailto:team@zyroo.org" style="color:#1e3a8a;text-decoration:none;">team@zyroo.org</a></p>
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
    const body = await req.json();
    const { userId, type, title, message, actionUrl } = body;

    if (!userId || !type || !title || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields: userId, type, title, message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    if (!serviceRole || !supabaseUrl) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRole);

    // Fetch user profile with settings
    const { data: profile, error: profileErr } = await adminClient
      .from('profiles')
      .select('settings, email, full_name')
      .eq('id', userId)
      .single();

    if (profileErr || !profile) {
      console.error('[send-notification-email] Profile fetch failed:', profileErr);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!profile.email) {
      return new Response(JSON.stringify({ error: 'User has no email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if email is enabled for this notification type
    const settings = (profile.settings as Record<string, unknown>) || {};
    const emailEnabled = getEmailEnabled(type, settings);

    if (!emailEnabled) {
      console.log(`[send-notification-email] Email disabled for user ${userId}, type: ${type}`);
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'email_disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build and send email
    const subjectPrefix = getSubjectPrefix(type);
    const subject = `[ZYR0] ${subjectPrefix}: ${title}`;
    const html = buildEmailHtml(title, message, actionUrl);
    const text = `${title}\n\n${message}\n\n${actionUrl ? `View details: ${actionUrl}` : ''}`;

    const sendEmailUrl = `${supabaseUrl}/functions/v1/send-email`;
    const response = await fetch(sendEmailUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRole,
        'Authorization': `Bearer ${serviceRole}`,
        'x-internal-token': Deno.env.get('EMAIL_INTERNAL_TOKEN') || '',
      },
      body: JSON.stringify({
        to: profile.email,
        from: 'ZYR0 Team <team@zyroo.org>',
        replyTo: 'team@zyroo.org',
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[send-notification-email] Email send failed: ${response.status} ${errText}`);
      return new Response(JSON.stringify({ error: 'Email delivery failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    console.log(`[send-notification-email] Email sent to ${profile.email}, id: ${result.id}`);

    return new Response(JSON.stringify({ success: true, id: result.id, provider: result.provider }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[send-notification-email] Unexpected error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
