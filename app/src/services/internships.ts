import { supabase } from '@/lib/supabase';
import type { Internship } from '@/lib/database.types';

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
export async function getInternships(filters: InternshipFilters = {}) {
  let query = supabase
    .from('internships')
    .select(`
      *,
      company:companies!company_id (id, name, logo_url, location, rating)
    `)
    .order('posted_date', { ascending: false });

  // Default to Active unless explicitly overriding
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
}

/** Fetch a single internship by ID (increments view count) */
export async function getInternshipById(id: string) {
  // Increment view count (non-blocking)
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
export async function getInternshipDomains() {
  const { data } = await supabase
    .from('internships')
    .select('domain')
    .eq('status', 'Active')
    .not('domain', 'is', null);
  return [...new Set(data?.map((r) => r.domain).filter(Boolean))];
}
