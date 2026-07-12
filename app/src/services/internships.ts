import { supabase } from '@/lib/supabase';
import type { Internship } from '@/lib/database.types';
import { getCachedData, setCachedData } from '@/lib/cache';
import { dedupRequest, createRequestKey } from '@/lib/cache/requestRegistry';

export interface InternshipFilters {
  domain?: string;
  location_type?: string;
  type?: string;
  experience_level?: string;
  search?: string;
  status?: string;
  company_id?: string;
  limit?: number;
  offset?: number;
}

/** Fetch active internships with optional filters (public) */
export async function getInternships(filters: InternshipFilters = {}, useCache = true) {
  const filterKey = JSON.stringify(filters);
  const cacheKey = createRequestKey('internships', filterKey);
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => {
    let query = supabase
      .from('internships')
      .select(`
        *,
        company:companies!company_id (id, name, logo_url, location, rating)
      `)
      .order('posted_date', { ascending: false });

    const status = filters.status ?? 'Active';
    if (status !== 'all') query = query.eq('status', status);

    if (filters.domain) query = query.eq('domain', filters.domain);
    if (filters.location_type) query = query.eq('location_type', filters.location_type);
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.experience_level) query = query.eq('experience_level', filters.experience_level);
    if (filters.company_id) query = query.eq('company_id', filters.company_id);
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    return query;
  };

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}

/** Fetch a single internship by ID (increments view count) */
export async function getInternshipById(id: string, useCache = true) {
  const cacheKey = createRequestKey('internship', id);
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => {
    supabase.rpc('increment_internship_view', { internship_id: id }).then(() => {});
    return supabase
      .from('internships')
      .select(`
        *,
        company:companies!company_id (
          id, name, logo_url, cover_gradient, industry, size,
          website, description, location, founded, email, phone,
          social_links, status, rating, review_count
        )
      `)
      .eq('id', id)
      .single();
  };

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}

/** Create an internship (company portal) */
export async function createInternship(data: Partial<Internship>) {
  return supabase.from('internships').insert(data).select().single();
}

/** Update an internship (company portal) */
export async function updateInternship(id: string, data: Partial<Internship>) {
  return supabase.from('internships').update(data).eq('id', id).select().single();
}

/** Delete / close an internship */
export async function closeInternship(id: string) {
  return supabase.from('internships').update({ status: 'Closed' }).eq('id', id);
}

/** Get unique domains for filter UI */
export async function getInternshipDomains(useCache = true) {
  const cacheKey = 'internship_domains';
  if (useCache) {
    const cached = getCachedData<string[]>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = async () => {
    const { data } = await supabase
      .from('internships')
      .select('domain')
      .eq('status', 'Active')
      .not('domain', 'is', null);
    return [...new Set(data?.map((r: { domain: string }) => r.domain).filter(Boolean))];
  };

  const result = await dedupRequest(cacheKey, fetchFn);
  setCachedData(cacheKey, result);
  return result;
}

/** Get active internships for the current logged-in student (where offer letter is Accepted) */
export async function getMyActiveInternships(useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: new Error('Not authenticated') };

  const cacheKey = createRequestKey('my_active_internships', user.id);
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => supabase
    .from('offer_letters')
    .select(`
      id,
      status,
      accepted_at,
      internship:internships!internship_id (
        *,
        company:companies!company_id (id, name, logo_url, rating)
      )
    `)
    .eq('student_id', user.id)
    .eq('status', 'Accepted');

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}
