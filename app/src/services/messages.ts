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
        internship:internships(id, title, company:companies(id, name, logo_url)),
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
export async function getMessages(conversation_id: string, useCache = true) {
  const cacheKey = `messages_${conversation_id}`;
  if (useCache) {
    const cached = getCachedData<any>(cacheKey);
    if (cached) return cached;
  }

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
    clearCache(`messages_${data.conversation_id}`);
    clearCache(`unread_count_${user.id}`);
    clearCache(`unread_counts_${user.id}`);
  }
  return res;
}

/** Start or get a conversation with another user */
export async function getOrCreateConversation(internshipId: string, otherUserId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('get_or_create_conversation', {
    p_internship_id: internshipId,
    p_other_user_id: otherUserId,
  });

  if (error) {
    console.error('Error in getOrCreateConversation:', error);
    return { data: null, error };
  }

  clearCache(`conversations_${user.id}`);
  clearCache(`conversations_${otherUserId}`);

  return { data: { id: data }, error: null };
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

  // read_by lives on the message rows, so the thread cache must go too.
  clearCache(`messages_${conversation_id}`);
  clearCache(`conversations_${user.id}`);
  clearCache(`unread_count_${user.id}`);
  clearCache(`unread_counts_${user.id}`);
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

/** Unread message count per conversation (0 for conversations with nothing new) */
export async function getConversationUnreadCounts(useCache = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [] as { id: string; unread_count: number }[], error: null };

  const cacheKey = `unread_counts_${user.id}`;
  if (useCache) {
    const cached = getCachedData<{ id: string; unread_count: number }[]>(cacheKey);
    if (cached) return { data: cached, error: null };
  }

  const fetchFn = async () => {
    const { data, error } = await supabase
      .rpc('get_my_conversations_with_unread')
      .select('id, unread_count');
    if (error) throw error;
    return (data ?? []) as { id: string; unread_count: number }[];
  };

  try {
    const result = await dedupRequest(cacheKey, fetchFn);
    setCachedData(cacheKey, result);
    return { data: result, error: null };
  } catch (error) {
    console.error('Error loading unread counts:', error);
    return { data: [] as { id: string; unread_count: number }[], error };
  }
}

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // matches the bucket's file_size_limit

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export { formatBytes };

/**
 * Upload chat attachments to the private `message-attachments` bucket and
 * return the metadata shape `sendMessage()` accepts. Files live under
 * `{conversation_id}/` so the storage RLS can scope reads to participants.
 */
export async function uploadMessageAttachments(files: File[], conversation_id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const uploaded: { name: string; url: string; type: string; size: string }[] = [];
  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      throw new Error(`"${file.name}" is larger than the 10 MB limit`);
    }
    const safeName = file.name.replace(/[/\\?%*:|"<>]/g, '_');
    const path = `${conversation_id}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage
      .from('message-attachments')
      .upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    uploaded.push({
      name: file.name,
      url: path,
      type: file.type || 'application/octet-stream',
      size: formatBytes(file.size),
    });
  }
  return uploaded;
}

/** Short-lived signed URLs for message attachment paths (private bucket). */
export async function getAttachmentUrls(paths: string[]) {
  const map = new Map<string, string>();
  if (!paths.length) return map;

  const { data, error } = await supabase.storage
    .from('message-attachments')
    .createSignedUrls(paths, 3600);

  if (error) {
    console.error('Error signing attachment URLs:', error);
    return map;
  }
  for (const item of data ?? []) {
    if (item?.path && item.signedUrl) map.set(item.path, item.signedUrl);
  }
  return map;
}
