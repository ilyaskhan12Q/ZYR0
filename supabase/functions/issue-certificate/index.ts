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

    // PostgREST returns related rows as an array — access index [0]
    const companiesData = internship?.companies as Array<{ owner_id: string }> | null;
    const isOwner = companiesData?.[0]?.owner_id === user.id;
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

    return new Response(JSON.stringify({ certificate }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
