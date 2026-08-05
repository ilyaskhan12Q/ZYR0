-- =============================================
-- Migration 032: Allow students to read their own team applications
-- Students must be able to track their founding-team applications
-- from the student dashboard (/student/team-applications).
-- Admin select policy from 028 is untouched.
-- =============================================

CREATE POLICY "team_applications: owner select"
  ON public.team_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
