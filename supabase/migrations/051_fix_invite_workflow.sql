-- Fix accept_company_invite:
-- 1. Verify invited email matches the authenticated user
-- 2. Block company owner from accepting their own invite
-- 3. Reset corrupted rows where owner accepted their own invite
CREATE OR REPLACE FUNCTION public.accept_company_invite(p_token text)
RETURNS boolean AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_company uuid;
  v_invitee_email text;
  v_user_email text;
  v_owner_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT company_id, email INTO v_company, v_invitee_email
  FROM public.company_team_members
  WHERE invite_token = p_token AND status = 'invited';

  IF v_company IS NULL THEN
    RETURN false;
  END IF;

  -- Verify the invited email matches the authenticated user's email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = v_uid;

  IF v_invitee_email IS NOT NULL AND lower(v_invitee_email) != lower(v_user_email) THEN
    RAISE EXCEPTION 'This invitation is for %, but you are signed in as %', v_invitee_email, v_user_email;
  END IF;

  -- Block company owner from accepting their own invite
  SELECT owner_id INTO v_owner_id
  FROM public.companies
  WHERE id = v_company;

  IF v_owner_id = v_uid THEN
    RAISE EXCEPTION 'You are the company owner. This invitation is for a team member.';
  END IF;

  -- Already an active member of this company? Reject the accept.
  IF EXISTS (
    SELECT 1 FROM public.company_team_members
    WHERE company_id = v_company AND user_id = v_uid AND status = 'accepted'
  ) THEN
    RETURN false;
  END IF;

  UPDATE public.company_team_members
  SET user_id = v_uid, status = 'accepted', accepted_at = now(), invite_token = NULL
  WHERE id IN (
    SELECT id FROM public.company_team_members
    WHERE invite_token = p_token AND status = 'invited'
  );

  -- Promote the user's profile role to 'company' so they access the company dashboard
  UPDATE public.profiles
  SET role = 'company'
  WHERE id = v_uid AND role != 'company';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Data cleanup: Reset corrupted rows where the company owner accepted their own invite
-- These rows have user_id = companies.owner_id and should be reset to invited status
UPDATE public.company_team_members ctm
SET user_id = NULL, status = 'invited', accepted_at = NULL,
    invite_token = COALESCE(invite_token, gen_random_uuid()::text)
FROM public.companies c
WHERE ctm.company_id = c.id
  AND ctm.user_id = c.owner_id
  AND ctm.status = 'accepted';

-- One-time data fix: promote all existing accepted company team members
-- who still have role='student' in profiles
UPDATE public.profiles p
SET role = 'company'
WHERE p.id IN (
  SELECT ctm.user_id
  FROM public.company_team_members ctm
  WHERE ctm.status = 'accepted'
    AND ctm.user_id IS NOT NULL
)
AND p.role != 'company';
