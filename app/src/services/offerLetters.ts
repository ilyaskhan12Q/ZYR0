import { supabase } from '@/lib/supabase';
import type { OfferLetterStatus } from '@/lib/database.types';

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
export async function getMyOfferLetters() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };

  return supabase
    .from('offer_letters')
    .select(OFFER_LETTER_SELECT)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false });
}

/** Get a single offer letter by id (student, company, or admin). */
export async function getOfferLetterById(id: string) {
  return supabase
    .from('offer_letters')
    .select(OFFER_LETTER_SELECT)
    .eq('id', id)
    .single();
}

/** Check whether an offer letter already exists for a given application. */
export async function getOfferLetterByApplication(application_id: string) {
  return supabase
    .from('offer_letters')
    .select(OFFER_LETTER_SELECT)
    .eq('application_id', application_id)
    .maybeSingle();
}

// ── Company: read ─────────────────────────────────────────────────────────────

/** Get all offer letters issued by the logged-in company. */
export async function getCompanyOfferLetters(company_id: string) {
  return supabase
    .from('offer_letters')
    .select(OFFER_LETTER_SELECT)
    .eq('company_id', company_id)
    .order('created_at', { ascending: false });
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
  return supabase
    .from('offer_letters')
    .insert({
      ...data,
      status: 'Pending',
      issued_at: new Date().toISOString(),
    })
    .select(OFFER_LETTER_SELECT)
    .single();
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
  return supabase
    .from('offer_letters')
    .update({ status: 'Accepted', accepted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
}

/** Student rejects an offer letter. */
export async function rejectOfferLetter(id: string) {
  return supabase
    .from('offer_letters')
    .update({ status: 'Rejected', rejected_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
}

// ── Admin: read all ───────────────────────────────────────────────────────────

/** Admin: fetch every offer letter (no filter). */
export async function getAllOfferLetters(status?: OfferLetterStatus) {
  let query = supabase
    .from('offer_letters')
    .select(OFFER_LETTER_SELECT)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  return query;
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
