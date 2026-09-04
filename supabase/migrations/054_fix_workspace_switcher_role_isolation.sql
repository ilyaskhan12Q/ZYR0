-- =============================================
-- Migration 054: Fix Workspace Switcher Role Isolation
--
-- Restores role isolation between personal identity (profiles.role)
-- and company team membership (company_team_members).
--
-- 1. accept_company_invite no longer overwrites profiles.role to 'company'
-- 2. Restores profiles.role for non-owner team members whose role was mutated
-- =============================================

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

  -- Accept the invite
  UPDATE public.company_team_members
  SET user_id = v_uid, status = 'accepted', accepted_at = now(), invite_token = NULL
  WHERE id IN (
    SELECT id FROM public.company_team_members
    WHERE invite_token = p_token AND status = 'invited'
  );

  -- Associate company_id if not already set, but preserve personal profile role
  UPDATE public.profiles
  SET company_id = COALESCE(company_id, v_company)
  WHERE id = v_uid;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- One-time data fix: restore profiles.role for team members who do NOT own a company
UPDATE public.profiles p
SET role = COALESCE(
  (SELECT raw_user_meta_data->>'role' FROM auth.users u WHERE u.id = p.id AND raw_user_meta_data->>'role' IN ('student', 'mentor')),
  'student'
)
WHERE p.role = 'company'
  AND p.id NOT IN (
    SELECT owner_id FROM public.companies WHERE owner_id IS NOT NULL
  )
  AND EXISTS (
    SELECT 1 FROM public.company_team_members ctm
    WHERE ctm.user_id = p.id AND ctm.status = 'accepted'
  );
