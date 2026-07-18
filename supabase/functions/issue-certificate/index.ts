// Edge Function: issue-certificate
// POST /functions/v1/issue-certificate
// Body: { internship_id, recipient_id, title, skills, description }
// Auth: company owner or admin JWT required

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Get calling user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { internship_id, recipient_id, title, skills, description } = body;

    // Validate required fields
    if (!internship_id || !recipient_id || !title) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify caller is the company owner or admin
    const { data: internship } = await supabaseAdmin
      .from('internships')
      .select('company_id, title, companies(owner_id)')
      .eq('id', internship_id)
      .single();

    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // PostgREST returns related rows as an object or array
    const companiesData = internship?.companies as { owner_id: string } | Array<{ owner_id: string }> | null;
    const ownerId = Array.isArray(companiesData) ? companiesData[0]?.owner_id : companiesData?.owner_id;
    const isOwner = ownerId === user.id;
    const isAdmin = callerProfile?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate unique credential ID with retry on collision
    let credentialId = '';
    let certificate = null;
    let insertError = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      const year = new Date().getFullYear();
      const random = Math.floor(100000 + Math.random() * 900000);
      const domainCode = (internship?.title || 'GEN').slice(0, 2).toUpperCase();
      credentialId = `ZYRO-${domainCode}-${year}-${random}`;

      // Generate blockchain-style hash
      const payload = `${credentialId}:${recipient_id}:${internship_id}:${Date.now()}`;
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(payload));
      const blockchainHash = '0x' + Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      const result = await supabaseAdmin
        .from('certificates')
        .insert({
          title,
          recipient_id,
          company_id: internship!.company_id,
          internship_id,
          credential_id: credentialId,
          skills: skills || [],
          description: description || '',
          blockchain_hash: blockchainHash,
          issued_by: user.id,
          status: 'Active',
        })
        .select()
        .single();

      if (!result.error) {
        certificate = result.data;
        insertError = null;
        break;
      }

      // Only retry on unique constraint violation (code 23505)
      if (result.error.code !== '23505') {
        insertError = result.error;
        break;
      }
      insertError = result.error;
    }

    if (insertError) throw insertError;
    if (!certificate) throw new Error('Failed to generate certificate after 3 attempts');

    // Notify recipient
    await supabaseAdmin.from('notifications').insert({
      user_id: recipient_id,
      type: 'certificate',
      title: 'Certificate Issued! 🎉',
      message: `Your certificate for "${title}" has been issued.`,
      action_url: `/student/certificates/${certificate.id}`,
    });

    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      user_id: user.id,
      action: 'issued certificate',
      target: title,
      target_type: 'certificate',
      details: `Credential ID: ${credentialId}`,
    });

    // Notify recipient via email
    const { data: student } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', recipient_id)
      .single();

    if (student?.email) {
      try {
        const sendEmailUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`;
        const emailSubject = `Certificate of Completion: ${title}`;
        const siteUrl = Deno.env.get('SITE_URL') || 'https://zyroo.dpdns.org';
        
        const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate of Completion</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 20px 0;">
    <tr>
      <td align="center">
        <div style="max-width: 580px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; text-align: left; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 32px; border-bottom: 1px solid #f1f5f9; padding-bottom: 24px;">
            <h2 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">Certificate of Completion</h2>
            <p style="color: #4f46e5; margin: 6px 0 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Issued via ZYR0</p>
          </div>
          
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Dear <strong>${student.full_name}</strong>,</p>
          
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">Congratulations on successfully completing your internship. We are proud to issue your official digital certificate for <strong>${title}</strong>.</p>
          
          <div style="margin: 24px 0; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; text-align: center;">
            <span style="display: block; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; margin-bottom: 4px;">Credential ID</span>
            <strong style="color: #0f172a; font-size: 15px; letter-spacing: 0.05em;">${credentialId}</strong>
          </div>
          
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">You can view, download, or verify the authenticity of your digital certificate online on the ZYR0 platform.</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${siteUrl}/verify-certificate/${credentialId}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.15);">View Verified Certificate</a>
          </div>
          
          <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; margin-top: 32px;">
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 8px 0;">Verify this digital credential securely on the ZYR0 network at any time using your credential ID.</p>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">Best regards,<br><strong>The ZYR0 Team</strong></p>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 32px; text-align: center;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0 0 4px 0;">This email was sent to notify you of a digital credential issued via ZYR0.</p>
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">© 2026 ZYR0. All rights reserved. | <a href="mailto:team@zyroo.dpdns.org" style="color: #4f46e5; text-decoration: none;">team@zyroo.dpdns.org</a></p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;

        const emailText = `Dear ${student.full_name},\n\n` +
          `Congratulations on successfully completing your internship! We are proud to issue your official digital certificate for ${title}.\n\n` +
          `Credential ID: ${credentialId}\n\n` +
          `You can view, download, or verify the authenticity of your digital certificate online on the ZYR0 platform:\n` +
          `${siteUrl}/verify-certificate/${credentialId}\n\n` +
          `Verify this digital credential securely on the ZYR0 network at any time using your credential ID.\n\n` +
          `Best regards,\n` +
          `The ZYR0 Team\n` +
          `team@zyroo.dpdns.org`;

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const response = await fetch(sendEmailUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            to: student.email,
            from: 'ZYR0 Team <team@zyroo.dpdns.org>',
            replyTo: 'team@zyroo.dpdns.org',
            subject: emailSubject,
            html: emailHtml,
            text: emailText,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`Failed to send certificate email. Status: ${response.status}, Error: ${errText}`);
        } else {
          console.log(`Certificate email successfully dispatched to ${student.email}`);
        }
      } catch (emailErr) {
        console.error('Failed to dispatch certificate email notification:', emailErr);
      }
    }

    return new Response(JSON.stringify({ certificate }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
