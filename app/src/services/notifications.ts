import { supabase } from '@/lib/supabase';

/** Get current user's notifications */
export async function getNotifications(limit = 50) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };

  return supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
}

/** Count unread notifications */
export async function getUnreadNotificationCount() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false);

  return count ?? 0;
}

/** Mark a notification as read */
export async function markNotificationRead(id: string) {
  return supabase.from('notifications').update({ read: true }).eq('id', id);
}

/** Mark all notifications as read */
export async function markAllNotificationsRead() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  return supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false);
}

/** Create a notification (for internal use / edge functions) */
export async function createNotification(data: {
  user_id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
}) {
  return supabase.from('notifications').insert(data);
}
