import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { getMyActiveApplicationsCount, getCompanyActiveApplicationsCount } from '@/services/applications';
import { getMyPendingTasksCount, getTasksToReviewCount } from '@/services/tasks';
import { getUnreadCount } from '@/services/messages';

export interface SidebarCounts {
  applications?: number;
  tasks?: number;
  messages?: number;
}

/**
 * Live real counts for the sidebar nav badges.
 *
 * Fetches role-appropriate counts once on mount (student: active applications +
 * pending tasks + unread messages; company: active applications + unread
 * messages; mentor: to-review tasks + unread messages), and keeps them in sync
 * via Supabase realtime `postgres_changes` subscriptions scoped by the same RLS
 * policies the services rely on.
 */
export function useSidebarCounts(companyIdOverride?: string | null): SidebarCounts {
  const { user, profile } = useAuth();
  const role = profile?.role;
  const companyId = companyIdOverride ?? profile?.company_id ?? null;
  const [counts, setCounts] = useState<SidebarCounts>({});

  const refresh = useCallback(async (useCache = true) => {
    if (role === 'student') {
      const [applications, tasks, messages] = await Promise.all([
        getMyActiveApplicationsCount(useCache),
        getMyPendingTasksCount(useCache),
        getUnreadCount(useCache),
      ]);
      setCounts({ applications, tasks, messages });
    } else if (role === 'company' && companyId) {
      const [applications, messages] = await Promise.all([
        getCompanyActiveApplicationsCount(companyId, useCache),
        getUnreadCount(useCache),
      ]);
      setCounts({ applications, messages });
    } else if (role === 'mentor') {
      const [tasks, messages] = await Promise.all([
        getTasksToReviewCount(useCache),
        getUnreadCount(useCache),
      ]);
      setCounts({ tasks, messages });
    } else {
      setCounts({});
    }
  }, [role, companyId]);

  // Debounced refetch for realtime events
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const debouncedRefresh = useCallback(() => {
    clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => refresh(false), 500);
  }, [refresh]);

  // Initial load only — realtime subscriptions keep counts fresh.
  useEffect(() => {
    refresh(false);
  }, [refresh]);

  // Realtime: refetch (bypassing cache) when relevant rows change.
  useEffect(() => {
    if (!role || !user?.id) return;

    const onEvent = () => debouncedRefresh();
    const channels: ReturnType<typeof supabase.channel>[] = [];

    if (role === 'student') {
      channels.push(
        supabase.channel(`sidebar-applications-${user.id}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'applications', filter: `student_id=eq.${user.id}` }, onEvent),
        supabase.channel(`sidebar-tasks-${user.id}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `assigned_to=eq.${user.id}` }, onEvent)
      );
    } else if (role === 'company') {
      // RLS scopes application events to this company's internships.
      channels.push(
        supabase.channel(`sidebar-applications-${user.id}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, onEvent)
      );
    } else if (role === 'mentor') {
      channels.push(
        supabase.channel(`sidebar-tasks-${user.id}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `assigned_by=eq.${user.id}` }, onEvent)
      );
    }

    channels.push(
      supabase.channel(`sidebar-messages-${user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, onEvent)
    );

    channels.forEach((channel) => channel.subscribe());

    return () => {
      clearTimeout(refreshTimerRef.current);
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [role, user?.id, debouncedRefresh]);

  return counts;
}