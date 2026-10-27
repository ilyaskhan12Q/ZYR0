-- Migration 067: students cannot grant themselves an outcome.
--
-- "Applications: student insert own" only checked student_id, so an applicant
-- could insert directly with status = 'Accepted'. The UPDATE policy had no
-- WITH CHECK at all, so a student could also flip their own row to Accepted
-- (or any other company-only status) after applying.

drop policy if exists "Applications: student insert own" on public.applications;
create policy "Applications: student insert own"
  on public.applications for insert to authenticated
  with check (auth.uid() = student_id and status = 'Applied');

drop policy if exists "Applications: student or company update" on public.applications;
create policy "Applications: student or company update" on public.applications for update
  using (
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
  )
  with check (
    (auth.uid() = student_id AND status IN ('Applied', 'Withdrawn'))
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
