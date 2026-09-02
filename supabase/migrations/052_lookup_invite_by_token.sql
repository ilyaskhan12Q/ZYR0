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
  SELECT jsonb_build_object(
    'email', ctm.email,
    'company_name', c.name
  ) INTO v_result
  FROM public.company_team_members ctm
  JOIN public.companies c ON c.id = ctm.company_id
  WHERE ctm.invite_token = p_token;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
