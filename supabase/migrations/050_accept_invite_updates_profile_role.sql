-- Update accept_company_invite to also set profiles.role = 'company'
-- so team members don't remain stuck with role='student' after joining a company.
CREATE OR REPLACE FUNCTION public.accept_company_invite(p_token text)
RETURNS boolean AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_company uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT company_id INTO v_company
  FROM public.company_team_members
  WHERE invite_token = p_token AND status = 'invited';

  IF v_company IS NULL THEN
    RETURN false;
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
