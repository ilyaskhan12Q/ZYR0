import { supabase } from '@/lib/supabase';
import { getCachedData, setCachedData, clearCache } from '@/lib/cache';
import { dedupRequest } from '@/lib/cache/requestRegistry';

/** Get all conversations for current user */
export async function getMyConversations(useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const cacheKey = `conversations_${user.id}`;
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = async () => {
    const { data: participations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (!participations?.length) return { data: [], error: null };

    const conversationIds = participations.map((p) => p.conversation_id);

    return supabase
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants (
          user:profiles!user_id (id, full_name, avatar_url, role)
        )
      `)
      .in('id', conversationIds)
      .order('last_message_at', { ascending: false });
  };

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) {
    setCachedData(cacheKey, res);
  }
  return res;
}

/** Get messages in a conversation */
export async function getMessages(conversation_id: string) {
  const cacheKey = `messages_${conversation_id}`;
  const cached = getCachedData<any>(cacheKey);
  if (cached) return cached;

  const fetchFn = () => supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!sender_id (id, full_name, avatar_url, role)
    `)
    .eq('conversation_id', conversation_id)
    .order('created_at', { ascending: true });

  const res = await dedupRequest(cacheKey, fetchFn);

  if (!res.error) setCachedData(cacheKey, res);
  return res;
}

/** Send a message */
export async function sendMessage(data: {
  conversation_id: string;
  content: string;
  attachments?: { name: string; url: string; type: string; size: string }[];
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const res = await supabase
    .from('messages')
    .insert({
      ...data,
      sender_id: user.id,
      read_by: [user.id],
    })
    .select(`
      *,
      sender:profiles!sender_id (id, full_name, avatar_url, role)
    `)
    .single();

  if (!res.error) {
    clearCache(`conversations_${user.id}`);
    clearCache(`unread_count_${user.id}`);
  }
  return res;
}

/** Start or get a conversation with another user */
export async function getOrCreateConversation(otherUserId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Find existing conversation between these two users
  const { data: myConvs } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user.id);

  if (myConvs?.length) {
    const { data: shared } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', otherUserId)
      .in('conversation_id', myConvs.map((c) => c.conversation_id));

    if (shared?.length) {
      return { data: { id: shared[0].conversation_id }, error: null };
    }
  }

  // Create a new conversation
  const { data: conv, error } = await supabase
    .from('conversations')
    .insert({})
    .select()
    .single();

  if (error) return { data: null, error };

  // Add both participants
  await supabase.from('conversation_participants').insert([
    { conversation_id: conv.id, user_id: user.id },
    { conversation_id: conv.id, user_id: otherUserId },
  ]);

  clearCache(`conversations_${user.id}`);
  clearCache(`conversations_${otherUserId}`);

  return { data: conv, error: null };
}

/** Mark messages in a conversation as read */
export async function markMessagesRead(conversation_id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Append current user to read_by array
  await supabase.rpc('mark_messages_read', {
    p_conversation_id: conversation_id,
    p_user_id: user.id,
  });

  clearCache(`conversations_${user.id}`);
  clearCache(`unread_count_${user.id}`);
}

/** Count unread messages for current user */
export async function getUnreadCount(useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const cacheKey = `unread_count_${user.id}`;
  if (useCache) {
    const cached = getCachedData<number>(cacheKey);
    if (cached !== null) return cached;
  }

  const fetchFn = async () => {
    const { data: participations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (!participations?.length) return 0;

    const convIds = participations.map((p) => p.conversation_id);

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', convIds)
      .not('sender_id', 'eq', user.id)
      .not('read_by', 'cs', `{${user.id}}`);

    return count ?? 0;
  };

  const result = await dedupRequest(cacheKey, fetchFn);
  setCachedData(cacheKey, result);
  return result;
}
