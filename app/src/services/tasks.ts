import { supabase } from '@/lib/supabase';
import type { Task, TaskSubmission } from '@/lib/database.types';
import { getCachedData, setCachedData, clearCache } from '@/lib/cache';
import { dedupRequest } from '@/lib/cache/requestRegistry';

/** Get tasks assigned to current user */
export async function getMyTasks(useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const cacheKey = `my_tasks_${user.id}`;
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => supabase
    .from('tasks')
    .select(`
      *,
      internship:internships!internship_id (id, title),
      assigner:profiles!assigned_by (id, full_name, avatar_url, role),
      submissions:task_submissions (*)
    `)
    .eq('assigned_to', user.id)
    .order('created_at', { ascending: false });

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) {
    setCachedData(cacheKey, res);
  }
  return res;
}

/** Get tasks assigned by current user (mentor/company) */
export async function getTasksAssignedByMe(useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const cacheKey = `assigned_by_tasks_${user.id}`;
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => supabase
    .from('tasks')
    .select(`
      *,
      internship:internships!internship_id (id, title),
      assignee:profiles!assigned_to (id, full_name, avatar_url, email),
      submissions:task_submissions (*)
    `)
    .eq('assigned_by', user.id)
    .order('created_at', { ascending: false });

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) {
    setCachedData(cacheKey, res);
  }
  return res;
}

/** Get a single task with full details */
export async function getTaskById(id: string, useCache = true) {
  const cacheKey = `task_${id}`;
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => supabase
    .from('tasks')
    .select(`
      *,
      internship:internships!internship_id (id, title),
      assignee:profiles!assigned_to (id, full_name, avatar_url, university, email),
      assigner:profiles!assigned_by (id, full_name, avatar_url, role),
      submissions:task_submissions (*, student:profiles!student_id (*))
    `)
    .eq('id', id)
    .single();

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) {
    setCachedData(cacheKey, res);
  }
  return res;
}

/** Create a task (mentor/company) */
export async function createTask(data: Partial<Task>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const res = await supabase
    .from('tasks')
    .insert({ ...data, assigned_by: user.id })
    .select()
    .single();

  if (!res.error) {
    clearCache(`assigned_by_tasks_${user.id}`);
    if (data.assigned_to) {
      clearCache(`my_tasks_${data.assigned_to}`);
    }
  }
  return res;
}

/** Update a task */
export async function updateTask(id: string, data: Partial<Task>) {
  const res = await supabase.from('tasks').update(data).eq('id', id).select().single();
  if (!res.error) {
    clearCache(`task_${id}`);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      clearCache(`assigned_by_tasks_${user.id}`);
    }
    if (res.data?.assigned_to) {
      clearCache(`my_tasks_${res.data.assigned_to}`);
    }
  }
  return res;
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

  const res = await supabase
    .from('task_submissions')
    .insert({ ...data, student_id: user.id })
    .select()
    .single();

    if (!res.error) {
    clearCache(`my_tasks_${user.id}`);
    clearCache(`task_${data.task_id}`);
  }
  return res;
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
  const res = await supabase
    .from('task_submissions')
    .update(data)
    .eq('id', submission_id)
    .select()
    .single();

  if (!res.error) {
    const studentId = res.data?.student_id;
    const taskId = res.data?.task_id;
    if (studentId) {
      clearCache(`my_tasks_${studentId}`);
    }
    if (taskId) {
      clearCache(`task_${taskId}`);
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      clearCache(`assigned_by_tasks_${user.id}`);
    }
  }
  return res;
}
