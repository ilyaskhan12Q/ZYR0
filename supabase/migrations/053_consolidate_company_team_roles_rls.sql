-- =============================================
-- Migration 053: Consolidate Company Team & Roles Architecture RLS & RPCs
--
-- Consolidates company ownership and team role authorization into
-- one canonical model:
--   - Owner: companies.owner_id (full company-wide authority)
--   - Team roles: admin, hr, mentor, reviewer in company_team_members
--
-- Fixes:
--   1. Owner locked out of tasks INSERT
--   2. Owner locked out of task submissions UPDATE (grading/reviews)
--   3. Company admin locked out of companies UPDATE (profile edits)
--   4. Task UPDATE locked to only the individual assigner
--   5. accept_company_invite sets profiles.company_id
--   6. remove_company_team_member RPC for safe member removal and profile cleanup
-- =============================================

-- 1. Helper function: has_company_access_with_role
-- Checks if user is the company owner, platform admin, OR an accepted member with one of the specified roles.
CREATE OR REPLACE FUNCTION public.has_company_access_with_role(p_company_id uuid, p_user_id uuid, p_roles text[])
RETURNS boolean AS $$
BEGIN
  IF p_user_id IS NULL OR p_company_id IS NULL THEN
    RETURN false;
  END IF;

  -- Platform admin has global access
  IF public.is_admin() THEN
    RETURN true;
  END IF;

  -- Company owner has full authority
  IF EXISTS (
    SELECT 1 FROM public.companies
    WHERE id = p_company_id AND owner_id = p_user_id
  ) THEN
    RETURN true;
  END IF;

  -- Accepted team member with required role
  RETURN EXISTS (
    SELECT 1 FROM public.company_team_members
    WHERE company_id = p_company_id
      AND user_id = p_user_id
      AND status = 'accepted'
      AND role = ANY(p_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Helper function: is_company_owner
CREATE OR REPLACE FUNCTION public.is_company_owner(p_company_id uuid, p_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.companies
    WHERE id = p_company_id AND owner_id = p_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Fix Companies UPDATE: allow owner, company admin, or platform admin
DROP POLICY IF EXISTS "Companies: update by owner or admin" ON public.companies;
CREATE POLICY "Companies: update by owner or admin"
  ON public.companies FOR UPDATE
  USING (
    public.has_company_access_with_role(id, auth.uid(), ARRAY['admin'])
  );

-- 4. Fix Tasks INSERT: allow owner, platform admin, or company member with admin/mentor
DROP POLICY IF EXISTS "Tasks: company or mentor insert" ON public.tasks;
CREATE POLICY "Tasks: company or mentor insert" ON public.tasks FOR INSERT
  WITH CHECK (
    auth.uid() = assigned_by
    AND (
      public.has_company_access_with_role(
        (SELECT company_id FROM public.internships WHERE id = internship_id),
        auth.uid(),
        ARRAY['admin', 'mentor']
      )
    )
  );

-- 5. Fix Tasks UPDATE: allow assigner, owner, platform admin, or company admin/mentor
DROP POLICY IF EXISTS "Tasks: assigner or admin update" ON public.tasks;
CREATE POLICY "Tasks: assigner or company admin update" ON public.tasks FOR UPDATE
  USING (
    auth.uid() = assigned_by
    OR public.has_company_access_with_role(
      (SELECT company_id FROM public.internships WHERE id = internship_id),
      auth.uid(),
      ARRAY['admin', 'mentor']
    )
  );

-- 6. Fix Task Submissions UPDATE: allow assigner, owner, platform admin, or reviewer/mentor/admin
DROP POLICY IF EXISTS "Submissions: reviewer update" ON public.task_submissions;
CREATE POLICY "Submissions: reviewer update" ON public.task_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id AND t.assigned_by = auth.uid()
    )
    OR public.has_company_access_with_role(
      (SELECT i.company_id FROM public.tasks t JOIN public.internships i ON i.id = t.internship_id WHERE t.id = task_id),
      auth.uid(),
      ARRAY['admin', 'reviewer', 'mentor']
    )
  );

-- 7. Ensure Certificates INSERT allows owner, admin, or hr
DROP POLICY IF EXISTS "Certificates: company or admin insert" ON public.certificates;
CREATE POLICY "Certificates: company or admin insert" ON public.certificates FOR INSERT
  WITH CHECK (
    public.has_company_access_with_role(company_id, auth.uid(), ARRAY['admin', 'hr'])
  );

-- 8. Ensure Offer Letters INSERT and UPDATE allow owner, admin, or hr
DROP POLICY IF EXISTS "Offer letters: company inserts own" ON public.offer_letters;
CREATE POLICY "Offer letters: company inserts own" ON public.offer_letters FOR INSERT
  WITH CHECK (
    public.has_company_access_with_role(company_id, auth.uid(), ARRAY['admin', 'hr'])
    AND public.is_company_verified(company_id)
  );

DROP POLICY IF EXISTS "Offer letters: company or admin updates" ON public.offer_letters;
CREATE POLICY "Offer letters: company or admin updates" ON public.offer_letters FOR UPDATE
  USING (
    (
      public.has_company_access_with_role(company_id, auth.uid(), ARRAY['admin', 'hr'])
      AND public.is_company_verified(company_id)
    )
    OR auth.uid() = student_id
  );

-- 9. Update accept_company_invite to set profiles.company_id as well as profiles.role
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

  -- Promote user's profile role to 'company' and associate company_id
  UPDATE public.profiles
  SET role = 'company',
      company_id = v_company
  WHERE id = v_uid;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. RPC: remove_company_team_member
-- Safely removes a team member and resets their profile if they belong to no other company.
CREATE OR REPLACE FUNCTION public.remove_company_team_member(p_member_id uuid)
RETURNS boolean AS $$
DECLARE
  v_caller_uid uuid := auth.uid();
  v_company_id uuid;
  v_target_user_id uuid;
  v_target_role text;
  v_is_owner boolean;
  v_caller_is_admin boolean;
BEGIN
  IF v_caller_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT company_id, user_id, role INTO v_company_id, v_target_user_id, v_target_role
  FROM public.company_team_members
  WHERE id = p_member_id;

  IF v_company_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check caller authority
  v_is_owner := EXISTS (
    SELECT 1 FROM public.companies
    WHERE id = v_company_id AND owner_id = v_caller_uid
  );

  v_caller_is_admin := EXISTS (
    SELECT 1 FROM public.company_team_members
    WHERE company_id = v_company_id AND user_id = v_caller_uid AND status = 'accepted' AND role = 'admin'
  );

  IF NOT (v_is_owner OR v_caller_is_admin OR public.is_admin()) THEN
    RAISE EXCEPTION 'Not authorized to manage team members';
  END IF;

  -- Only owner or platform admin can remove another admin
  IF v_target_role = 'admin' AND NOT (v_is_owner OR public.is_admin()) THEN
    RAISE EXCEPTION 'Only the company owner can remove an administrator';
  END IF;

  -- Delete the team member record
  DELETE FROM public.company_team_members WHERE id = p_member_id;

  -- If the target user was linked, check if they still belong to any company
  IF v_target_user_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.companies WHERE owner_id = v_target_user_id
    ) AND NOT EXISTS (
      SELECT 1 FROM public.company_team_members WHERE user_id = v_target_user_id AND status = 'accepted'
    ) THEN
      -- Demote back to student role and clear company_id
      UPDATE public.profiles
      SET role = 'student',
          company_id = NULL
      WHERE id = v_target_user_id AND role = 'company';
    END IF;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
