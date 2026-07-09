import { supabase } from '@/lib/supabase';
import type { WorkspaceEvent } from '@/lib/database.types';
import { getCachedData, setCachedData, clearCache } from '@/lib/cache';

/** Get workspace events for a student's internship placement */
export async function getWorkspaceEvents(internshipId: string, studentId: string, useCache = true) {
  const cacheKey = `workspace_events_${internshipId}_${studentId}`;
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const res = await supabase
    .from('workspace_events')
    .select('*')
    .eq('internship_id', internshipId)
    .eq('student_id', studentId)
    .order('created_at', { ascending: true }); // chronological order

  if (!res.error) {
    setCachedData(cacheKey, res);
  }
  return res;
}

/** Clear workspace events cache */
export function clearWorkspaceEventsCache(internshipId: string, studentId: string) {
  clearCache(`workspace_events_${internshipId}_${studentId}`);
}
