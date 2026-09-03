// Edge Function: send-notification-email
// POST /functions/v1/send-notification-email
// Body: { userId, type, title, message, actionUrl }
// Checks user preferences in profiles.settings, sends email via Resend/SMTP if enabled.

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
    case 'task': return 'Task Assignment';
    case 'message': return 'New Message';
    case 'deadline': return 'Deadline Reminder';
    case 'product_update': return 'Platform Update';
    default: return 'Notification';
  }
}

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

function buildEmailHtml(title: string, message: string, rawActionUrl?: string): string {
  const safeActionUrl = normalizeActionUrl(rawActionUrl);
  const sanitizedTitle = sanitizeHtml(title);
  const sanitizedMessage = sanitizeHtml(message);

  const actionButton = safeActionUrl
    ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 20px;">
        <tr>
          <td align="center">
            <a href="${safeActionUrl}" style="display: inline-block; padding: 13px 32px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px; background-color: #0f172a; letter-spacing: 0.2px;">
              View Details in Workspace
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
                    <span style="font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #94a3b8;">OFFICIAL NOTICE</span>
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

              <!-- Structured Details Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 28px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px;">
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; width: 110px; font-weight: 500;">Notice Type:</td>
                        <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">Transactional Notification</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; font-weight: 500;">Platform:</td>
                        <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">ZYR0 Workspace</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

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
                You are receiving this communication regarding your active internship program engagement on ZYR0.
              </p>
              <p style="margin: 0; color: #94a3b8;">
                &copy; 2026 ZYR0 Global. All rights reserved. &bull; <a href="mailto:support@zyroo.org" style="color: #475569; text-decoration: underline;">support@zyroo.org</a>
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
    const safeUrl = normalizeActionUrl(actionUrl);
    const html = buildEmailHtml(title, message, safeUrl);
    const text = `${title}\n\n${message}\n\n${safeUrl ? `View details: ${safeUrl}` : ''}\n\n---\nZYR0 Official Notification\nhttps://zyroo.org`;

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
