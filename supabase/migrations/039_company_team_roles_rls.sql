-- =============================================
-- Migration 039: Company team roles, invites & role-scoped RLS
--
-- Gives company team members (admin / hr / mentor / reviewer) real
-- accounts and role-scoped data access. Every role sees exactly the
-- data its dashboard tabs operate on — no more, no less.
-- =============================================

-- 1. Normalize existing role values to the canonical constants
UPDATE public.company_team_members
SET role = CASE
    WHEN LOWER(role) IN ('admin', 'owner')            THEN 'admin'
    WHEN LOWER(role) IN ('hr', 'hr manager', 'hr_manager') THEN 'hr'
    WHEN LOWER(role) IN ('mentor')                    THEN 'mentor'
    WHEN LOWER(role) IN ('reviewer')                  THEN 'reviewer'
    ELSE 'admin'
  END;

-- 2. Invite / acceptance columns
ALTER TABLE public.company_team_members
  ADD COLUMN IF NOT EXISTS status       text NOT NULL DEFAULT 'accepted',
  ADD COLUMN IF NOT EXISTS invite_token text,
  ADD COLUMN IF NOT EXISTS invited_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS invited_at   timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS accepted_at  timestamptz;

-- Existing unlinked rows become real pending invites (so owners can
-- resend the invite email instead of having dead rows).
UPDATE public.company_team_members
SET status        = 'invited',
    invite_token  = gen_random_uuid()::text,
    invited_at    = COALESCE(invited_at, now())
WHERE user_id IS NULL AND status = 'accepted';

-- 3. Constraints & indexes
ALTER TABLE public.company_team_members
  DROP CONSTRAINT IF EXISTS company_team_members_role_check,
  ADD CONSTRAINT company_team_members_role_check
    CHECK (role IN ('admin', 'hr', 'mentor', 'reviewer'));

ALTER TABLE public.company_team_members
  DROP CONSTRAINT IF EXISTS company_team_members_status_check,
  ADD CONSTRAINT company_team_members_status_check
    CHECK (status IN ('invited', 'accepted'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_company_team_members_user
  ON public.company_team_members (company_id, user_id)
  WHERE user_id IS NOT NULL AND status = 'accepted';

CREATE UNIQUE INDEX IF NOT EXISTS idx_company_team_members_token
  ON public.company_team_members (invite_token)
  WHERE status = 'invited';

-- 4. Helper functions (SECURITY DEFINER: owned by table owner, bypasses RLS,
--    so they are safe to use inside other policies without recursion)
CREATE OR REPLACE FUNCTION public.is_company_member(company_id uuid, user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_team_members
    WHERE company_id = $1 AND user_id = $2 AND status = 'accepted'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_company_member_with_role(company_id uuid, user_id uuid, roles text[])
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_team_members
    WHERE company_id = $1 AND user_id = $2 AND status = 'accepted' AND role = ANY($3)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RPC called from the /accept-invite page. Links the authenticated user to
-- the pending membership row and flips it to accepted.
CREATE OR REPLACE FUNCTION public.accept_company_invite(p_token text)
RETURNS boolean AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_company uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT company_id INTO v_company
  FROM public.company_team_members
  WHERE invite_token = p_token AND status = 'invited';

  IF v_company IS NULL THEN
    RETURN false;
  END IF;

  -- Already an active member of this company? Reject the accept.
  IF EXISTS (
    SELECT 1 FROM public.company_team_members
    WHERE company_id = v_company AND user_id = v_uid AND status = 'accepted'
  ) THEN
    RETURN false;
  END IF;

  UPDATE public.company_team_members
  SET user_id = v_uid, status = 'accepted', accepted_at = now(), invite_token = NULL
  WHERE id IN (
    SELECT id FROM public.company_team_members
    WHERE invite_token = p_token AND status = 'invited'
  );

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS: companies — accepted members can read their own company
DROP POLICY IF EXISTS "Companies: read active" ON public.companies;
CREATE POLICY "Companies: read active" ON public.companies FOR SELECT
  USING (
    status = 'approved'
    OR auth.uid() = owner_id
    OR public.is_company_member(id, auth.uid())
    OR public.is_admin()
  );

-- 6. RLS: team management — owner, admin-role members, or platform admin
DROP POLICY IF EXISTS "Team: company owner manage" ON public.company_team_members;
CREATE POLICY "Team: owner or admin manage" ON public.company_team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    )
    OR public.is_company_member_with_role(company_id, auth.uid(), ARRAY['admin'])
    OR public.is_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    )
    OR public.is_company_member_with_role(company_id, auth.uid(), ARRAY['admin'])
    OR public.is_admin()
  );

