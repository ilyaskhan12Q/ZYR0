import { useEffect, useRef, type DependencyList } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Subscribe to real-time INSERT events on a table with a filter.
 * Automatically unsubscribes on unmount.
 *
 * @example
 * useRealtimeInsert(
 *   'messages',
 *   `conversation_id=eq.${conversationId}`,
 *   (payload) => setMessages(prev => [...prev, payload.new]),
 *   [conversationId]
 * )
 */
export function useRealtimeInsert<T>(
  table: string,
  filter: string,
  onInsert: (record: T) => void,
  deps: DependencyList = []
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    channelRef.current = supabase
      .channel(`realtime:${table}:${filter}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table, filter },
        (payload) => onInsert(payload.new as T)
      )
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Subscribe to real-time UPDATE events on a table with a filter.
 */
export function useRealtimeUpdate<T>(
  table: string,
  filter: string,
  onUpdate: (record: T) => void,
  deps: DependencyList = []
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    channelRef.current = supabase
      .channel(`realtime:update:${table}:${filter}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table, filter },
        (payload) => onUpdate(payload.new as T)
      )
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Track online presence in a conversation or room.
 * Uses Supabase Presence channel.
 */
export function usePresence(
  roomId: string,
  userId: string,
  onPresenceChange: (onlineUserIds: string[]) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!roomId || !userId) return;

    channelRef.current = supabase.channel(`presence:${roomId}`, {
      config: { presence: { key: userId } },
    });

    channelRef.current
      .on('presence', { event: 'sync' }, () => {
        const state = channelRef.current?.presenceState() ?? {};
        const onlineIds = Object.keys(state);
        onPresenceChange(onlineIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channelRef.current?.track({ user_id: userId, online_at: Date.now() });
        }
      });

    return () => {
      channelRef.current?.untrack();
      channelRef.current?.unsubscribe();
    };
  }, [roomId, userId]);
}
