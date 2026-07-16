-- =============================================
-- Migration 024: Messaging Internships & Fix RLS
-- =============================================

-- 1. Add internship_id to conversations
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS internship_id uuid REFERENCES public.internships(id) ON DELETE CASCADE;

-- 2. Create helper to get user's conversations securely (bypasses RLS to avoid infinite recursion)
CREATE OR REPLACE FUNCTION public.get_my_conversations()
RETURNS SETOF uuid AS $$
BEGIN
  RETURN QUERY
  SELECT conversation_id
  FROM public.conversation_participants
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. Drop existing recursive or overly broad policies
DROP POLICY IF EXISTS "Conversations: participants only" ON public.conversations;
DROP POLICY IF EXISTS "Conversations: insert by auth" ON public.conversations;

DROP POLICY IF EXISTS "Conv participants: own" ON public.conversation_participants;
DROP POLICY IF EXISTS "Conv participants: insert" ON public.conversation_participants;

DROP POLICY IF EXISTS "Messages: participants only" ON public.messages;
DROP POLICY IF EXISTS "Messages: participant insert" ON public.messages;

-- 4. Recreate SELECT policies using the secure helper (No recursion!)
CREATE POLICY "Conversations: participants only"
  ON public.conversations FOR SELECT
  USING (id IN (SELECT public.get_my_conversations()));

CREATE POLICY "Conv participants: own"
  ON public.conversation_participants FOR SELECT
  USING (conversation_id IN (SELECT public.get_my_conversations()));

CREATE POLICY "Messages: participants only"
  ON public.messages FOR SELECT
  USING (conversation_id IN (SELECT public.get_my_conversations()));

-- 5. Recreate INSERT policies for messages
CREATE POLICY "Messages: participant insert"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND conversation_id IN (SELECT public.get_my_conversations())
  );

-- Note: We intentionally do NOT recreate INSERT policies for conversations and conversation_participants.
-- They will be managed entirely by the SECURITY DEFINER function below to enforce ZYR0 workflow rules.

-- 6. Create get_or_create_conversation RPC
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
        SELECT 1 FROM public.company_team_members WHERE company_id = v_company_id AND user_id = v_mentor_id
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
