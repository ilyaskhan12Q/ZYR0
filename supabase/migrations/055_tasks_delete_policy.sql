-- =============================================
-- Migration 055: Tasks DELETE policy
--
-- Adds the missing DELETE policy on public.tasks so that
-- company owners, company admins, and the assigning mentor
-- can delete unsubmitted tasks and master deliverables.
-- Reviewers and students cannot delete tasks.
-- =============================================

DROP POLICY IF EXISTS "Tasks: company admin or assigner delete" ON public.tasks;
CREATE POLICY "Tasks: company admin or assigner delete" ON public.tasks FOR DELETE
  USING (
    -- The user who assigned/created the task
    auth.uid() = assigned_by
    -- Company owner or company admin
    OR public.has_company_access_with_role(
      (SELECT company_id FROM public.internships WHERE id = internship_id),
      auth.uid(),
      ARRAY['admin']
    )
    -- Platform admin
    OR public.is_admin()
  );
