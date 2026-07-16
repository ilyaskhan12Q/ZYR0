import { supabase } from '@/lib/supabase';
import { getCachedData, setCachedData } from '@/lib/cache';
import { dedupRequest, createRequestKey } from '@/lib/cache/requestRegistry';

/** Get all active certificates for current user */
export async function getMyCertificates(useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };

  const cacheKey = createRequestKey('my_certificates', user.id);
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => supabase
    .from('certificates')
    .select(`
      *,
      company:companies!company_id (id, name, logo_url),
      internship:internships!internship_id (id, title, domain),
      recipient:profiles!recipient_id (id, full_name, avatar_url),
      issuer:profiles!issued_by (id, full_name, role, title, department)
    `)
    .eq('recipient_id', user.id)
    .order('issue_date', { ascending: false });

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}

/** Verify a certificate by credential ID (public — no auth needed) */
export async function verifyCertificate(credentialId: string, useCache = true) {
  const cacheKey = createRequestKey('verify_certificate', credentialId);
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => supabase
    .from('certificates')
    .select(`
      *,
      recipient:profiles!recipient_id (id, full_name, avatar_url),
      company:companies!company_id (id, name, logo_url),
      internship:internships!internship_id (id, title),
      issuer:profiles!issued_by (id, full_name, role, title, department)
    `)
    .eq('credential_id', credentialId)
    .single();

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}


/** Get certificates for a company's interns */
export async function getCompanyCertificates(company_id: string, useCache = true) {
  const cacheKey = createRequestKey('company_certificates', company_id);
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => supabase
    .from('certificates')
    .select(`
      *,
      recipient:profiles!recipient_id (id, full_name, avatar_url, university),
      internship:internships!internship_id (id, title),
      issuer:profiles!issued_by (id, full_name, role, title, department),
      company:companies!company_id (id, name, logo_url)
    `)
    .eq('company_id', company_id)
    .order('issue_date', { ascending: false });

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
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
