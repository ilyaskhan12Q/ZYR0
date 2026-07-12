import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/database.types';
import { getCachedData, setCachedData } from '@/lib/cache';
import { dedupRequest, createRequestKey } from '@/lib/cache/requestRegistry';

/** Get the current user's profile */
export async function getMyProfile(useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const cacheKey = createRequestKey('profile', user.id);
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => supabase.from('profiles').select('*').eq('id', user.id).single();
  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}

/** Update the current user's profile */
export async function updateMyProfile(data: Partial<Profile>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  return supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id)
    .select()
    .single();
}

/** Upload avatar to Supabase Storage */
export async function uploadAvatar(file: File) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const ext = file.name.split('.').pop();
  const path = `avatars/${user.id}.${ext}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(path);

  // Save to profile
  await updateMyProfile({ avatar_url: publicUrl });

  return publicUrl;
}

/** Upload resume to Supabase Storage */
export async function uploadResume(file: File) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const path = `resumes/${user.id}/${file.name}`;

  const { error } = await supabase.storage
    .from('resumes')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('resumes')
    .getPublicUrl(path);

  await updateMyProfile({ resume_url: publicUrl });
  return publicUrl;
}

/** Get a user's public profile */
export async function getUserProfile(userId: string, useCache = true) {
  const cacheKey = createRequestKey('public_profile', userId);
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => supabase.from('profiles').select('*').eq('id', userId).single();
  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}

/** Admin: get all users with pagination */
export async function getAllUsers(page = 0, limit = 20, role?: string) {
  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  if (role) query = query.eq('role', role);
  return query;
}

/** Admin: update user status */
export async function updateUserStatus(userId: string, status: Profile['status']) {
  return supabase.from('profiles').update({ status }).eq('id', userId);
}

/** Admin: update user role */
export async function updateUserRole(userId: string, role: Profile['role']) {
  return supabase.from('profiles').update({ role }).eq('id', userId);
}
