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
        const emailSubject = `Certificate Issued: ${title} - Zyro`;
        const siteUrl = Deno.env.get('SITE_URL') || 'https://zyroo.dpdns.org';
        
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">Certificate of Completion! 🎉</h1>
              <p style="color: #6b7280; margin: 4px 0 0 0;">issued via Zyro</p>
            </div>
            <p>Dear <strong>${student.full_name}</strong>,</p>
            <p>Congratulations on successfully completing your internship! We are proud to issue you the certificate for <strong>${title}</strong>.</p>
            <p style="margin: 16px 0; padding: 12px; background-color: #f9fafb; border-radius: 6px; font-family: monospace;">
              <strong>Credential ID:</strong> ${credentialId}
            </p>
            <p>You can view, verify, or download your digital certificate online on the Zyro Platform.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${siteUrl}/verify-certificate/${credentialId}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Verified Certificate</a>
            </div>
            <p style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 24px;">
              Verify this digital credential securely on the Zyro network.
            </p>
          </div>
        `;

        await fetch(sendEmailUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            to: student.email,
            subject: emailSubject,
            html: emailHtml,
          }),
        });
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
