// Edge Function: analytics
// GET /functions/v1/analytics
// Admin only — returns aggregated platform stats

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

    // Verify admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user!.id).single();
    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
    }

    // Parallel aggregations
    const [
      { count: totalUsers },
      { count: totalCompanies },
      { count: activeInternships },
      { count: totalApplications },
      { count: totalCertificates },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('companies').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
      supabaseAdmin.from('internships').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
      supabaseAdmin.from('applications').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('certificates').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
    ]);

    // Applications by domain (for pie chart)
    const { data: domainStats } = await supabaseAdmin
      .from('internships')
      .select('domain, applicant_count');

    const domainBreakdown = domainStats?.reduce((acc: Record<string, number>, row) => {
      acc[row.domain || 'Other'] = (acc[row.domain || 'Other'] || 0) + (row.applicant_count || 0);
      return acc;
    }, {});

    // Applications over last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentApps } = await supabaseAdmin
      .from('applications')
      .select('applied_at')
      .gte('applied_at', thirtyDaysAgo)
      .order('applied_at');

    // Group by day
    const appsByDay = recentApps?.reduce((acc: Record<string, number>, row) => {
      const day = row.applied_at.slice(0, 10);
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    // User role breakdown
    const { data: roleStats } = await supabaseAdmin
      .from('profiles')
      .select('role');
    const roleBreakdown = roleStats?.reduce((acc: Record<string, number>, row) => {
      acc[row.role] = (acc[row.role] || 0) + 1;
      return acc;
    }, {});

    return new Response(JSON.stringify({
      summary: {
        total_users: totalUsers,
        active_companies: totalCompanies,
        active_internships: activeInternships,
        total_applications: totalApplications,
        total_certificates: totalCertificates,
      },
      domain_breakdown: domainBreakdown,
      applications_by_day: appsByDay,
      user_role_breakdown: roleBreakdown,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
