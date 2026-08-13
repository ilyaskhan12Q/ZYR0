-- =============================================
-- Migration 040: Lock down company_team_members reads
--
-- Migration 011 shipped a "Team: company members read" policy with
-- USING (true). After migration 039 added invite tokens + emails,
-- that policy let ANY authenticated user read every company's team
-- rows — including pending invites, member emails, and invite tokens.
--
-- Replace it with:
--   - members can read their own row (membership resolution)
--   - accepted (non-invited) rows remain publicly visible so the
--     public CompanyDetail team section keeps working; invite tokens
--     are always NULL on accepted rows (cleared at acceptance), so no
--     credential is exposed
--   - owners / admin-role members / platform admins keep full row
--     access via the existing "Team: owner or admin manage" FOR ALL
--     policy (migration 039)
-- =============================================

DROP POLICY IF EXISTS "Team: company members read" ON public.company_team_members;

CREATE POLICY "Team: members read own row" ON public.company_team_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Team: public read accepted" ON public.company_team_members FOR SELECT
  USING (status = 'accepted');