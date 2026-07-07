import { supabase } from '@/lib/supabase';
import type { Task, TaskSubmission } from '@/lib/database.types';

/** Get tasks assigned to current user */
export async function getMyTasks() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  return supabase
    .from('tasks')
    .select(`
      *,
      internship:internships!internship_id (id, title),
      assigner:profiles!assigned_by (id, full_name, avatar_url, role),
      submissions:task_submissions (*)
    `)
    .eq('assigned_to', user.id)
    .order('created_at', { ascending: false });
}

/** Get tasks assigned by current user (mentor/company) */
export async function getTasksAssignedByMe() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  return supabase
    .from('tasks')
    .select(`
      *,
      internship:internships!internship_id (id, title),
      assignee:profiles!assigned_to (id, full_name, avatar_url),
      submissions:task_submissions (*)
    `)
    .eq('assigned_by', user.id)
    .order('created_at', { ascending: false });
}

/** Get a single task with full details */
export async function getTaskById(id: string) {
  return supabase
    .from('tasks')
    .select(`
      *,
      internship:internships!internship_id (id, title),
      assignee:profiles!assigned_to (id, full_name, avatar_url, university),
      assigner:profiles!assigned_by (id, full_name, avatar_url, role),
      submissions:task_submissions (*, student:profiles!student_id (*))
    `)
    .eq('id', id)
    .single();
}

/** Create a task (mentor/company) */
export async function createTask(data: Partial<Task>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  return supabase
    .from('tasks')
    .insert({ ...data, assigned_by: user.id })
    .select()
    .single();
}

/** Update a task */
export async function updateTask(id: string, data: Partial<Task>) {
  return supabase.from('tasks').update(data).eq('id', id).select().single();
}

/** Submit a task (student) */
export async function submitTask(data: {
  task_id: string;
  notes?: string;
  attachments?: TaskSubmission['attachments'];
  github_url?: string;
  live_demo_url?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  return supabase
    .from('task_submissions')
    .insert({ ...data, student_id: user.id })
    .select()
    .single();
}

/** Review a submission (mentor/company) */
export async function reviewSubmission(
  submission_id: string,
  data: {
    status: 'Approved' | 'Rejected';
    feedback?: string;
    grade?: number;
  }
) {
  return supabase
    .from('task_submissions')
    .update(data)
    .eq('id', submission_id)
    .select()
    .single();
}
