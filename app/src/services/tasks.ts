import { supabase } from '@/lib/supabase';
import type { Task, TaskSubmission, TaskAttachment } from '@/lib/database.types';
import { getCachedData, setCachedData, clearCache } from '@/lib/cache';
import { dedupRequest } from '@/lib/cache/requestRegistry';

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/** Upload a task brief document (PDF/image) to Supabase Storage */
export async function uploadTaskDocument(file: File): Promise<TaskAttachment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const safeName = sanitizeFilename(file.name);
  const path = `task-documents/${user.id}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from('task-documents')
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('task-documents')
    .getPublicUrl(path);

  return {
    id: crypto.randomUUID(),
    name: file.name,
    url: publicUrl,
    type: file.type,
    size: String(file.size),
  };
}

/** Upload a student submission file to Supabase Storage */
export async function uploadSubmissionFile(file: File): Promise<TaskAttachment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const safeName = sanitizeFilename(file.name);
  const path = `task-documents/${user.id}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from('task-documents')
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('task-documents')
    .getPublicUrl(path);

  return {
    id: crypto.randomUUID(),
    name: file.name,
    url: publicUrl,
    type: file.type,
    size: String(file.size),
  };
}

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

/** Count tasks assigned to the current student that still need a submission. */
export async function getMyPendingTasksCount(useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const cacheKey = `my_pending_tasks_count_${user.id}`;
  if (useCache) {
    const cached = getCachedData<number>(cacheKey);
    if (cached !== null) return cached;
  }

  const fetchFn = () =>
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', user.id)
      .eq('status', 'Pending');

  const { count } = await dedupRequest(cacheKey, fetchFn);
  const result = count ?? 0;
  setCachedData(cacheKey, result);
  return result;
}

