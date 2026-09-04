-- =============================================
-- Migration 054: Enforce task assignee enrollment & align reviewer permissions
--
-- 1. Restores canonical 'reviewer' role permission for task creation/management
--    (reconciling with 0.37.0 baseline migration 039 and CHANGELOG.md).
-- 2. Enforces database invariant: for tasks tied to an internship, the assigned
--    student (assigned_to) MUST be enrolled in that internship (internship_id)
--    with status = 'Accepted'. Direct API calls cannot assign across projects.
-- =============================================

-- 1. Tasks INSERT: enforce company access AND accepted enrollment
DROP POLICY IF EXISTS "Tasks: company or mentor insert" ON public.tasks;
CREATE POLICY "Tasks: company or mentor insert" ON public.tasks FOR INSERT
  WITH CHECK (
    auth.uid() = assigned_by
    AND (
      public.has_company_access_with_role(
        (SELECT company_id FROM public.internships WHERE id = internship_id),
        auth.uid(),
        ARRAY['admin', 'mentor', 'reviewer']
      )
    )
    AND (
      -- If internship_id is provided, the assigned student must have an Accepted application for it
      internship_id IS NULL OR EXISTS (
        SELECT 1 FROM public.applications a
        WHERE a.internship_id = tasks.internship_id
          AND a.student_id = tasks.assigned_to
          AND a.status = 'Accepted'
      )
    )
  );

-- 2. Tasks UPDATE: enforce company access AND accepted enrollment
DROP POLICY IF EXISTS "Tasks: assigner or company admin update" ON public.tasks;
CREATE POLICY "Tasks: assigner or company admin update" ON public.tasks FOR UPDATE
  USING (
    auth.uid() = assigned_by
    OR public.has_company_access_with_role(
      (SELECT company_id FROM public.internships WHERE id = internship_id),
      auth.uid(),
      ARRAY['admin', 'mentor', 'reviewer']
    )
    OR auth.uid() = assigned_to
  )
  WITH CHECK (
    -- Students updating their own task (e.g. status changes during submission)
    auth.uid() = assigned_to
    OR (
      public.has_company_access_with_role(
        (SELECT company_id FROM public.internships WHERE id = internship_id),
        auth.uid(),
        ARRAY['admin', 'mentor', 'reviewer']
      )
      AND (
        internship_id IS NULL OR EXISTS (
          SELECT 1 FROM public.applications a
          WHERE a.internship_id = tasks.internship_id
            AND a.student_id = tasks.assigned_to
            AND a.status = 'Accepted'
        )
      )
    )
  );
