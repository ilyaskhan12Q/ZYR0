import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
 * Fetches role-appropriate counts (student: active applications + pending
 * tasks + unread messages; company: active applications + unread messages;
 * mentor: to-review tasks + unread messages), refreshes them on every route
 * change, and keeps them in sync via Supabase realtime `postgres_changes`
 * subscriptions scoped by the same RLS policies the services rely on.
 */
export function useSidebarCounts(): SidebarCounts {
  const { user, profile } = useAuth();
  const role = profile?.role;
  const companyId = profile?.company_id;
  const location = useLocation();
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

  // Initial load + refresh whenever the user navigates between tabs.
  useEffect(() => {
    refresh(false);
  }, [refresh, location.pathname]);

  // Realtime: refetch (bypassing cache) when relevant rows change.
  useEffect(() => {
    if (!role || !user?.id) return;

    const onEvent = () => refresh(false);
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
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [role, user?.id, refresh]);

  return counts;
}