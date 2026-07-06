-- =============================================
-- Migration 011: Row Level Security Policies
-- Run AFTER all tables are created
-- =============================================

-- ───────────────────────────────────────────
-- Helper: check if current user is admin
-- ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ───────────────────────────────────────────
-- PROFILES
-- ───────────────────────────────────────────
CREATE POLICY "Profiles: public read"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Profiles: own update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Profiles: own insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ───────────────────────────────────────────
-- COMPANIES
-- ───────────────────────────────────────────
CREATE POLICY "Companies: read active"
  ON public.companies FOR SELECT
  USING (status = 'Active' OR auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Companies: insert by auth"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Companies: update by owner or admin"
  ON public.companies FOR UPDATE
  USING (auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Companies: delete by admin"
  ON public.companies FOR DELETE
  USING (public.is_admin());

-- Company team members
CREATE POLICY "Team: company members read"
  ON public.company_team_members FOR SELECT USING (true);

CREATE POLICY "Team: company owner manage"
  ON public.company_team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    ) OR public.is_admin()
  );

-- ───────────────────────────────────────────
-- INTERNSHIPS
-- ───────────────────────────────────────────
CREATE POLICY "Internships: read active"
  ON public.internships FOR SELECT
  USING (
    status = 'Active'
    OR EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    )
    OR public.is_admin()
  );

CREATE POLICY "Internships: company owner insert"
  ON public.internships FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Internships: company owner or admin update"
  ON public.internships FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    ) OR public.is_admin()
  );

CREATE POLICY "Internships: admin delete"
  ON public.internships FOR DELETE
  USING (public.is_admin());

-- ───────────────────────────────────────────
-- APPLICATIONS
-- ───────────────────────────────────────────
CREATE POLICY "Applications: student sees own"
  ON public.applications FOR SELECT
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.internships i
      JOIN public.companies c ON c.id = i.company_id
      WHERE i.id = internship_id AND c.owner_id = auth.uid()
    )
    OR public.is_admin()
  );

CREATE POLICY "Applications: student insert own"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Applications: student or company update"
  ON public.applications FOR UPDATE
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.internships i
      JOIN public.companies c ON c.id = i.company_id
      WHERE i.id = internship_id AND c.owner_id = auth.uid()
    )
    OR public.is_admin()
  );

-- ───────────────────────────────────────────
-- TASKS
-- ───────────────────────────────────────────
CREATE POLICY "Tasks: assigned student or assigner"
  ON public.tasks FOR SELECT
  USING (
    auth.uid() = assigned_to
    OR auth.uid() = assigned_by
    OR public.is_admin()
  );

CREATE POLICY "Tasks: company or mentor insert"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = assigned_by);

CREATE POLICY "Tasks: company or mentor update"
  ON public.tasks FOR UPDATE
  USING (
    auth.uid() = assigned_by
    OR auth.uid() = assigned_to
    OR public.is_admin()
  );

-- Task submissions
CREATE POLICY "Submissions: student or assigner"
  ON public.task_submissions FOR SELECT
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id AND t.assigned_by = auth.uid()
    )
    OR public.is_admin()
  );

CREATE POLICY "Submissions: student insert own"
  ON public.task_submissions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Submissions: reviewer update"
  ON public.task_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id AND t.assigned_by = auth.uid()
    ) OR public.is_admin()
  );

-- ───────────────────────────────────────────
-- CERTIFICATES
-- ───────────────────────────────────────────
-- Public can verify certificates (needed for /verify page)
CREATE POLICY "Certificates: public read active"
  ON public.certificates FOR SELECT
  USING (status = 'Active' OR auth.uid() = recipient_id OR public.is_admin());

CREATE POLICY "Certificates: company or admin insert"
  ON public.certificates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    ) OR public.is_admin()
  );

CREATE POLICY "Certificates: admin revoke"
  ON public.certificates FOR UPDATE
  USING (public.is_admin());

-- ───────────────────────────────────────────
-- MESSAGES & CONVERSATIONS
-- ───────────────────────────────────────────
CREATE POLICY "Conversations: participants only"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Conversations: insert by auth"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Conv participants: own"
  ON public.conversation_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Conv participants: insert"
  ON public.conversation_participants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Messages: participants only"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Messages: participant insert"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
    )
  );

-- ───────────────────────────────────────────
-- NOTIFICATIONS
-- ───────────────────────────────────────────
CREATE POLICY "Notifications: own user"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Notifications: system insert"
  ON public.notifications FOR INSERT
  WITH CHECK (true); -- Edge Functions use service role, bypasses RLS

CREATE POLICY "Notifications: own update (mark read)"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ───────────────────────────────────────────
-- EVALUATIONS
-- ───────────────────────────────────────────
CREATE POLICY "Evaluations: mentor sees own, intern sees submitted"
  ON public.evaluations FOR SELECT
  USING (
    auth.uid() = mentor_id
    OR (auth.uid() = intern_id AND status = 'Submitted')
    OR public.is_admin()
  );

CREATE POLICY "Evaluations: mentor insert"
  ON public.evaluations FOR INSERT
  WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Evaluations: mentor update own draft"
  ON public.evaluations FOR UPDATE
  USING (
    (auth.uid() = mentor_id AND status = 'Draft')
    OR public.is_admin()
  );

-- ───────────────────────────────────────────
-- ACTIVITY LOGS
-- ───────────────────────────────────────────
CREATE POLICY "Activity logs: admin only"
  ON public.activity_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Activity logs: insert by service"
  ON public.activity_logs FOR INSERT
  WITH CHECK (true); -- Edge Functions / service role

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
