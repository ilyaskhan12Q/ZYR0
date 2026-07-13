-- Migration 022: Company Verification System

-- 1. Alter companies table: drop existing status check constraint if any, and add verified fields.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT conname
        FROM pg_constraint con
        INNER JOIN pg_class rel ON rel.oid = con.conrelid
        INNER JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public'
          AND rel.relname = 'companies'
          AND con.contype = 'c'
          AND con.consrc LIKE '%status%'
    LOOP
        EXECUTE 'ALTER TABLE public.companies DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- Update existing status values to match lowercase ones
UPDATE public.companies SET status = 'approved' WHERE status = 'Active';
UPDATE public.companies SET status = 'pending' WHERE status = 'Pending';
UPDATE public.companies SET status = 'suspended' WHERE status = 'Suspended';
-- Catch any other non-conforming statuses just in case
UPDATE public.companies SET status = 'approved' WHERE status NOT IN ('Active', 'Pending', 'Suspended') AND status NOT IN ('pending', 'approved', 'rejected', 'suspended');

-- Update default and check constraint
ALTER TABLE public.companies ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE public.companies ADD CONSTRAINT companies_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));

-- Add audit fields
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS verification_notes text;

-- 2. Create Helper Functions
CREATE OR REPLACE FUNCTION public.is_company_verified(company_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.companies
    WHERE id = company_id AND status = 'approved'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_user_verified_company_member(user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.owner_id = user_id AND c.status = 'approved'
  ) OR EXISTS (
    SELECT 1 FROM public.company_team_members tm
    JOIN public.companies c ON c.id = tm.company_id
    WHERE tm.user_id = user_id AND c.status = 'approved'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Update RLS Policies
-- Companies policies
DROP POLICY IF EXISTS "Companies: read active" ON public.companies;
CREATE POLICY "Companies: read active" ON public.companies FOR SELECT
  USING (status = 'approved' OR auth.uid() = owner_id OR public.is_admin());

-- Team policies
DROP POLICY IF EXISTS "Team: company owner manage" ON public.company_team_members;
CREATE POLICY "Team: company owner manage" ON public.company_team_members FOR ALL
  USING (
    (EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    ) AND public.is_company_verified(company_id)) OR public.is_admin()
  );

-- Internships policies
DROP POLICY IF EXISTS "Internships: read active" ON public.internships;
CREATE POLICY "Internships: read active" ON public.internships FOR SELECT
  USING (
    status = 'Active'
    OR EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Internships: company owner insert" ON public.internships;
CREATE POLICY "Internships: company owner insert" ON public.internships FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    ) AND public.is_company_verified(company_id)
  );

DROP POLICY IF EXISTS "Internships: company owner or admin update" ON public.internships;
CREATE POLICY "Internships: company owner or admin update" ON public.internships FOR UPDATE
  USING (
    (EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    ) AND public.is_company_verified(company_id)) OR public.is_admin()
  );

-- Applications policies
DROP POLICY IF EXISTS "Applications: student sees own" ON public.applications;
CREATE POLICY "Applications: student sees own" ON public.applications FOR SELECT
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = internship_id AND public.is_company_verified(i.company_id) AND EXISTS (
        SELECT 1 FROM public.companies c WHERE c.id = i.company_id AND c.owner_id = auth.uid()
      )
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Applications: student or company update" ON public.applications;
CREATE POLICY "Applications: student or company update" ON public.applications FOR UPDATE
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = internship_id AND public.is_company_verified(i.company_id) AND EXISTS (
        SELECT 1 FROM public.companies c WHERE c.id = i.company_id AND c.owner_id = auth.uid()
      )
    )
    OR public.is_admin()
  );

-- Tasks policies
DROP POLICY IF EXISTS "Tasks: company or mentor insert" ON public.tasks;
CREATE POLICY "Tasks: company or mentor insert" ON public.tasks FOR INSERT
  WITH CHECK (
    auth.uid() = assigned_by
    AND (
      public.is_admin()
      -- Must be verified owner or team member of a verified company
      OR public.is_user_verified_company_member(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Tasks: company or mentor update" ON public.tasks;
CREATE POLICY "Tasks: company or mentor update" ON public.tasks FOR UPDATE
  USING (
    (auth.uid() = assigned_by AND (
      public.is_admin()
      OR public.is_user_verified_company_member(auth.uid())
    ))
    OR auth.uid() = assigned_to
    OR public.is_admin()
  );

-- Task submissions review policy
DROP POLICY IF EXISTS "Submissions: reviewer update" ON public.task_submissions;
CREATE POLICY "Submissions: reviewer update" ON public.task_submissions FOR UPDATE
  USING (
    (EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id AND t.assigned_by = auth.uid()
    ) AND public.is_user_verified_company_member(auth.uid())) OR public.is_admin()
  );

-- Certificates policies
DROP POLICY IF EXISTS "Certificates: company or admin insert" ON public.certificates;
CREATE POLICY "Certificates: company or admin insert" ON public.certificates FOR INSERT
  WITH CHECK (
    (EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    ) AND public.is_company_verified(company_id)) OR public.is_admin()
  );

-- Offer letters policies
DROP POLICY IF EXISTS "Offer letters: student reads own" ON public.offer_letters;
CREATE POLICY "Offer letters: student reads own" ON public.offer_letters FOR SELECT
  USING (
    auth.uid() = student_id
    OR (EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    ) AND public.is_company_verified(company_id))
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Offer letters: company inserts own" ON public.offer_letters;
CREATE POLICY "Offer letters: company inserts own" ON public.offer_letters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    ) AND public.is_company_verified(company_id)
  );

DROP POLICY IF EXISTS "Offer letters: company or admin updates" ON public.offer_letters;
CREATE POLICY "Offer letters: company or admin updates" ON public.offer_letters FOR UPDATE
  USING (
    (EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    ) AND public.is_company_verified(company_id))
    OR auth.uid() = student_id
    OR public.is_admin()
  );
