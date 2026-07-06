// Edge Function: verify-certificate
// GET /functions/v1/verify-certificate?credential_id=ZYRO-SE-2024-001234
// Public — no auth required

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let credentialId: string | null = null;

    // Support both POST body { credential_id } and GET query param ?credential_id=
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      credentialId = body.credential_id ?? null;
    } else {
      const url = new URL(req.url);
      credentialId = url.searchParams.get('credential_id');
    }

    if (!credentialId) {
      return new Response(JSON.stringify({ error: 'credential_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(`
        *,
        recipient:profiles!recipient_id (full_name, avatar_url),
        company:companies!company_id (name, logo_url),
        internship:internships!internship_id (title, domain)
      `)
      .eq('credential_id', credentialId)
      .single();

    if (error || !certificate) {
      return new Response(JSON.stringify({
        valid: false,
        error: 'Certificate not found',
      }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (certificate.status === 'Revoked') {
      return new Response(JSON.stringify({
        valid: false,
        revoked: true,
        credential_id: credentialId,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      valid: true,
      certificate: {
        id: certificate.id,
        title: certificate.title,
        credential_id: certificate.credential_id,
        issue_date: certificate.issue_date,
        blockchain_hash: certificate.blockchain_hash,
        skills: certificate.skills,
        description: certificate.description,
        status: certificate.status,
        recipient_name: certificate.recipient?.full_name,
        company_name: certificate.company?.name,
        company_logo: certificate.company?.logo_url,
        internship_title: certificate.internship?.title,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
