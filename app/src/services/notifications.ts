import { supabase } from '@/lib/supabase';
import { getCachedData, setCachedData, clearCache } from '@/lib/cache';
import { dedupRequest } from '@/lib/cache/requestRegistry';

/** Get current user's notifications */
export async function getNotifications(limit = 50, useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };

  const cacheKey = `notifications_${user.id}`;
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = () => supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) {
    setCachedData(cacheKey, res);
  }
  return res;
}

/** Count unread notifications */
export async function getUnreadNotificationCount(useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const cacheKey = `unread_notifications_count_${user.id}`;
  if (useCache) {
    const cached = getCachedData<number>(cacheKey);
    if (cached !== null) return cached;
  }

  const fetchFn = async () => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);
    return count ?? 0;
  };

  const result = await dedupRequest(cacheKey, fetchFn);
  setCachedData(cacheKey, result);
  return result;
}

/** Mark a notification as read */
export async function markNotificationRead(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  const res = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (user) {
    clearCache(`notifications_${user.id}`);
    clearCache(`unread_notifications_count_${user.id}`);
  }
  return res;
}

/** Mark all notifications as read */
export async function markAllNotificationsRead() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const res = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false);

  clearCache(`notifications_${user.id}`);
  clearCache(`unread_notifications_count_${user.id}`);
  return res;
}

/** Create a notification (for internal use / edge functions) */
export async function createNotification(data: {
  user_id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
}) {
  const res = await supabase.from('notifications').insert(data);
  clearCache(`notifications_${data.user_id}`);
  clearCache(`unread_notifications_count_${data.user_id}`);
  return res;
}
