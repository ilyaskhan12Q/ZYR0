-- Migration 070: the public invite lookup must not reveal the invited address.
--
-- lookup_invite_by_token is callable without a session, so returning the email
-- turned any leaked invite link into a disclosure of who it was sent to.
-- The accept page only needs the company name and whether the invite is live.

create or replace function public.lookup_invite_by_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object('company_name', c.name, 'status', ctm.status)
  into v_result
  from public.company_team_members ctm
  join public.companies c on c.id = ctm.company_id
  where ctm.invite_token = p_token
    and ctm.status = 'invited';

  return coalesce(v_result, '{}'::jsonb);
end;
$$;

revoke all on function public.lookup_invite_by_token(text) from public;
grant execute on function public.lookup_invite_by_token(text) to anon, authenticated;
