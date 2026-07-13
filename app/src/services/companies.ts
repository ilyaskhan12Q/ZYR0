import { supabase } from '@/lib/supabase';
import type { Company } from '@/lib/database.types';
import { getCachedData, setCachedData, clearCache } from '@/lib/cache';
import { dedupRequest, createRequestKey } from '@/lib/cache/requestRegistry';
import { createNotification } from './notifications';

/** Get all active companies (public) */
export async function getCompanies(opts: {
  search?: string;
  industry?: string;
  limit?: number;
  offset?: number;
} = {}, useCache = true) {
  const filterKey = JSON.stringify(opts);
  const cacheKey = createRequestKey('companies', filterKey);
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => {
    let query = supabase
      .from('companies')
      .select('*, team:company_team_members(*)', { count: 'exact' })
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (opts.search) {
      query = query.or(`name.ilike.%${opts.search}%,description.ilike.%${opts.search}%`);
    }
    if (opts.industry) query = query.eq('industry', opts.industry);

    const limit = opts.limit ?? 20;
    const offset = opts.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    return query;
  };

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}

/** Get company by ID */
export async function getCompanyById(id: string, useCache = true) {
  const cacheKey = createRequestKey('company', id);
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => supabase
    .from('companies')
    .select(`
      *,
      team:company_team_members (*)
    `)
    .eq('id', id)
    .single();

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}

/** Get company owned by current user */
export async function getMyCompany(useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const cacheKey = createRequestKey('my_company', user.id);
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => supabase
    .from('companies')
    .select(`*, team:company_team_members(*)`)
    .eq('owner_id', user.id)
    .single();

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}

/** Create a company */
export async function createCompany(data: Partial<Company>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  return supabase
    .from('companies')
    .insert({ ...data, owner_id: user.id, status: 'pending' })
    .select()
    .single();
}

/** Update company */
export async function updateCompany(id: string, data: Partial<Company>) {
  return supabase.from('companies').update(data).eq('id', id).select().single();
}

/** Upload company logo */
export async function uploadCompanyLogo(companyId: string, file: File) {
  const ext = file.name.split('.').pop();
  const path = `company-logos/${companyId}.${ext}`;

  const { error } = await supabase.storage
    .from('company-assets')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('company-assets')
    .getPublicUrl(path);

  await updateCompany(companyId, { logo_url: publicUrl });
  return publicUrl;
}

/** Admin: approve/suspend/reject/pending company */
export async function updateCompanyStatus(
  id: string,
  status: Company['status'],
  verificationNotes?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  const updateData = {
    status,
    verified_at: new Date().toISOString(),
    verified_by: user?.id || null,
    verification_notes: verificationNotes || null,
  };
  
  const res = await supabase
    .from('companies')
    .update(updateData)
    .eq('id', id)
    .select('owner_id, name')
    .single();
  
  if (!res.error && res.data) {
    const ownerId = res.data.owner_id;
    const companyName = res.data.name;
    
    // Clear cache so the owner gets updated status immediately
    if (ownerId) {
      clearCache(createRequestKey('my_company', ownerId));
      
      let message = `Your company "${companyName}" registration has been updated to ${status}.`;
      if (verificationNotes) {
        message += ` Notes: ${verificationNotes}`;
      }
      
      await createNotification({
        user_id: ownerId,
        type: 'company_status',
        title: `Verification Update: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message,
        action_url: '/company/dashboard',
      });
    }
  }
  
  return res;
}

/** Admin: get all companies */
export async function getAllCompanies(opts: { status?: string } = {}, useCache = true) {
  const cacheKey = createRequestKey('all_companies', opts.status ?? 'all');
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => {
    let query = supabase
      .from('companies')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (opts.status) query = query.eq('status', opts.status);
    return query;
  };

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}
