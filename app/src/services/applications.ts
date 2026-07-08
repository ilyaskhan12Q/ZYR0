import { supabase } from '@/lib/supabase';
import type { Application } from '@/lib/database.types';
import { getCachedData, setCachedData, clearCache } from '@/lib/cache';

/** Get applications for the current student */
export async function getMyApplications(useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const cacheKey = `my_applications_${user.id}`;
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const res = await supabase
    .from('applications')
    .select(`
      *,
      internship:internships!internship_id (
        id, title, domain, location, location_type, type, stipend, stipend_type,
        company:companies!company_id (id, name, logo_url)
      )
    `)
    .order('applied_at', { ascending: false });

  if (!res.error) {
    setCachedData(cacheKey, res);
  }
  return res;
}

/** Get a single application */
export async function getApplicationById(id: string, useCache = true) {
  const cacheKey = `application_${id}`;
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const res = await supabase
    .from('applications')
    .select(`
      *,
      internship:internships!internship_id (*,
        company:companies!company_id (*)
      ),
      student:profiles!student_id (*)
    `)
    .eq('id', id)
    .single();

  if (!res.error) {
    setCachedData(cacheKey, res);
  }
  return res;
}

/** Submit a new application */
export async function applyToInternship(data: {
  internship_id: string;
  cover_letter?: string;
  resume_url?: string;
  answers?: Record<string, string>;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const res = await supabase
    .from('applications')
    .insert({ ...data, student_id: user.id })
    .select()
    .single();

  if (!res.error) {
    clearCache(`my_applications_${user.id}`);
    clearCache(`has_applied_${user.id}_${data.internship_id}`);
  }
  return res;
}

/** Withdraw an application (student) */
export async function withdrawApplication(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  const res = await supabase
    .from('applications')
    .update({ status: 'Withdrawn' })
    .eq('id', id)
    .select()
    .single();

  if (!res.error && user) {
    clearCache(`my_applications_${user.id}`);
    clearCache(`application_${id}`);
    if (res.data?.internship_id) {
      clearCache(`has_applied_${user.id}_${res.data.internship_id}`);
    }
  }
  return res;
}

/** Check if user has already applied */
export async function hasApplied(internship_id: string, useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const cacheKey = `has_applied_${user.id}_${internship_id}`;
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached !== null) return cached;
  }

  const { data } = await supabase
    .from('applications')
    .select('id, status')
    .eq('internship_id', internship_id)
    .eq('student_id', user.id)
    .single();

  setCachedData(cacheKey, data ?? null);
  return data ?? null;
}

/** Get all applications for a company's internship (company portal) */
export async function getApplicationsForInternship(internship_id: string) {
  return supabase
    .from('applications')
    .select(`
      *,
      student:profiles!student_id (id, full_name, avatar_url, university, skills, resume_url)
    `)
    .eq('internship_id', internship_id)
    .order('applied_at', { ascending: false });
}

/** Get all applications across company's internships (company dashboard) */
export async function getAllCompanyApplications(company_id: string) {
  // Step 1: get all internship IDs for this company
  const { data: internships } = await supabase
    .from('internships')
    .select('id')
    .eq('company_id', company_id);

  if (!internships?.length) return { data: [], error: null };
  const internshipIds = internships.map((i) => i.id);

  // Step 2: get applications filtered by those IDs
  return supabase
    .from('applications')
    .select(`
      *,
      internship:internships!internship_id (id, title, company_id),
      student:profiles!student_id (id, full_name, avatar_url, university)
    `)
    .in('internship_id', internshipIds)
    .order('applied_at', { ascending: false });
}

/** Update application status (company: shortlist, accept, reject) */
export async function updateApplicationStatus(
  id: string,
  status: Application['status']
) {
  const res = await supabase
    .from('applications')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (!res.error) {
    clearCache(`application_${id}`);
    const studentId = res.data?.student_id;
    const internshipId = res.data?.internship_id;
    if (studentId) {
      clearCache(`my_applications_${studentId}`);
      if (internshipId) {
        clearCache(`has_applied_${studentId}_${internshipId}`);
      }
    }
  }
  return res;
}
