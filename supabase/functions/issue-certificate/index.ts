// Edge Function: issue-certificate
// POST /functions/v1/issue-certificate
// Body: { internship_id, recipient_id, title, skills, description, certificate_id }
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
    const { internship_id, recipient_id, title, skills, description, certificate_id, start_date, end_date } = body;

    // Resend flow
    if (certificate_id) {
      console.log(`[issue-certificate] Resend email requested for certificate: ${certificate_id}`);
      
      const { data: certificate, error: fetchErr } = await supabaseAdmin
        .from('certificates')
        .select('*')
        .eq('id', certificate_id)
        .single();
      
      if (fetchErr || !certificate) {
        return new Response(JSON.stringify({ error: 'Certificate not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify caller is owner of the company that issued the certificate, or admin
      const { data: callerProfile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      const { data: companyData } = await supabaseAdmin
        .from('companies')
        .select('owner_id')
        .eq('id', certificate.company_id)
        .single();
      
      const isOwner = companyData?.owner_id === user.id;
      const isAdmin = callerProfile?.role === 'admin';

      if (!isOwner && !isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch the student profile
      const { data: student } = await supabaseAdmin
        .from('profiles')
        .select('full_name, email')
        .eq('id', certificate.recipient_id)
        .single();

      if (!student || !student.email) {
        return new Response(JSON.stringify({ error: 'Recipient profile or email not found' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let email_error = null;
      try {
        const sendEmailUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`;
        const emailSubject = `Certificate of Completion: ${certificate.title}`;
        const siteUrl = Deno.env.get('SITE_URL') || 'https://zyroo.org';
        const linkedInUrl = 'https://www.linkedin.com/company/zyr0-co/';
        const whatsAppCommunityUrl = 'https://chat.whatsapp.com/EfivEcFI4cJ8pWnbW9OmWh';
        const whatsAppChannelUrl = 'https://whatsapp.com/channel/0029Vb8m3OK5Ui2W8xNLgy0F';
        
        const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate of Completion</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #f1ece0; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1ece0;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #fffdf5; border: 1px solid #b89c56; box-shadow: 0 10px 30px rgba(25, 21, 18, 0.08);">
          <tr>
            <td style="padding: 36px 40px 22px; text-align: center; border-bottom: 1px solid #e8dcc0;">
              <p style="margin: 0 0 10px; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 700; letter-spacing: 5px; color: #1e3a8a;">ZYR0</p>
              <p style="margin: 0; font-size: 11px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: #b89c56;">Certificate of Completion</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.7; color: #13100d;">Dear <strong>${student.full_name}</strong>,</p>
              <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.8; color: #3d372e;">
                Congratulations on completing your internship. Your dedication throughout the program
                has been recognized, and we are pleased to issue your official digital certificate for
                <strong style="color: #1e3a8a;">${certificate.title}</strong>. This credential can be
                viewed, shared, or verified at any time through the ZYR0 platform.
              </p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 26px 0; border: 1px solid #b89c56; background-color: #faf6ea;">
                <tr>
                  <td style="padding: 18px 24px; text-align: center;">
                    <p style="margin: 0 0 6px; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #b89c56;">Credential ID</p>
                    <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 17px; font-weight: 700; letter-spacing: 0.05em; color: #13100d;">${certificate.credential_id}</p>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.8; color: #3d372e;">You may view, download, or verify the authenticity of your digital certificate online on the ZYR0 platform at any time.</p>
              <p style="margin: 22px 0 8px; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #b89c56;">Verify Your Credential</p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 18px auto;">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: #1e3a8a;">
                    <a href="${siteUrl}/verify/${certificate.credential_id}" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 600; letter-spacing: 1px; color: #fffdf5; text-decoration: none; border: 1px solid #b89c56; border-radius: 4px;">View Verified Certificate</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px; font-size: 13.5px; line-height: 1.8; color: #3d372e; text-align: center;">Having trouble viewing your certificate or need assistance? Our support team is ready to help.</p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: transparent; border: 1.5px solid #b89c56;">
                    <a href="${siteUrl}/contact" style="display: inline-block; padding: 12px 28px; font-size: 13px; font-weight: 600; letter-spacing: 1px; color: #1e3a8a; text-decoration: none; border-radius: 4px;">Contact Support</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; font-size: 15px; line-height: 1.8; color: #13100d;">With warm regards,<br><strong style="font-family: Georgia, 'Times New Roman', serif; font-size: 16px;">The ZYR0 Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 40px 32px; text-align: center; border-top: 1px solid #e8dcc0;">
              <p style="margin: 0 0 12px; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #b89c56;">Explore ZYR0</p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 420px; margin: 0 auto 20px;">
                <tr>
                  <td align="center" style="padding: 5px 0;">
                    <a href="${siteUrl}" style="font-size: 12px; line-height: 1.8; color: #1e3a8a; text-decoration: none;">Website</a>
                    <span style="color: #b89c56; padding: 0 8px;">·</span>
                    <a href="${siteUrl}/internships" style="font-size: 12px; line-height: 1.8; color: #1e3a8a; text-decoration: none;">Browse Internships</a>
                    <span style="color: #b89c56; padding: 0 8px;">·</span>
                    <a href="${siteUrl}/companies" style="font-size: 12px; line-height: 1.8; color: #1e3a8a; text-decoration: none;">For Companies</a>
                    <span style="color: #b89c56; padding: 0 8px;">·</span>
                    <a href="${siteUrl}/contact" style="font-size: 12px; line-height: 1.8; color: #1e3a8a; text-decoration: none;">Contact</a>
                    <span style="color: #b89c56; padding: 0 8px;">·</span>
                    <a href="${siteUrl}/help" style="font-size: 12px; line-height: 1.8; color: #1e3a8a; text-decoration: none;">Help Center</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 12px; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #b89c56;">Stay Connected</p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 420px; margin: 0 auto 22px;">
                <tr>
                  <td align="center" style="padding: 5px 0;">
                    <a href="${linkedInUrl}" style="font-size: 12px; line-height: 1.8; color: #1e3a8a; text-decoration: none;">LinkedIn</a>
                    <span style="color: #b89c56; padding: 0 4px;">·</span>
                    <a href="${whatsAppCommunityUrl}" style="font-size: 12px; line-height: 1.8; color: #1e3a8a; text-decoration: none;">WhatsApp Community</a>
                    <span style="color: #b89c56; padding: 0 4px;">·</span>
                    <a href="${whatsAppChannelUrl}" style="font-size: 12px; line-height: 1.8; color: #1e3a8a; text-decoration: none;">WhatsApp Channel</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 6px; font-size: 11px; color: #8a7f6c;">This email was sent to notify you of a digital credential issued via ZYR0.</p>
              <p style="margin: 0; font-size: 11px; color: #8a7f6c;">© 2026 ZYR0. All rights reserved. | <a href="mailto:team@zyroo.org" style="color: #1e3a8a; text-decoration: none;">team@zyroo.org</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        const emailText = `Dear ${student.full_name},\n\n` +
          `Congratulations on completing your internship. Your dedication throughout the program has been recognized, and we are pleased to issue your official digital certificate for ${certificate.title}.\n\n` +
          `Credential ID: ${certificate.credential_id}\n\n` +
          `You can view, download, or verify the authenticity of your digital certificate online on the ZYR0 platform:\n` +
          `${siteUrl}/verify/${certificate.credential_id}\n\n` +
          `Having trouble viewing your certificate? Contact our support team:\n` +
          `${siteUrl}/contact\n\n` +
          `Explore ZYR0:\n` +
          `- Website: ${siteUrl}\n` +
          `- Browse Internships: ${siteUrl}/internships\n` +
          `- For Companies: ${siteUrl}/companies\n` +
          `- Contact: ${siteUrl}/contact\n` +
          `- Help Center: ${siteUrl}/help\n\n` +
          `Stay Connected:\n` +
          `- LinkedIn: ${linkedInUrl}\n` +
          `- WhatsApp Community: ${whatsAppCommunityUrl}\n` +
          `- WhatsApp Channel: ${whatsAppChannelUrl}\n\n` +
          `With warm regards,\n` +
          `The ZYR0 Team\n` +
          `team@zyroo.org`;

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        console.log(`[issue-certificate] Invoking send-email endpoint for resend: to=${student.email}`);
        const response = await fetch(sendEmailUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'x-internal-token': Deno.env.get('EMAIL_INTERNAL_TOKEN') || '',
          },
          body: JSON.stringify({
            to: student.email,
            from: 'ZYR0 Team <team@zyroo.org>',
            replyTo: 'team@zyroo.org',
            subject: emailSubject,
            html: emailHtml,
            text: emailText,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          email_error = `Failed to send certificate email. Status: ${response.status}, Error: ${errText}`;
          console.error(`[issue-certificate] ${email_error}`);
        } else {
          console.log(`[issue-certificate] Certificate email successfully dispatched to ${student.email}`);
          const { error: updateErr } = await supabaseAdmin
            .from('certificates')
            .update({ email_sent: true })
            .eq('id', certificate.id);
          if (updateErr) {
            console.error(`[issue-certificate] Failed to update certificate email_sent status in DB:`, updateErr);
          } else {
            console.log(`[issue-certificate] Successfully updated certificate ${certificate.id} email_sent = true in DB`);
            certificate.email_sent = true;
          }
        }
      } catch (emailErr) {
        email_error = `Failed to dispatch certificate email notification: ${emailErr.message}`;
        console.error(`[issue-certificate] ${email_error}`);
      }

      return new Response(JSON.stringify({ certificate, email_error }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate required fields for main flow
    if (!internship_id || !recipient_id || !title) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify caller is the company owner or admin
    const { data: internship } = await supabaseAdmin
      .from('internships')
      .select('company_id, title, start_date, end_date, companies(owner_id)')
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
          email_sent: false,
          start_date: start_date || internship?.start_date || null,
          end_date: end_date || internship?.end_date || null,
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

    // Notify recipient via platform notification
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

    let email_error = null;
    if (student?.email) {
      try {
        const sendEmailUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`;
        const emailSubject = `Certificate of Completion: ${title}`;
        const siteUrl = Deno.env.get('SITE_URL') || 'https://zyroo.org';
        const linkedInUrl = 'https://www.linkedin.com/company/zyr0-co/';
        const whatsAppCommunityUrl = 'https://chat.whatsapp.com/EfivEcFI4cJ8pWnbW9OmWh';
        const whatsAppChannelUrl = 'https://whatsapp.com/channel/0029Vb8m3OK5Ui2W8xNLgy0F';
        
        const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate of Completion</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #f1ece0; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1ece0;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #fffdf5; border: 1px solid #b89c56; box-shadow: 0 10px 30px rgba(25, 21, 18, 0.08);">
          <tr>
            <td style="padding: 36px 40px 22px; text-align: center; border-bottom: 1px solid #e8dcc0;">
              <p style="margin: 0 0 10px; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 700; letter-spacing: 5px; color: #1e3a8a;">ZYR0</p>
              <p style="margin: 0; font-size: 11px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: #b89c56;">Certificate of Completion</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.7; color: #13100d;">Dear <strong>${student.full_name}</strong>,</p>
              <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.8; color: #3d372e;">
                Congratulations on completing your internship. Your dedication throughout the program
                has been recognized, and we are pleased to issue your official digital certificate for
                <strong style="color: #1e3a8a;">${title}</strong>. This credential can be viewed,
                shared, or verified at any time through the ZYR0 platform.
              </p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 26px 0; border: 1px solid #b89c56; background-color: #faf6ea;">
                <tr>
                  <td style="padding: 18px 24px; text-align: center;">
                    <p style="margin: 0 0 6px; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #b89c56;">Credential ID</p>
                    <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 17px; font-weight: 700; letter-spacing: 0.05em; color: #13100d;">${credentialId}</p>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.8; color: #3d372e;">You may view, download, or verify the authenticity of your digital certificate online on the ZYR0 platform at any time.</p>
              <p style="margin: 22px 0 8px; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #b89c56;">Verify Your Credential</p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 18px auto;">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: #1e3a8a;">
                    <a href="${siteUrl}/verify/${credentialId}" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 600; letter-spacing: 1px; color: #fffdf5; text-decoration: none; border: 1px solid #b89c56; border-radius: 4px;">View Verified Certificate</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px; font-size: 13.5px; line-height: 1.8; color: #3d372e; text-align: center;">Having trouble viewing your certificate or need assistance? Our support team is ready to help.</p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: transparent; border: 1.5px solid #b89c56;">
                    <a href="${siteUrl}/contact" style="display: inline-block; padding: 12px 28px; font-size: 13px; font-weight: 600; letter-spacing: 1px; color: #1e3a8a; text-decoration: none; border-radius: 4px;">Contact Support</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; font-size: 15px; line-height: 1.8; color: #13100d;">With warm regards,<br><strong style="font-family: Georgia, 'Times New Roman', serif; font-size: 16px;">The ZYR0 Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 40px 32px; text-align: center; border-top: 1px solid #e8dcc0;">
              <p style="margin: 0 0 12px; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #b89c56;">Explore ZYR0</p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 420px; margin: 0 auto 20px;">
                <tr>
                  <td align="center" style="padding: 5px 0;">
                    <a href="${siteUrl}" style="font-size: 12px; line-height: 1.8; color: #1e3a8a; text-decoration: none;">Website</a>
                    <span style="color: #b89c56; padding: 0 8px;">·</span>
                    <a href="${siteUrl}/internships" style="font-size: 12px; line-height: 1.8; color: #1e3a8a; text-decoration: none;">Browse Internships</a>
                    <span style="color: #b89c56; padding: 0 8px;">·</span>
                    <a href="${siteUrl}/companies" style="font-size: 12px; line-height: 1.8; color: #1e3a8a; text-decoration: none;">For Companies</a>
                    <span style="color: #b89c56; padding: 0 8px;">·</span>
                    <a href="${siteUrl}/contact" style="font-size: 12px; line-height: 1.8; color: #1e3a8a; text-decoration: none;">Contact</a>
                    <span style="color: #b89c56; padding: 0 8px;">·</span>
                    <a href="${siteUrl}/help" style="font-size: 12px; line-height: 1.8; color: #1e3a8a; text-decoration: none;">Help Center</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 12px; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #b89c56;">Stay Connected</p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 420px; margin: 0 auto 22px;">
                <tr>
                  <td align="center" style="padding: 5px 0;">
                    <a href="${linkedInUrl}" style="font-size: 12px; line-height: 1.8; color: #1e3a8a; text-decoration: none;">LinkedIn</a>
                    <span style="color: #b89c56; padding: 0 4px;">·</span>
                    <a href="${whatsAppCommunityUrl}" style="font-size: 12px; line-height: 1.8; color: #1e3a8a; text-decoration: none;">WhatsApp Community</a>
                    <span style="color: #b89c56; padding: 0 4px;">·</span>
                    <a href="${whatsAppChannelUrl}" style="font-size: 12px; line-height: 1.8; color: #1e3a8a; text-decoration: none;">WhatsApp Channel</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 6px; font-size: 11px; color: #8a7f6c;">This email was sent to notify you of a digital credential issued via ZYR0.</p>
              <p style="margin: 0; font-size: 11px; color: #8a7f6c;">© 2026 ZYR0. All rights reserved. | <a href="mailto:team@zyroo.org" style="color: #1e3a8a; text-decoration: none;">team@zyroo.org</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        const emailText = `Dear ${student.full_name},\n\n` +
          `Congratulations on completing your internship. Your dedication throughout the program has been recognized, and we are pleased to issue your official digital certificate for ${title}.\n\n` +
          `Credential ID: ${credentialId}\n\n` +
          `You can view, download, or verify the authenticity of your digital certificate online on the ZYR0 platform:\n` +
          `${siteUrl}/verify/${credentialId}\n\n` +
          `Having trouble viewing your certificate? Contact our support team:\n` +
          `${siteUrl}/contact\n\n` +
          `Explore ZYR0:\n` +
          `- Website: ${siteUrl}\n` +
          `- Browse Internships: ${siteUrl}/internships\n` +
          `- For Companies: ${siteUrl}/companies\n` +
          `- Contact: ${siteUrl}/contact\n` +
          `- Help Center: ${siteUrl}/help\n\n` +
          `Stay Connected:\n` +
          `- LinkedIn: ${linkedInUrl}\n` +
          `- WhatsApp Community: ${whatsAppCommunityUrl}\n` +
          `- WhatsApp Channel: ${whatsAppChannelUrl}\n\n` +
          `With warm regards,\n` +
          `The ZYR0 Team\n` +
          `team@zyroo.org`;

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        console.log(`[issue-certificate] Invoking send-email endpoint: to=${student.email}`);
        const response = await fetch(sendEmailUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'x-internal-token': Deno.env.get('EMAIL_INTERNAL_TOKEN') || '',
          },
          body: JSON.stringify({
            to: student.email,
            from: 'ZYR0 Team <team@zyroo.org>',
            replyTo: 'team@zyroo.org',
            subject: emailSubject,
            html: emailHtml,
            text: emailText,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          email_error = `Failed to send certificate email. Status: ${response.status}, Error: ${errText}`;
          console.error(`[issue-certificate] ${email_error}`);
        } else {
          console.log(`[issue-certificate] Certificate email successfully dispatched to ${student.email}`);
          const { error: updateErr } = await supabaseAdmin
            .from('certificates')
            .update({ email_sent: true })
            .eq('id', certificate.id);
          if (updateErr) {
            console.error(`[issue-certificate] Failed to update certificate email_sent status in DB:`, updateErr);
          } else {
            console.log(`[issue-certificate] Successfully updated certificate ${certificate.id} email_sent = true in DB`);
            certificate.email_sent = true;
          }
        }
      } catch (emailErr) {
        email_error = `Failed to dispatch certificate email notification: ${emailErr.message}`;
        console.error(`[issue-certificate] ${email_error}`);
      }
    }

    return new Response(JSON.stringify({ certificate, email_error }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
