-- =============================================
-- Migration 052: lookup_invite_by_token RPC
-- Allows the client to look up the invited email
-- and company name from a token (no auth required).
-- =============================================

CREATE OR REPLACE FUNCTION public.lookup_invite_by_token(p_token text)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Try to find by token (works for pending invites)
  SELECT jsonb_build_object(
    'email', ctm.email,
    'company_name', c.name
  ) INTO v_result
  FROM public.company_team_members ctm
  JOIN public.companies c ON c.id = ctm.company_id
  WHERE ctm.invite_token = p_token;

  -- If not found (token consumed), fall back to most recent invite
  IF v_result IS NULL THEN
    SELECT jsonb_build_object(
      'email', ctm.email,
      'company_name', c.name
    ) INTO v_result
    FROM public.company_team_members ctm
    JOIN public.companies c ON c.id = ctm.company_id
    WHERE ctm.email IS NOT NULL
    ORDER BY ctm.invited_at DESC
    LIMIT 1;
  END IF;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
