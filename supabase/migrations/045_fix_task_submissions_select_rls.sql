-- =============================================
-- Migration 045: Fix Task Submissions SELECT RLS
--
-- The original task_submissions SELECT policy (migration 011) only
-- allowed the student who submitted and the person who created the
-- task (assigned_by) to read submissions. This meant company owners
-- could NOT see submissions for tasks created by other team members.
--
-- This adds company-member-based SELECT access so any accepted member
-- of a company can read all submissions from their company's tasks.
-- =============================================

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Submissions: student or assigner" ON public.task_submissions;

-- New SELECT policy: student sees own submissions, company members
-- see all submissions from their company's tasks, platform admins see all
CREATE POLICY "Submissions: student, assigner, or company member"
  ON public.task_submissions FOR SELECT
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id AND t.assigned_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.internships i ON i.id = t.internship_id
      WHERE t.id = task_id
        AND (
          EXISTS (
            SELECT 1 FROM public.companies c
            WHERE c.id = i.company_id AND c.owner_id = auth.uid()
          )
          OR public.is_company_member(i.company_id, auth.uid())
        )
    )
    OR public.is_admin()
  );
