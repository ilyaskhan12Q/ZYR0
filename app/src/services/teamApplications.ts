import { supabase } from '@/lib/supabase';
import type { TeamApplicationStatus } from '@/lib/database.types';
import { getCachedData, setCachedData, clearCache } from '@/lib/cache';
import { dedupRequest } from '@/lib/cache/requestRegistry';
import { createNotification } from '@/services/notifications';

const TEAM_ROLE_TITLES: Record<string, string> = {
  'product-designer': 'Product Designer (UI/UX)',
  'frontend-engineer': 'Frontend Software Engineer',
  'backend-engineer': 'Backend Software Engineer',
  'ai-systems-engineer': 'AI Systems Engineer',
  'devops-engineer': 'DevOps & Cloud Engineer',
  'database-engineer': 'Database Systems Engineer',
  'security-engineer': 'Security Engineer',
  'qa-engineer': 'QA & Reliability Engineer',
  'technical-writer': 'Technical Writer & Documentation Engineer',
  'devrel-coordinator': 'Developer Relations Coordinator',
  'seo-specialist': 'Technical SEO Specialist',
};

export const TEAM_APPLICATION_STATUSES: TeamApplicationStatus[] = [
  'New',
  'Under Review',
  'Shortlisted',
  'Contacted',
  'Rejected',
];

export interface TeamApplicationPayload {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  university: string;
  degreeProgram: string;
  academicYear: string;
  github: string;
  linkedin: string;
  portfolio: string;
  resume: File | null;
  preferredRole: string;
  secondaryRole: string;
  skills: string[];
  projects: string;
  availability: string;
  motivation: string;
}

/** Submit a founding-team application (requires a signed-in user). */
export async function submitTeamApplication(payload: TeamApplicationPayload) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: new Error('You must be signed in to apply for a team role.') };
  }

  let resumeUrl: string | null = null;
  let resumeFilename: string | null = null;
  let resumeSize: number | null = null;

  if (payload.resume) {
    const safeName = payload.resume.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `team-resumes/${Date.now()}-${Math.random().toString(36).slice(2, 8)}/${safeName}`;
    const { error: uploadErr } = await supabase.storage
      .from('team-resumes')
      .upload(path, payload.resume, { upsert: false, contentType: payload.resume.type });

    if (uploadErr) {
      return { data: null, error: new Error(uploadErr.message) };
    }
    const { data } = supabase.storage.from('team-resumes').getPublicUrl(path);
    resumeUrl = data.publicUrl;
    resumeFilename = payload.resume.name;
    resumeSize = payload.resume.size;
  }

  const { error } = await supabase.from('team_applications').insert({
    user_id: user.id,
    full_name: payload.fullName.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    gender: payload.gender.trim(),
    university: payload.university.trim(),
    degree_program: payload.degreeProgram.trim(),
    academic_year: payload.academicYear.trim(),
    github: payload.github.trim(),
    linkedin: payload.linkedin.trim() || null,
    portfolio: payload.portfolio.trim() || null,
    resume_url: resumeUrl,
    resume_filename: resumeFilename,
    resume_size: resumeSize,
    preferred_role: payload.preferredRole.trim(),
    secondary_role: payload.secondaryRole.trim() || null,
    skills: payload.skills,
    projects: payload.projects.trim() || null,
    availability: payload.availability.trim(),
    motivation: payload.motivation.trim(),
  });

  if (!error) {
    clearCache(`my_team_applications_${user.id}`);
  }

  return { data: null, error };
}

/** Student: fetch the current user's founding-team applications. */
export async function getMyTeamApplications(useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: new Error('Not authenticated') };

  const cacheKey = `my_team_applications_${user.id}`;
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => supabase
    .from('team_applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}/** Admin: fetch all team applications, optionally filtered by status. */
export async function getTeamApplications(status?: TeamApplicationStatus | 'All') {
  let query = supabase
    .from('team_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'All') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  return { data: (data ?? []) as any[], error };
}

/** Admin: update an application's status (also notifies the applicant). */
export async function updateTeamApplicationStatus(id: string, status: TeamApplicationStatus) {
  const { data, error } = await supabase
    .from('team_applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, user_id, preferred_role')
    .single();

  if (!error && data?.user_id) {
    clearCache(`my_team_applications_${data.user_id}`);
    const roleTitle = TEAM_ROLE_TITLES[data.preferred_role] || data.preferred_role;
    try {
      await createNotification({
        user_id: data.user_id,
        type: 'application',
        title: `Founding team application ${status.toLowerCase()}`,
        message: `Your application${roleTitle ? ` for ${roleTitle}` : ''} is now "${status}".`,
        action_url: '/student/team-applications',
      });
    } catch {
      // Notification is best-effort; never fail a status change because of it.
    }
  }

  return { data, error };
}

/** Admin: delete an application. */
export async function deleteTeamApplication(id: string) {
  return supabase.from('team_applications').delete().eq('id', id);
}

/** Admin: mark email_sent on an application. */
export async function markTeamApplicationEmailed(id: string, messageId?: string | null) {
  const updates: Record<string, unknown> = { email_sent: true, email_sent_at: new Date().toISOString() };
  if (messageId) updates.email_message_id = messageId;
  return supabase
    .from('team_applications')
    .update(updates)
    .eq('id', id);
}