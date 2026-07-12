import { supabase } from '@/lib/supabase';
import type { OfferLetterStatus } from '@/lib/database.types';
import { getCachedData, setCachedData, clearCache } from '@/lib/cache';
import { dedupRequest, createRequestKey } from '@/lib/cache/requestRegistry';


// ── Common select fragment ────────────────────────────────────────────────────
const OFFER_LETTER_SELECT = `
  *,
  student:profiles!student_id (id, full_name, avatar_url, university, email),
  company:companies!company_id (id, name, logo_url, location, email),
  internship:internships!internship_id (
    id, title, domain, location, location_type, type,
    duration, start_date, stipend, stipend_type, responsibilities
  ),
  application:applications!application_id (id, status)
`;

// ── Student: read ─────────────────────────────────────────────────────────────

/** Get all offer letters for the currently logged-in student. */
export async function getMyOfferLetters(useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };

  const cacheKey = createRequestKey('my_offer_letters', user.id);
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => supabase
    .from('offer_letters')
    .select(OFFER_LETTER_SELECT)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false });

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}

/** Get a single offer letter by id (student, company, or admin). */
export async function getOfferLetterById(id: string, useCache = true) {
  const cacheKey = createRequestKey('offer_letter', id);
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => supabase
    .from('offer_letters')
    .select(OFFER_LETTER_SELECT)
    .eq('id', id)
    .single();

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}

/** Check whether an offer letter already exists for a given application. */
export async function getOfferLetterByApplication(application_id: string, useCache = true) {
  const cacheKey = createRequestKey('offer_letter_by_application', application_id);
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => supabase
    .from('offer_letters')
    .select(OFFER_LETTER_SELECT)
    .eq('application_id', application_id)
    .maybeSingle();

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}

// ── Company: read ─────────────────────────────────────────────────────────────

/** Get all offer letters issued by the logged-in company. */
export async function getCompanyOfferLetters(company_id: string, useCache = true) {
  const cacheKey = createRequestKey('company_offer_letters', company_id);
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => supabase
    .from('offer_letters')
    .select(OFFER_LETTER_SELECT)
    .eq('company_id', company_id)
    .order('created_at', { ascending: false });

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}

// ── Company: create ───────────────────────────────────────────────────────────

/** Generate (insert) a new offer letter record. Called after accepting an application. */
export async function generateOfferLetter(data: {
  internship_id: string;
  application_id: string;
  student_id: string;
  company_id: string;
  expires_at?: string;
  notes?: string;
}) {
  const res = await supabase
    .from('offer_letters')
    .insert({
      ...data,
      status: 'Pending',
      issued_at: new Date().toISOString(),
    })
    .select(OFFER_LETTER_SELECT)
    .single();

  if (!res.error) {
    clearCache(createRequestKey('my_offer_letters', data.student_id));
    clearCache(createRequestKey('company_offer_letters', data.company_id));
    clearCache(createRequestKey('all_offer_letters'));
  }

  return res;
}

// ── Company: update ───────────────────────────────────────────────────────────

/** Attach or replace the PDF URL for an offer letter (after generation). */
export async function attachOfferLetterPdf(id: string, pdf_url: string) {
  return supabase
    .from('offer_letters')
    .update({ pdf_url, status: 'Sent', email_sent: true, email_sent_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
}

/** Mark offer as sent (email dispatched by company). */
export async function markOfferSent(id: string) {
  return supabase
    .from('offer_letters')
    .update({ status: 'Sent', email_sent: true, email_sent_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
}

/** Revoke an offer letter (company or admin). */
export async function revokeOfferLetter(id: string, reason?: string) {
  return supabase
    .from('offer_letters')
    .update({
      status: 'Revoked',
      revoked_at: new Date().toISOString(),
      revoke_reason: reason ?? null,
    })
    .eq('id', id)
    .select()
    .single();
}

// ── Student: respond ──────────────────────────────────────────────────────────

/** Student accepts an offer letter. */
export async function acceptOfferLetter(id: string) {
  const res = await supabase
    .from('offer_letters')
    .update({ status: 'Accepted', accepted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (!res.error && res.data) {
    clearCache(createRequestKey('my_offer_letters', res.data.student_id));
    clearCache(createRequestKey('offer_letter', id));
    clearCache(createRequestKey('my_active_internships', res.data.student_id));

    await supabase.from('profiles').update({ company_id: res.data.company_id }).eq('id', res.data.student_id);
  }

  return res;
}

/** Student rejects an offer letter. */
export async function rejectOfferLetter(id: string) {
  const res = await supabase
    .from('offer_letters')
    .update({ status: 'Rejected', rejected_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (!res.error && res.data) {
    clearCache(createRequestKey('my_offer_letters', res.data.student_id));
    clearCache(createRequestKey('offer_letter', id));
  }

  return res;
}

// ── Admin: read all ───────────────────────────────────────────────────────────

/** Admin: fetch every offer letter (no filter). */
export async function getAllOfferLetters(status?: OfferLetterStatus, useCache = true) {
  const cacheKey = createRequestKey('all_offer_letters', status ?? 'all');
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => {
    let query = supabase
      .from('offer_letters')
      .select(OFFER_LETTER_SELECT)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    return query;
  };

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Upload a generated PDF blob to Supabase Storage and return the public URL. */
export async function uploadOfferLetterPdf(
  offerId: string,
  studentId: string,
  pdfBlob: Blob
): Promise<string> {
  const path = `${studentId}/offer-letter-${offerId}.png`;

  const { error } = await supabase.storage
    .from('offer-letters')
    .upload(path, pdfBlob, { contentType: 'image/png', upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from('offer-letters')
    .getPublicUrl(path);

  return publicUrl;
}

/** Update offer letter status generically (admin use). */
export async function updateOfferLetterStatus(id: string, status: OfferLetterStatus) {
  return supabase
    .from('offer_letters')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
}
