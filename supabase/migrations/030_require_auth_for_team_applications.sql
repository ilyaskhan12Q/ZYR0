-- =============================================
-- Migration 030: Require signup to apply for team roles
-- Links applications to auth users; anonymous inserts
-- are no longer allowed.
-- =============================================

ALTER TABLE public.team_applications
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Applications now require a signed-in user whose id matches the row
DROP POLICY IF EXISTS "team_applications: public insert" ON public.team_applications;
CREATE POLICY "team_applications: authenticated insert"
  ON public.team_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
