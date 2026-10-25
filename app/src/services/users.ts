import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/database.types';
import { getCachedData, setCachedData } from '@/lib/cache';
import { dedupRequest, createRequestKey } from '@/lib/cache/requestRegistry';
import { signedFileUrl } from '@/lib/storage';

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

  if (res.data?.resume_url) {
    res.data.resume_url = await signedFileUrl('resumes', res.data.resume_url);
  }

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

  // Store the object name, not a link: the bucket is private now, so links are
  // minted on demand and expire.
  await updateMyProfile({ resume_url: path });
  return (await signedFileUrl('resumes', path)) ?? path;
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

  if (res.data?.resume_url) {
    res.data.resume_url = await signedFileUrl('resumes', res.data.resume_url);
  }

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

/** Admin: record an administrative audit log entry */
export async function recordAdminAuditLog({
  actorId,
  targetUserId,
  action,
  reason,
  metadata = {},
}: {
  actorId?: string | null;
  targetUserId?: string | null;
  action: string;
  reason?: string | null;
  metadata?: Record<string, any>;
}) {
  try {
    return await supabase.from('activity_logs').insert({
      actor_id: actorId || null,
      user_id: targetUserId || null,
      action,
      target: targetUserId || null,
      target_type: 'user',
      reason: reason || null,
      details: reason ? `${action}: ${reason}` : action,
      metadata,
    });
  } catch (err) {
    console.warn('Failed to record admin audit log:', err);
    return null;
  }
}

/** Admin: update user status with optional reason and audit logging */
export async function updateUserStatus(
  userId: string,
  status: Profile['status'],
  options?: { reason?: string; actorId?: string }
) {
  // If attempting to suspend/deactivate an admin, verify there is at least one other active admin
  if (status === 'inactive' || status === 'suspended') {
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', userId)
      .single();

    if (targetProfile?.role === 'admin' && targetProfile?.status === 'active') {
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')
        .eq('status', 'active')
        .neq('id', userId);

      if ((count ?? 0) < 1) {
        throw new Error('Cannot deactivate or suspend the last remaining active platform administrator.');
      }
    }
  }

  const updatePayload: Partial<Profile> = {
    status,
    status_reason: options?.reason || null,
  };

  if (status === 'suspended') {
    updatePayload.suspended_at = new Date().toISOString();
    updatePayload.suspended_by = options?.actorId || null;
  } else if (status === 'active') {
    updatePayload.suspended_at = null;
    updatePayload.suspended_by = null;
  }

  const result = await supabase.from('profiles').update(updatePayload).eq('id', userId);
  if (result.error) throw result.error;

  await recordAdminAuditLog({
    actorId: options?.actorId,
    targetUserId: userId,
    action: status === 'suspended' ? 'user_suspended' : status === 'active' ? 'user_activated' : 'user_status_changed',
    reason: options?.reason,
    metadata: { new_status: status },
  });

  return result;
}

/** Admin: update user role with last-admin guard and audit logging */
export async function updateUserRole(
  userId: string,
  role: Profile['role'],
  options?: { reason?: string; actorId?: string }
) {
  // Check last-admin safeguard if demoting an admin
  if (role !== 'admin') {
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', userId)
      .single();

    if (targetProfile?.role === 'admin') {
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')
        .eq('status', 'active')
        .neq('id', userId);

      if ((count ?? 0) < 1) {
        throw new Error('Cannot demote the last remaining active platform administrator.');
      }
    }
  }

  const result = await supabase.from('profiles').update({ role }).eq('id', userId);
  if (result.error) throw result.error;

  await recordAdminAuditLog({
    actorId: options?.actorId,
    targetUserId: userId,
    action: 'user_role_changed',
    reason: options?.reason,
    metadata: { new_role: role },
  });

  return result;
}

/** Admin: update user plan tier with audit logging */
export async function updateUserPlanTier(
  userId: string,
  planTier: NonNullable<Profile['plan_tier']>,
  options?: { reason?: string; actorId?: string; expiresAt?: string | null }
) {
  const updatePayload: Partial<Profile> = {
    plan_tier: planTier,
    plan_granted_by: options?.actorId || null,
    plan_granted_at: new Date().toISOString(),
    plan_expires_at: options?.expiresAt || null,
  };

  const result = await supabase.from('profiles').update(updatePayload).eq('id', userId);
  if (result.error) throw result.error;

  await recordAdminAuditLog({
    actorId: options?.actorId,
    targetUserId: userId,
    action: 'plan_tier_changed',
    reason: options?.reason,
    metadata: {
      new_plan_tier: planTier,
      expires_at: options?.expiresAt || null,
    },
  });

  return result;
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
    const isOwner = !company?.owner_id || company.owner_id === profile.id;
    const hasFullName = !!profile.full_name && profile.full_name.trim().length > 0;
    const hasAvatar = !!profile.avatar_url && profile.avatar_url.trim().length > 0;

    if (hasFullName) score += 20; else requirements.push('Basic profile (Full Name)');
    if (hasAvatar) score += 20; else requirements.push('Basic profile (Avatar)');

    if (isOwner) {
      const hasCoName = !!company?.name && company.name.trim().length > 0;
      const hasCoLogo = !!company?.logo_url && company.logo_url.trim().length > 0;
      const hasCoDesc = !!company?.description && company.description.trim().length > 0;
      const hasCoIndustry = !!company?.industry && company.industry.trim().length > 0;

      if (hasCoName) score += 15; else requirements.push('Company details (Name)');
      if (hasCoLogo) score += 15; else requirements.push('Company details (Logo)');
      if (hasCoDesc) score += 15; else requirements.push('Organization information (Description)');
      if (hasCoIndustry) score += 15; else requirements.push('Organization information (Industry)');
    } else {
      score += 60;
    }
  } else {
    return { completed: true, percentage: 100, requirements: [] };
  }

  return {
    completed: score === 100,
    percentage: score,
    requirements
  };
}
