-- Migration 042: Allow mentors to read their company's applications
-- Root cause: /company/interns lists interns from accepted applications
-- fetched via getAllCompanyApplications(). The applications SELECT policy
-- (039, reaffirmed by 041) only granted company read access to owners and
-- team members with role admin/hr/reviewer — 'mentor' was missing, so a
-- mentor's query returned zero rows and the interns page always showed
-- "No active interns found" for the company's accepted interns.
--
-- The mentors tab matrix grants the 'interns' tab to mentors, so mentors
-- need read access to the company's applications (the page itself filters
-- to Accepted rows client-side). UPDATE/INSERT are untouched — mentors may
-- not modify application status.

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
          OR public.is_company_member_with_role(i.company_id, auth.uid(), ARRAY['admin', 'hr', 'reviewer', 'mentor'])
        )
    )
    OR public.is_admin()
  );
