import { supabase } from '@/lib/supabase';

/** Get all active certificates for current user */
export async function getMyCertificates() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };

  return supabase
    .from('certificates')
    .select(`
      *,
      company:companies!company_id (id, name, logo_url),
      internship:internships!internship_id (id, title, domain)
    `)
    .eq('recipient_id', user.id)
    .order('issue_date', { ascending: false });
}

/** Verify a certificate by credential ID (public — no auth needed) */
export async function verifyCertificate(credentialId: string) {
  return supabase
    .from('certificates')
    .select(`
      *,
      recipient:profiles!recipient_id (id, full_name, avatar_url),
      company:companies!company_id (id, name, logo_url),
      internship:internships!internship_id (id, title)
    `)
    .eq('credential_id', credentialId)
    .single();
}


/** Get certificates for a company's interns */
export async function getCompanyCertificates(company_id: string) {
  return supabase
    .from('certificates')
    .select(`
      *,
      recipient:profiles!recipient_id (id, full_name, avatar_url, university),
      internship:internships!internship_id (id, title)
    `)
    .eq('company_id', company_id)
    .order('issue_date', { ascending: false });
}

/** Issue a certificate (via Edge Function) */
export async function issueCertificate(data: {
  internship_id: string;
  recipient_id: string;
  title: string;
  skills?: string[];
  description?: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();

  return supabase.functions.invoke('issue-certificate', {
    body: data,
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });
}

/** Revoke a certificate (admin only) */
export async function revokeCertificate(id: string) {
  return supabase
    .from('certificates')
    .update({ status: 'Revoked' })
    .eq('id', id);
}
