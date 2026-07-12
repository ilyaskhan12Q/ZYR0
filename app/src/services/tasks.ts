import { supabase } from '@/lib/supabase';
import type { Task, TaskSubmission } from '@/lib/database.types';
import { getCachedData, setCachedData, clearCache } from '@/lib/cache';
import { dedupRequest } from '@/lib/cache/requestRegistry';
import { createWorkspaceEvent } from '@/services/workspaceEvents';

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
    if (data.assigned_to && data.internship_id) {
      await createWorkspaceEvent({
        internship_id: data.internship_id,
        student_id: data.assigned_to,
        actor_id: user.id,
        event_type: 'task_assigned',
        title: `New Task: ${data.title || 'Untitled'}`,
        description: data.description ?? undefined,
        metadata: { task_id: res.data?.id },
      }).catch(() => {});
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
    const { data: task } = await supabase
      .from('tasks')
      .select('internship_id, title')
      .eq('id', data.task_id)
      .single();
    if (task?.internship_id) {
      await createWorkspaceEvent({
        internship_id: task.internship_id,
        student_id: user.id,
        actor_id: user.id,
        event_type: 'task_submitted',
        title: `Task Submitted: ${task.title || 'Untitled'}`,
        metadata: { task_id: data.task_id, submission_id: res.data?.id },
      }).catch(() => {});
    }
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
    if (taskId && studentId) {
      const { data: task } = await supabase
        .from('tasks')
        .select('internship_id, title')
        .eq('id', taskId)
        .single();
      if (task?.internship_id) {
        const eventType = data.status === 'Approved' ? 'task_approved' : 'task_rejected';
        await createWorkspaceEvent({
          internship_id: task.internship_id,
          student_id: studentId,
          event_type: eventType,
          title: data.status === 'Approved' ? 'Task Approved' : 'Task Rejected',
          description: data.feedback ?? undefined,
          metadata: { task_id: taskId, submission_id, grade: data.grade, feedback: data.feedback },
        }).catch(() => {});
      }
    }
  }
  return res;
}