-- 7. RLS: internships — members read own company's; only owner/admin/hr post
DROP POLICY IF EXISTS "Internships: read active" ON public.internships;
CREATE POLICY "Internships: read active" ON public.internships FOR SELECT
  USING (
    status = 'Active'
    OR EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    )
    OR public.is_company_member(company_id, auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Internships: company owner insert" ON public.internships;
CREATE POLICY "Internships: company owner or admin role insert" ON public.internships FOR INSERT
  WITH CHECK (
    public.is_company_verified(company_id)
    AND (
      EXISTS (
        SELECT 1 FROM public.companies c
        WHERE c.id = company_id AND c.owner_id = auth.uid()
      )
      OR public.is_company_member_with_role(company_id, auth.uid(), ARRAY['admin', 'hr'])
      OR public.is_admin()
    )
  );

DROP POLICY IF EXISTS "Internships: company owner or admin update" ON public.internships;
CREATE POLICY "Internships: company owner or admin role update" ON public.internships FOR UPDATE
  USING (
    public.is_company_verified(company_id)
    AND (
      EXISTS (
        SELECT 1 FROM public.companies c
        WHERE c.id = company_id AND c.owner_id = auth.uid()
      )
      OR public.is_company_member_with_role(company_id, auth.uid(), ARRAY['admin', 'hr'])
      OR public.is_admin()
    )
  );

-- 8. RLS: applications — owner/admin/hr/reviewer see & manage their company's
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

DROP POLICY IF EXISTS "Applications: student or company update" ON public.applications;
CREATE POLICY "Applications: student or company update" ON public.applications FOR UPDATE
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

-- 9. RLS: tasks — only members of the internship's own company create tasks;
--    reviewers (and the assigner) may review submissions
DROP POLICY IF EXISTS "Tasks: company or mentor insert" ON public.tasks;
CREATE POLICY "Tasks: company or mentor insert" ON public.tasks FOR INSERT
  WITH CHECK (
    auth.uid() = assigned_by
    AND (
      public.is_admin()
      OR public.is_company_member_with_role(
        (SELECT company_id FROM public.internships WHERE id = internship_id),
        auth.uid(),
        ARRAY['admin', 'mentor', 'reviewer']
      )
    )
  );

DROP POLICY IF EXISTS "Submissions: reviewer update" ON public.task_submissions;
CREATE POLICY "Submissions: reviewer update" ON public.task_submissions FOR UPDATE
  USING (
    (EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id AND t.assigned_by = auth.uid()
    ) AND public.is_user_verified_company_member(auth.uid()))
    OR public.is_company_member_with_role(
      (SELECT i.company_id FROM public.tasks t JOIN public.internships i ON i.id = t.internship_id WHERE t.id = task_id),
      auth.uid(),
      ARRAY['admin', 'reviewer']
    )
    OR public.is_admin()
  );

-- 10. RLS: certificates — owner/admin/hr see & issue
DROP POLICY IF EXISTS "Certificates: public read active" ON public.certificates;
CREATE POLICY "Certificates: public read active" ON public.certificates FOR SELECT
  USING (
    status = 'Active'
    OR auth.uid() = recipient_id
    OR EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    )
    OR public.is_company_member_with_role(company_id, auth.uid(), ARRAY['admin', 'hr'])
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Certificates: company or admin insert" ON public.certificates;
CREATE POLICY "Certificates: company or admin insert" ON public.certificates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    )
    OR public.is_company_member_with_role(company_id, auth.uid(), ARRAY['admin', 'hr'])
    OR public.is_admin()
  );

