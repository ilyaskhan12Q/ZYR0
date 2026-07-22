import { supabase } from '@/lib/supabase';
import type { Internship } from '@/lib/database.types';
import { getCachedData, setCachedData, clearCache } from '@/lib/cache';
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

/** Get count of accepted interns (accepted offer letters) for an internship */
export async function getAcceptedCountForInternship(internshipId: string): Promise<number> {
  const { count, error } = await supabase
    .from('offer_letters')
    .select('id', { count: 'exact', head: true })
    .eq('internship_id', internshipId)
    .eq('status', 'Accepted');

  if (error) {
    console.error('Error fetching accepted intern count:', error);
    return 0;
  }
  return count || 0;
}

/** Create an internship (company portal) */
export async function createInternship(data: Partial<Internship>) {
  const res = await supabase.from('internships').insert(data).select().single();
  if (!res.error && data.company_id) {
    clearCache(createRequestKey('company_internships', data.company_id));
    clearCache('internship_domains');
  }
  return res;
}

/** Update an internship (company portal) with business validation and cache clearing */
export async function updateInternship(id: string, data: Partial<Internship>, companyId?: string) {
  // If openings is being updated, validate against accepted count
  if (data.openings !== undefined && data.openings !== null) {
    const acceptedCount = await getAcceptedCountForInternship(id);
    if (data.openings < acceptedCount) {
      throw new Error(`Cannot reduce openings to ${data.openings}. ${acceptedCount} intern(s) have already accepted offers for this position.`);
    }
  }

  // Prevent mutating immutable system fields
  const safeData: Partial<Internship> = { ...data };
  delete safeData.id;
  delete safeData.company_id;
  delete safeData.created_by;
  delete safeData.posted_date;
  delete safeData.created_at;
  delete safeData.applicant_count;
  delete safeData.view_count;
  safeData.updated_at = new Date().toISOString();

  const res = await supabase
    .from('internships')
    .update(safeData)
    .eq('id', id)
    .select()
    .single();

  if (!res.error && res.data) {
    clearCache(createRequestKey('internship', id));
    const targetCompanyId = companyId || res.data.company_id;
    if (targetCompanyId) {
      clearCache(createRequestKey('company_internships', targetCompanyId));
    }
    clearCache('internship_domains');
  }

  return res;
}

/** Delete / close an internship */
export async function closeInternship(id: string, companyId?: string) {
  const res = await supabase.from('internships').update({ status: 'Closed', updated_at: new Date().toISOString() }).eq('id', id);
  if (!res.error) {
    clearCache(createRequestKey('internship', id));
    if (companyId) {
      clearCache(createRequestKey('company_internships', companyId));
    }
    clearCache('internship_domains');
  }
  return res;
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
        company:companies!company_id (id, name, logo_url, rating, owner_id)
      )
    `)
    .eq('student_id', user.id)
    .eq('status', 'Accepted');

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}

/** Save an internship for the current user */
export async function saveInternship(internshipId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const res = await supabase
    .from('saved_internships')
    .insert({
      user_id: user.id,
      internship_id: internshipId
    })
    .select()
    .single();

  if (!res.error) {
    clearCache(createRequestKey('saved_internships', user.id));
    clearCache(createRequestKey('is_saved', `${user.id}::${internshipId}`));
  }
  return res;
}

/** Unsave/remove a saved internship for the current user */
export async function unsaveInternship(internshipId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const res = await supabase
    .from('saved_internships')
    .delete()
    .eq('user_id', user.id)
    .eq('internship_id', internshipId);

  if (!res.error) {
    clearCache(createRequestKey('saved_internships', user.id));
    clearCache(createRequestKey('is_saved', `${user.id}::${internshipId}`));
  }
  return res;
}

/** Check if an internship is saved by the current user */
export async function isInternshipSaved(internshipId: string, useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const cacheKey = createRequestKey('is_saved', `${user.id}::${internshipId}`);
  if (useCache) {
    const cached = getCachedData<boolean>(cacheKey);
    if (cached !== null) return cached;
  }

  const fetchFn = async () => {
    const { data, error } = await supabase
      .from('saved_internships')
      .select('id')
      .eq('user_id', user.id)
      .eq('internship_id', internshipId)
      .maybeSingle();

    if (error) return false;
    return !!data;
  };

  const isSaved = await dedupRequest(cacheKey, fetchFn);
  setCachedData(cacheKey, isSaved);
  return isSaved;
}

/** Get all saved internships for the current user */
export async function getSavedInternships(useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: new Error('Not authenticated') };

  const cacheKey = createRequestKey('saved_internships', user.id);
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => supabase
    .from('saved_internships')
    .select(`
      id,
      created_at,
      internship:internships!internship_id (
        *,
        company:companies!company_id (id, name, logo_url, location, rating)
      )
    `)
    .eq('user_id', user.id);

  const res = await dedupRequest(cacheKey, fetchFn);
  if (!res.error) setCachedData(cacheKey, res);
  return res;
}