/** Count tasks assigned by the current user that await review (mentor). */
export async function getTasksToReviewCount(useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const cacheKey = `tasks_to_review_count_${user.id}`;
  if (useCache) {
    const cached = getCachedData<number>(cacheKey);
    if (cached !== null) return cached;
  }

  const fetchFn = () =>
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_by', user.id)
      .in('status', ['Submitted', 'Under Review']);

  const { count } = await dedupRequest(cacheKey, fetchFn);
  const result = count ?? 0;
  setCachedData(cacheKey, result);
  return result;
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

/** Get tasks for the user's company (all tasks across all team members) */
export async function getCompanyTasks(companyId: string, useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const cacheKey = `company_tasks_${companyId}`;
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const { data: internships, error: intErr } = await supabase
    .from('internships')
    .select('id')
    .eq('company_id', companyId);

  if (intErr || !internships?.length) {
    return { data: [], error: intErr };
  }

  const internshipIds = internships.map((i) => i.id);

  const fetchFn = () => supabase
    .from('tasks')
    .select(`
      *,
      internship:internships!internship_id (id, title),
      assignee:profiles!assigned_to (id, full_name, avatar_url, email),
      submissions:task_submissions (*)
    `)
    .in('internship_id', internshipIds)
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

  // Enforce server-side invariant: assignee must have an accepted application for the project
  if (data.internship_id && data.assigned_to) {
    const { data: enrollment, error: enrollError } = await supabase
      .from('applications')
      .select('id')
      .eq('internship_id', data.internship_id)
      .eq('student_id', data.assigned_to)
      .eq('status', 'Accepted')
      .maybeSingle();

    if (enrollError || !enrollment) {
      return {
        data: null,
        error: new Error('Assigned intern must be an accepted participant in the selected internship project'),
      };
    }
  }

  const res = await supabase
    .from('tasks')
    .insert({ ...data, assigned_by: user.id })
    .select()
    .single();

  if (!res.error) {
    clearCache('company_tasks');
    clearCache(`assigned_by_tasks_${user.id}`);
    if (data.assigned_to) {
      clearCache(`my_tasks_${data.assigned_to}`);
    }
  }
  return res;
}

/** Update a task */
export async function updateTask(id: string, data: Partial<Task>) {
  // If reassigning project or intern, enforce enrollment invariant
  if (data.internship_id && data.assigned_to) {
    const { data: enrollment, error: enrollError } = await supabase
      .from('applications')
      .select('id')
      .eq('internship_id', data.internship_id)
      .eq('student_id', data.assigned_to)
      .eq('status', 'Accepted')
      .maybeSingle();

    if (enrollError || !enrollment) {
      return {
        data: null,
        error: new Error('Assigned intern must be an accepted participant in the selected internship project'),
      };
    }
  }

  const res = await supabase.from('tasks').update(data).eq('id', id).select().single();
  if (!res.error) {
    clearCache('company_tasks');
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

/** Bulk-create tasks for multiple interns (company).
 *  Inserts one independent task row per intern in a single request.
 *  Returns the list of created tasks and a count, or an error.
 *  Duplicates (same title + internship + assignee) are silently skipped. */
export async function bulkCreateTasks(
  baseData: Omit<Partial<Task>, 'assigned_to' | 'assigned_by'>,
  internIds: string[],
  existingTasks: any[] = [],
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  if (!internIds.length) return { data: [], created: 0, skipped: 0, error: null };

  // Enforce server-side invariant: interns must be accepted in the selected internship
  let targetInternIds = internIds;
  if (baseData.internship_id) {
    const { data: acceptedApps } = await supabase
      .from('applications')
      .select('student_id')
      .eq('internship_id', baseData.internship_id)
      .eq('status', 'Accepted')
      .in('student_id', internIds);

    const validIds = new Set(acceptedApps?.map((a: any) => a.student_id) || []);
    targetInternIds = internIds.filter(id => validIds.has(id));
    if (!targetInternIds.length) {
      return {
        data: [],
        created: 0,
        skipped: internIds.length,
        error: new Error('No accepted interns found for this internship project'),
      };
    }
  }

  // Deduplicate against existing tasks with the same title + internship + assignee
  const existingSet = new Set(
    existingTasks
      .filter(t => t.title === baseData.title && t.internship_id === baseData.internship_id)
      .map(t => t.assigned_to),
  );

  const newInternIds = targetInternIds.filter(id => !existingSet.has(id));
  const skipped = internIds.length - newInternIds.length;

  if (!newInternIds.length) {
    return { data: [], created: 0, skipped, error: null };
  }

  const rows = newInternIds.map(internId => ({
    ...baseData,
    assigned_to: internId,
    assigned_by: user.id,
  }));

  const res = await supabase.from('tasks').insert(rows).select();

  if (!res.error) {
    // Clear caches for company, assigner and every affected intern
    clearCache('company_tasks');
    clearCache(`assigned_by_tasks_${user.id}`);
    newInternIds.forEach(id => clearCache(`my_tasks_${id}`));
  }

  return {
    data: res.data,
    created: res.data?.length ?? 0,
    skipped,
    error: res.error,
  };
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
    clearCache('company_tasks');
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

/** Bulk-extend deadlines for multiple tasks (mentor/company) */
export async function bulkExtendTaskDeadlines(
  taskIds: string[],
  newDueDate: string,
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  if (!taskIds.length) return { data: [], count: 0, error: null };

  const res = await supabase
    .from('tasks')
    .update({
      due_date: newDueDate,
      updated_at: new Date().toISOString(),
    })
    .in('id', taskIds)
    .select('id, title, assigned_to, internship_id, status');

  if (!res.error && res.data) {
    clearCache('company_tasks');
    clearCache(`assigned_by_tasks_${user.id}`);
    const affectedStudents = new Set(res.data.map(t => t.assigned_to));
    affectedStudents.forEach(studentId => {
      clearCache(`my_tasks_${studentId}`);
    });
    taskIds.forEach(id => clearCache(`task_${id}`));
  }

  return {
    data: res.data || [],
    count: res.data?.length || 0,
    error: res.error,
  };
}

/** Update a master deliverable and sync details across all assigned intern task instances */
export async function updateMasterDeliverable(
  internshipId: string,
  currentTitle: string,
  updates: Partial<Task>,
  syncDeadline: boolean = true,
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const payload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.priority !== undefined) payload.priority = updates.priority;
  if (updates.difficulty !== undefined) payload.difficulty = updates.difficulty;
  if (updates.estimated_duration !== undefined) payload.estimated_duration = updates.estimated_duration;
  if (updates.attachments !== undefined) payload.attachments = updates.attachments;
  if (updates.objectives !== undefined) payload.objectives = updates.objectives;
  if (updates.acceptance_criteria !== undefined) payload.acceptance_criteria = updates.acceptance_criteria;

  if (syncDeadline && updates.due_date !== undefined) {
    payload.due_date = updates.due_date;
  }

  const res = await supabase
    .from('tasks')
    .update(payload)
    .eq('internship_id', internshipId)
    .eq('title', currentTitle)
    .select('id, assigned_to');

  if (!res.error && res.data) {
    clearCache('company_tasks');
    clearCache(`assigned_by_tasks_${user.id}`);
    res.data.forEach(t => {
      clearCache(`my_tasks_${t.assigned_to}`);
      clearCache(`task_${t.id}`);
    });
  }

  return {
    updated: res.data?.length || 0,
    error: res.error,
  };
}

/** Safely delete a master deliverable (deletes pending/unsubmitted tasks; warns on submitted) */
export async function deleteMasterDeliverable(
  internshipId: string,
  title: string,
  forceDeleteAll: boolean = false,
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Fetch all tasks matching this deliverable
  const { data: matchingTasks, error: fetchErr } = await supabase
    .from('tasks')
    .select('id, status, assigned_to')
    .eq('internship_id', internshipId)
    .eq('title', title);

  if (fetchErr || !matchingTasks?.length) {
    return { deleted: 0, skipped: 0, error: fetchErr || new Error('No matching tasks found') };
  }

  const hasSubmissions = matchingTasks.some(t => t.status === 'Submitted' || t.status === 'Approved');

  let tasksToDelete = matchingTasks;
  if (!forceDeleteAll && hasSubmissions) {
    // Only delete unsubmitted (Pending/Rejected) tasks
    tasksToDelete = matchingTasks.filter(t => t.status === 'Pending' || t.status === 'Rejected');
  }

  if (!tasksToDelete.length) {
    return {
      deleted: 0,
      skipped: matchingTasks.length,
      hasSubmissions,
      error: new Error('Cannot delete deliverable: all assigned interns have already submitted work.'),
    };
  }

  const idsToDelete = tasksToDelete.map(t => t.id);
  const { data: deletedRows, error: delErr } = await supabase
    .from('tasks')
    .delete()
    .in('id', idsToDelete)
    .select('id');

  // Bust company tasks cache and individual task caches
  clearCache('company_tasks');
  clearCache(`assigned_by_tasks_${user.id}`);
  tasksToDelete.forEach(t => {
    clearCache(`my_tasks_${t.assigned_to}`);
    clearCache(`task_${t.id}`);
  });

  if (delErr) {
    return {
      deleted: 0,
      skipped: matchingTasks.length,
      hasSubmissions,
      error: delErr,
    };
  }

  const actualDeleted = deletedRows ? deletedRows.length : tasksToDelete.length;

  return {
    deleted: actualDeleted,
    skipped: matchingTasks.length - actualDeleted,
    hasSubmissions,
    error: null,
  };
}

