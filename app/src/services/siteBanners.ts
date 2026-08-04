import { supabase } from '@/lib/supabase';
import type { SiteBanner } from '@/lib/database.types';

/** Fetch the first currently-active site banner (public). */
export async function getActiveSiteBanner(): Promise<SiteBanner | null> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('site_banners')
    .select('*')
    .eq('is_active', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch site banner:', error.message);
    return null;
  }
  return data;
}

/** List all banners for the admin panel (admins only — RLS enforced). */
export async function getAllSiteBanners(): Promise<SiteBanner[]> {
  const { data, error } = await supabase
    .from('site_banners')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export interface SiteBannerInput {
  title: string;
  message: string;
  link_url: string | null;
  link_label: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

/** Create a banner (admins only — RLS enforced). */
export async function createSiteBanner(input: SiteBannerInput) {
  const { data, error } = await supabase
    .from('site_banners')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update a banner (admins only — RLS enforced). */
export async function updateSiteBanner(id: string, input: Partial<SiteBannerInput>) {
  const { data, error } = await supabase
    .from('site_banners')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Toggle a banner's active state (admins only — RLS enforced). */
export async function toggleSiteBanner(id: string, isActive: boolean) {
  return updateSiteBanner(id, { is_active: isActive });
}

/** Delete a banner (admins only — RLS enforced). */
export async function deleteSiteBanner(id: string) {
  const { error } = await supabase.from('site_banners').delete().eq('id', id);
  if (error) throw error;
}