-- 11. RLS: offer letters — owner/admin/hr send & manage
DROP POLICY IF EXISTS "Offer letters: student reads own" ON public.offer_letters;
CREATE POLICY "Offer letters: student reads own" ON public.offer_letters FOR SELECT
  USING (
    auth.uid() = student_id
    OR (EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    ) AND public.is_company_verified(company_id))
    OR (public.is_company_member_with_role(company_id, auth.uid(), ARRAY['admin', 'hr'])
        AND public.is_company_verified(company_id))
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Offer letters: company inserts own" ON public.offer_letters;
CREATE POLICY "Offer letters: company inserts own" ON public.offer_letters FOR INSERT
  WITH CHECK (
    (
      EXISTS (
        SELECT 1 FROM public.companies c
        WHERE c.id = company_id AND c.owner_id = auth.uid()
      )
      OR public.is_company_member_with_role(company_id, auth.uid(), ARRAY['admin', 'hr'])
    )
    AND public.is_company_verified(company_id)
  );

DROP POLICY IF EXISTS "Offer letters: company or admin updates" ON public.offer_letters;
CREATE POLICY "Offer letters: company or admin updates" ON public.offer_letters FOR UPDATE
  USING (
    (
      (
        EXISTS (
          SELECT 1 FROM public.companies c
          WHERE c.id = company_id AND c.owner_id = auth.uid()
        )
        OR public.is_company_member_with_role(company_id, auth.uid(), ARRAY['admin', 'hr'])
      )
      AND public.is_company_verified(company_id)
    )
    OR auth.uid() = student_id
    OR public.is_admin()
  );

-- 12. Messaging: any accepted admin/hr/mentor member of the internship's
--     company may message students who applied to it
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(p_internship_id uuid, p_other_user_id uuid)
RETURNS uuid AS $$
DECLARE
  v_my_id uuid;
  v_existing_conv uuid;
  v_new_conv uuid;
  v_my_role text;
  v_other_role text;
  v_is_allowed boolean := false;
  v_company_id uuid;
