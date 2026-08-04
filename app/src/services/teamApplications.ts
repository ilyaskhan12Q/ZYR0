import { supabase } from '@/lib/supabase';
import type { TeamApplicationStatus } from '@/lib/database.types';

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

  return { data: null, error };
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

/** Admin: update an application's status. */
export async function updateTeamApplicationStatus(id: string, status: TeamApplicationStatus) {
  return supabase.from('team_applications').update({ status }).eq('id', id);
}

/** Admin: delete an application. */
export async function deleteTeamApplication(id: string) {
  return supabase.from('team_applications').delete().eq('id', id);
}

/** Admin: mark email_sent on an application. */
export async function markTeamApplicationEmailed(id: string) {
  return supabase
    .from('team_applications')
    .update({ email_sent: true, email_sent_at: new Date().toISOString() })
    .eq('id', id);
}