-- Migration 071: an invitation without an email is not an invitation.
--
-- accept_company_invite only compared the invite email when it was non-null,
-- so a team_members row with email = null could be claimed by whoever held the
-- token. The client now requires an email up front; this closes the server side
-- for existing rows too.

create or replace function public.accept_company_invite(p_token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_company uuid;
  v_invitee_email text;
  v_user_email text;
  v_owner_id uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select company_id, email into v_company, v_invitee_email
  from public.company_team_members
  where invite_token = p_token and status = 'invited';

  if v_company is null then
    return false;
  end if;

  if v_invitee_email is null or btrim(v_invitee_email) = '' then
    raise exception 'This invitation has no email address and cannot be accepted. Ask the company to resend it.';
  end if;

  select email into v_user_email
  from auth.users
  where id = v_uid;

  if lower(v_invitee_email) != lower(v_user_email) then
    raise exception 'This invitation is for %, but you are signed in as %', v_invitee_email, v_user_email;
  end if;

  select owner_id into v_owner_id
  from public.companies
  where id = v_company;

  if v_owner_id = v_uid then
    raise exception 'You are the company owner. This invitation is for a team member.';
  end if;

  if exists (
    select 1 from public.company_team_members
    where company_id = v_company and user_id = v_uid and status = 'accepted'
  ) then
    return false;
  end if;

  update public.company_team_members
  set user_id = v_uid, status = 'accepted', accepted_at = now(), invite_token = null
  where id in (
    select id from public.company_team_members
    where invite_token = p_token and status = 'invited'
  );

  update public.profiles
  set company_id = coalesce(company_id, v_company)
  where id = v_uid;

  return found;
end;
$$;

revoke all on function public.accept_company_invite(text) from public;
grant execute on function public.accept_company_invite(text) to authenticated;
