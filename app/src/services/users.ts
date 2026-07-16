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

export interface ProfileCompletion {
  completed: boolean;
  percentage: number;
  requirements: string[];
}

/** Check if profile is complete and return percentage and remaining requirements */
export function checkProfileCompletion(profile: (Profile & { company?: any }) | null): ProfileCompletion {
  if (!profile) {
    return { completed: false, percentage: 0, requirements: [] };
  }

  const { role } = profile;
  if (role === 'admin') {
    return { completed: true, percentage: 100, requirements: [] };
  }

  let score = 0;
  const requirements: string[] = [];

  if (role === 'student') {
    const hasFullName = !!profile.full_name && profile.full_name.trim().length > 0;
    const hasAvatar = !!profile.avatar_url && profile.avatar_url.trim().length > 0;
    const hasBio = !!profile.bio && profile.bio.trim().length > 0;
    const hasUniversity = !!profile.university && profile.university.trim().length > 0;
    const hasGradYear = !!profile.graduation_year && profile.graduation_year > 0;
    const hasSkills = Array.isArray(profile.skills) && profile.skills.length > 0;
    const hasResume = !!profile.resume_url && profile.resume_url.trim().length > 0;

    if (hasFullName) score += 15; else requirements.push('Basic profile (Full Name)');
    if (hasAvatar) score += 15; else requirements.push('Basic profile (Avatar)');
    if (hasBio) score += 15; else requirements.push('Basic profile (Bio)');
    if (hasUniversity) score += 15; else requirements.push('Education (University)');
    if (hasGradYear) score += 10; else requirements.push('Education (Graduation Year)');
    if (hasSkills) score += 15; else requirements.push('Skills');
    if (hasResume) score += 15; else requirements.push('Resume');

  } else if (role === 'mentor') {
    const hasFullName = !!profile.full_name && profile.full_name.trim().length > 0;
    const hasAvatar = !!profile.avatar_url && profile.avatar_url.trim().length > 0;
    const hasBio = !!profile.bio && profile.bio.trim().length > 0;
    const hasTitle = !!profile.title && profile.title.trim().length > 0;
    const hasDept = !!profile.department && profile.department.trim().length > 0;
    const hasSkills = Array.isArray(profile.skills) && profile.skills.length > 0;

    if (hasFullName) score += 20; else requirements.push('Basic profile (Full Name)');
    if (hasAvatar) score += 20; else requirements.push('Basic profile (Avatar)');
    if (hasBio) score += 20; else requirements.push('Basic profile (Bio)');
    if (hasTitle) score += 15; else requirements.push('Professional experience (Title)');
    if (hasDept) score += 15; else requirements.push('Profile information (Department)');
    if (hasSkills) score += 10; else requirements.push('Skills');

  } else if (role === 'company') {
    const company = profile.company;
    const hasFullName = !!profile.full_name && profile.full_name.trim().length > 0;
    const hasAvatar = !!profile.avatar_url && profile.avatar_url.trim().length > 0;
    const hasCoName = !!company?.name && company.name.trim().length > 0;
    const hasCoLogo = !!company?.logo_url && company.logo_url.trim().length > 0;
    const hasCoDesc = !!company?.description && company.description.trim().length > 0;
    const hasCoIndustry = !!company?.industry && company.industry.trim().length > 0;

    if (hasFullName) score += 20; else requirements.push('Basic profile (Full Name)');
    if (hasAvatar) score += 20; else requirements.push('Basic profile (Avatar)');
    if (hasCoName) score += 15; else requirements.push('Company details (Name)');
    if (hasCoLogo) score += 15; else requirements.push('Company details (Logo)');
    if (hasCoDesc) score += 15; else requirements.push('Organization information (Description)');
    if (hasCoIndustry) score += 15; else requirements.push('Organization information (Industry)');
  } else {
    return { completed: true, percentage: 100, requirements: [] };
  }

  return {
    completed: score === 100,
    percentage: score,
    requirements
  };
}