BEGIN
  v_my_id := auth.uid();
  IF v_my_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF v_my_id = p_other_user_id THEN
    RAISE EXCEPTION 'Cannot message yourself';
  END IF;

  -- 6a. Check if conversation already exists
  SELECT cp1.conversation_id INTO v_existing_conv
  FROM public.conversation_participants cp1
  JOIN public.conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  JOIN public.conversations c ON c.id = cp1.conversation_id
  WHERE cp1.user_id = v_my_id
    AND cp2.user_id = p_other_user_id
    AND c.internship_id = p_internship_id
  LIMIT 1;

  IF v_existing_conv IS NOT NULL THEN
    RETURN v_existing_conv;
  END IF;

  -- 6b. Check permissions (ZYR0 rules)
  SELECT role INTO v_my_role FROM public.profiles WHERE id = v_my_id;
  SELECT role INTO v_other_role FROM public.profiles WHERE id = p_other_user_id;

  SELECT company_id INTO v_company_id FROM public.internships WHERE id = p_internship_id;

  -- Logic:
  -- Student <-> Company: Allowed if student applied to internship (and company is owner)
  -- Student <-> Mentor: Allowed if mentor is assigned to student for this internship (via evaluations or tasks)
  -- Company <-> Mentor: Allowed if company owns internship and mentor is part of company team
  
  IF (v_my_role = 'student' AND v_other_role = 'company') OR (v_my_role = 'company' AND v_other_role = 'student') THEN
    DECLARE
      v_student_id uuid := CASE WHEN v_my_role = 'student' THEN v_my_id ELSE p_other_user_id END;
      v_comp_owner uuid := CASE WHEN v_my_role = 'company' THEN v_my_id ELSE p_other_user_id END;
    BEGIN
      -- Check if student applied to this internship
      IF EXISTS (
        SELECT 1 FROM public.applications 
        WHERE student_id = v_student_id AND internship_id = p_internship_id
      ) THEN
        -- Check if company is owner
        IF EXISTS (
          SELECT 1 FROM public.companies WHERE id = v_company_id AND owner_id = v_comp_owner
        ) THEN
          v_is_allowed := true;
        END IF;
      END IF;
    END;
  
  ELSIF (v_my_role = 'student' AND v_other_role = 'mentor') OR (v_my_role = 'mentor' AND v_other_role = 'student') THEN
    DECLARE
      v_student_id uuid := CASE WHEN v_my_role = 'student' THEN v_my_id ELSE p_other_user_id END;
      v_mentor_id uuid := CASE WHEN v_my_role = 'mentor' THEN v_my_id ELSE p_other_user_id END;
    BEGIN
      -- Check if mentor is assigned to student (via evaluations or tasks)
      IF EXISTS (
        SELECT 1 FROM public.evaluations 
        WHERE intern_id = v_student_id AND mentor_id = v_mentor_id AND internship_id = p_internship_id
      ) OR EXISTS (
        SELECT 1 FROM public.tasks
        WHERE assigned_to = v_student_id AND assigned_by = v_mentor_id AND internship_id = p_internship_id
      ) THEN
        v_is_allowed := true;
      END IF;
    END;
    
  ELSIF (v_my_role = 'company' AND v_other_role = 'mentor') OR (v_my_role = 'mentor' AND v_other_role = 'company') THEN
    DECLARE
      v_comp_owner uuid := CASE WHEN v_my_role = 'company' THEN v_my_id ELSE p_other_user_id END;
      v_mentor_id uuid := CASE WHEN v_my_role = 'mentor' THEN v_my_id ELSE p_other_user_id END;
    BEGIN
      -- Check if company owns internship and mentor is on team
      IF EXISTS (
        SELECT 1 FROM public.companies WHERE id = v_company_id AND owner_id = v_comp_owner
      ) AND EXISTS (
        SELECT 1 FROM public.company_team_members WHERE company_id = v_company_id AND user_id = v_mentor_id AND status = 'accepted'
      ) THEN
        v_is_allowed := true;
      END IF;
    END;
  END IF;

  -- 12a. NEW: any accepted admin/hr/mentor team member may message a student
  --          who applied to one of the company's internships
  IF NOT v_is_allowed THEN
    DECLARE
      v_member_id uuid := v_my_id;
      v_student_id uuid := p_other_user_id;
    BEGIN
      IF v_my_role = 'student' THEN
        v_member_id := p_other_user_id;
        v_student_id := v_my_id;
      END IF;

      IF EXISTS (
        SELECT 1 FROM public.applications
        WHERE student_id = v_student_id AND internship_id = p_internship_id
      ) AND EXISTS (
        SELECT 1 FROM public.company_team_members
        WHERE company_id = v_company_id AND user_id = v_member_id AND status = 'accepted'
          AND role IN ('admin', 'hr', 'mentor')
      ) THEN
        v_is_allowed := true;
      END IF;
    END;
  END IF;

  IF NOT v_is_allowed THEN
    RAISE EXCEPTION 'Not authorized to message this user for this internship';
  END IF;

  -- 6c. Create new conversation
  INSERT INTO public.conversations (internship_id) VALUES (p_internship_id) RETURNING id INTO v_new_conv;
  
  -- Insert participants
  INSERT INTO public.conversation_participants (conversation_id, user_id) VALUES (v_new_conv, v_my_id);
  INSERT INTO public.conversation_participants (conversation_id, user_id) VALUES (v_new_conv, p_other_user_id);

  RETURN v_new_conv;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;