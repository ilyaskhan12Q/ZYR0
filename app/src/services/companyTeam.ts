import { supabase } from '@/lib/supabase';
import type { CompanyTeamMember } from '@/lib/database.types';
import { getCachedData, setCachedData, clearCache } from '@/lib/cache';
import { dedupRequest } from '@/lib/cache/requestRegistry';

export async function getCompanyTeam(companyId: string) {
  const cacheKey = `company_team_${companyId}`;
  const cached = getCachedData<any>(cacheKey);
  if (cached) return cached;

  const fetchFn = () => supabase
    .from('company_team_members')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: true });

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}

export async function addTeamMember(data: {
  company_id: string;
  user_id?: string;
  name: string;
  role: string;
  email?: string;
}) {
  const res = await supabase
    .from('company_team_members')
    .insert(data)
    .select()
    .single();

  if (!res.error) {
    clearCache(`company_team_${data.company_id}`);
  }
  return res;
}

export async function updateTeamMember(id: string, data: { role?: string; name?: string }) {
  const res = await supabase
    .from('company_team_members')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (!res.error && res.data) {
    clearCache(`company_team_${res.data.company_id}`);
  }
  return res;
}

export async function removeTeamMember(id: string) {
  const { data: member } = await supabase
    .from('company_team_members')
    .select('company_id')
    .eq('id', id)
    .single();

  const res = await supabase.from('company_team_members').delete().eq('id', id);

  if (member?.company_id) {
    clearCache(`company_team_${member.company_id}`);
  }
  return res;
}
