-- =============================================
-- Migration 079: Per-conversation unread counts
-- (Which conversation has unread messages?)
-- =============================================

-- The sidebar shows a total unread badge, but nothing tells the user which
-- conversation holds the new messages. This RPC returns each of the caller's
-- conversations together with its unread count, computed from the existing
-- read_by uuid[] column so no schema change is needed.
--
-- SECURITY DEFINER so the count query can read messages rows; the scope is
-- still limited to the caller's own conversations via get_my_conversations(),
-- the same helper the RLS policies rely on.

CREATE OR REPLACE FUNCTION public.get_my_conversations_with_unread()
RETURNS TABLE (
  id              uuid,
  last_message    text,
  last_message_at timestamptz,
  created_at      timestamptz,
  updated_at      timestamptz,
  internship_id   uuid,
  unread_count    bigint
) AS $$
  SELECT
    c.id,
    c.last_message,
    c.last_message_at,
    c.created_at,
    c.updated_at,
    c.internship_id,
    (
      SELECT count(*)
      FROM public.messages m
      WHERE m.conversation_id = c.id
        AND m.sender_id <> auth.uid()
        AND NOT (auth.uid() = ANY(m.read_by))
    ) AS unread_count
  FROM public.conversations c
  WHERE c.id IN (SELECT public.get_my_conversations())
  ORDER BY c.last_message_at DESC NULLS LAST;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.get_my_conversations_with_unread() TO authenticated;
