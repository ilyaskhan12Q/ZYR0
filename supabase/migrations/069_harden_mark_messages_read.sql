-- Migration 069: mark_messages_read trusts the caller, not the argument.
--
-- The RPC accepted any p_user_id and updated any conversation, so a signed-in
-- user could mark other people's messages read (and probe conversation ids).
-- Bind both values to the JWT and require participation.

create or replace function public.mark_messages_read(
  p_conversation_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or p_user_id is distinct from auth.uid() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.conversation_participants
    where conversation_id = p_conversation_id and user_id = auth.uid()
  ) then
    raise exception 'Not a conversation participant' using errcode = '42501';
  end if;

  update public.messages
  set read_by = array_append(coalesce(read_by, '{}'), auth.uid())
  where conversation_id = p_conversation_id
    and sender_id <> auth.uid()
    and not (auth.uid() = any(coalesce(read_by, '{}')));
end;
$$;

revoke all on function public.mark_messages_read(uuid, uuid) from public;
revoke all on function public.mark_messages_read(uuid, uuid) from anon;
grant execute on function public.mark_messages_read(uuid, uuid) to authenticated;
