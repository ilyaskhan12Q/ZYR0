-- =============================================
-- Migration 045: Fix Tasks SELECT RLS
--
-- The original tasks SELECT policy (migration 011) only allowed
-- assigned_to, assigned_by, or platform admins to read tasks.
-- This meant company owners/members could NOT see tasks created
-- by other team members in their own company.
--
-- This migration adds company-member-based SELECT access so any
-- accepted member of a company can see all tasks belonging to
-- their company's internships.
-- =============================================

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Tasks: assigned student or assigner" ON public.tasks;

-- New SELECT policy: students see their own tasks, company members
-- see all tasks in their company, platform admins see everything
CREATE POLICY "Tasks: assigned, assigner, or company member"
  ON public.tasks FOR SELECT
  USING (
    auth.uid() = assigned_to
    OR auth.uid() = assigned_by
    OR EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = internship_id
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
