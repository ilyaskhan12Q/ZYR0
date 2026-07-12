import { supabase } from '@/lib/supabase';
import type { WorkspaceEvent } from '@/lib/database.types';
import { getCachedData, setCachedData, clearCache } from '@/lib/cache';
import { dedupRequest } from '@/lib/cache/requestRegistry';

/** Get workspace events for a student's internship placement */
export async function getWorkspaceEvents(internshipId: string, studentId: string, useCache = true) {
  const cacheKey = `workspace_events_${internshipId}_${studentId}`;
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => supabase
    .from('workspace_events')
    .select('*')
    .eq('internship_id', internshipId)
    .eq('student_id', studentId)
    .order('created_at', { ascending: true });

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) {
    setCachedData(cacheKey, res);
  }
  return res;
}

/** Create a workspace event and invalidate cache */
export async function createWorkspaceEvent(data: {
  internship_id: string;
  student_id: string;
  actor_id?: string;
  event_type: WorkspaceEvent['event_type'];
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}) {
  const res = await supabase.from('workspace_events').insert({
    internship_id: data.internship_id,
    student_id: data.student_id,
    actor_id: data.actor_id ?? null,
    event_type: data.event_type,
    title: data.title,
    description: data.description ?? null,
    metadata: (data.metadata ?? {}) as Record<string, any>,
  });
  clearCache(`workspace_events_${data.internship_id}_${data.student_id}`);
  return res;
}

/** Clear workspace events cache */
export function clearWorkspaceEventsCache(internshipId: string, studentId: string) {
  clearCache(`workspace_events_${internshipId}_${studentId}`);
}
