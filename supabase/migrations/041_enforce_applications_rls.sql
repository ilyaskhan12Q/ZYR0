-- Migration 041: Guarantee RLS on public.applications (defense in depth)
-- Background: the student workspace queries `applications` without a
-- `student_id` filter and relies entirely on row-level security to hide
-- other students' rows. If the table predates migration 004 (which enables
-- RLS), RLS may be disabled while later migrations silently succeed — and
-- every authenticated student could read all applications.
--
-- This migration unconditionally re-enables RLS on the table and
-- re-creates the canonical read policy so the table stays locked down
-- regardless of its migration history. The policy mirrors migration 039
-- semantics: the applicant themselves, verified-company owners and
-- team members (admin/hr/reviewer), or platform admins.

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Applications: student sees own" ON public.applications;
CREATE POLICY "Applications: student sees own" ON public.applications FOR SELECT
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = internship_id AND public.is_company_verified(i.company_id)
        AND (
          EXISTS (
            SELECT 1 FROM public.companies c
            WHERE c.id = i.company_id AND c.owner_id = auth.uid()
          )
          OR public.is_company_member_with_role(i.company_id, auth.uid(), ARRAY['admin', 'hr', 'reviewer'])
        )
    )
    OR public.is_admin()
  );
