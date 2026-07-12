-- =============================================
-- Migration 019: Retarget FK constraints from auth.users → profiles
--
-- WHY: PostgREST embeds like "student:profiles!student_id" require a
--      DIRECT FK from the source table to the profiles table.
--      Previously all FKs pointed to auth.users(id), so PostgREST
--      returned HTTP 400 — it could not resolve the transitive join
--      through auth.users (which lives in a separate schema).
--
-- SAFETY: profiles.id itself has FK profiles_id_fkey → auth.users(id)
--         ON DELETE CASCADE, so the referential chain is maintained:
--           source.row → profiles.id → auth.users.id
-- =============================================

DO $$ BEGIN
  -- 1. applications.student_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'applications_student_id_fkey') THEN
    ALTER TABLE public.applications DROP CONSTRAINT applications_student_id_fkey;
  END IF;
  ALTER TABLE public.applications
    ADD CONSTRAINT applications_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;

DO $$ BEGIN
  -- 2. tasks.assigned_to
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tasks_assigned_to_fkey') THEN
    ALTER TABLE public.tasks DROP CONSTRAINT tasks_assigned_to_fkey;
  END IF;
  ALTER TABLE public.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey
    FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;

DO $$ BEGIN
  -- 3. tasks.assigned_by
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tasks_assigned_by_fkey') THEN
    ALTER TABLE public.tasks DROP CONSTRAINT tasks_assigned_by_fkey;
  END IF;
  ALTER TABLE public.tasks
    ADD CONSTRAINT tasks_assigned_by_fkey
    FOREIGN KEY (assigned_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;

DO $$ BEGIN
  -- 4. task_submissions.student_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'task_submissions_student_id_fkey') THEN
    ALTER TABLE public.task_submissions DROP CONSTRAINT task_submissions_student_id_fkey;
  END IF;
  ALTER TABLE public.task_submissions
    ADD CONSTRAINT task_submissions_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;

DO $$ BEGIN
  -- 5. messages.sender_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'messages_sender_id_fkey') THEN
    ALTER TABLE public.messages DROP CONSTRAINT messages_sender_id_fkey;
  END IF;
  ALTER TABLE public.messages
    ADD CONSTRAINT messages_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;

DO $$ BEGIN
  -- 6. conversation_participants.user_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'conversation_participants_user_id_fkey') THEN
    ALTER TABLE public.conversation_participants DROP CONSTRAINT conversation_participants_user_id_fkey;
  END IF;
  ALTER TABLE public.conversation_participants
    ADD CONSTRAINT conversation_participants_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;

DO $$ BEGIN
  -- 7. activity_logs.user_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'activity_logs_user_id_fkey') THEN
    ALTER TABLE public.activity_logs DROP CONSTRAINT activity_logs_user_id_fkey;
  END IF;
  ALTER TABLE public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
END $$;

DO $$ BEGIN
  -- 8. evaluations.intern_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'evaluations_intern_id_fkey') THEN
    ALTER TABLE public.evaluations DROP CONSTRAINT evaluations_intern_id_fkey;
  END IF;
  ALTER TABLE public.evaluations
    ADD CONSTRAINT evaluations_intern_id_fkey
    FOREIGN KEY (intern_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;

DO $$ BEGIN
  -- 9. evaluations.mentor_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'evaluations_mentor_id_fkey') THEN
    ALTER TABLE public.evaluations DROP CONSTRAINT evaluations_mentor_id_fkey;
  END IF;
  ALTER TABLE public.evaluations
    ADD CONSTRAINT evaluations_mentor_id_fkey
    FOREIGN KEY (mentor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;

DO $$ BEGIN
  -- 10. offer_letters.student_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'offer_letters_student_id_fkey') THEN
    ALTER TABLE public.offer_letters DROP CONSTRAINT offer_letters_student_id_fkey;
  END IF;
  ALTER TABLE public.offer_letters
    ADD CONSTRAINT offer_letters_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;

DO $$ BEGIN
  -- 11. certificates.recipient_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'certificates_recipient_id_fkey') THEN
    ALTER TABLE public.certificates DROP CONSTRAINT certificates_recipient_id_fkey;
  END IF;
  ALTER TABLE public.certificates
    ADD CONSTRAINT certificates_recipient_id_fkey
    FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;

DO $$ BEGIN
  -- 12. certificates.issued_by
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'certificates_issued_by_fkey') THEN
    ALTER TABLE public.certificates DROP CONSTRAINT certificates_issued_by_fkey;
  END IF;
  ALTER TABLE public.certificates
    ADD CONSTRAINT certificates_issued_by_fkey
    FOREIGN KEY (issued_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
END $$;

DO $$ BEGIN
  -- 13. workspace_events.student_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'workspace_events_student_id_fkey') THEN
    ALTER TABLE public.workspace_events DROP CONSTRAINT workspace_events_student_id_fkey;
  END IF;
  ALTER TABLE public.workspace_events
    ADD CONSTRAINT workspace_events_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;

DO $$ BEGIN
  -- 14. workspace_events.actor_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'workspace_events_actor_id_fkey') THEN
    ALTER TABLE public.workspace_events DROP CONSTRAINT workspace_events_actor_id_fkey;
  END IF;
  ALTER TABLE public.workspace_events
    ADD CONSTRAINT workspace_events_actor_id_fkey
    FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
END $$;

DO $$ BEGIN
  -- 15. companies.owner_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'companies_owner_id_fkey') THEN
    ALTER TABLE public.companies DROP CONSTRAINT companies_owner_id_fkey;
  END IF;
  ALTER TABLE public.companies
    ADD CONSTRAINT companies_owner_id_fkey
    FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
END $$;

DO $$ BEGIN
  -- 16. company_team_members.user_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'company_team_members_user_id_fkey') THEN
    ALTER TABLE public.company_team_members DROP CONSTRAINT company_team_members_user_id_fkey;
  END IF;
  ALTER TABLE public.company_team_members
    ADD CONSTRAINT company_team_members_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
END $$;

DO $$ BEGIN
  -- 17. internships.created_by
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'internships_created_by_fkey') THEN
    ALTER TABLE public.internships DROP CONSTRAINT internships_created_by_fkey;
  END IF;
  ALTER TABLE public.internships
    ADD CONSTRAINT internships_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
END $$;

DO $$ BEGIN
  -- 18. notifications.user_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'notifications_user_id_fkey') THEN
    ALTER TABLE public.notifications DROP CONSTRAINT notifications_user_id_fkey;
  END IF;
  ALTER TABLE public.notifications
    ADD CONSTRAINT notifications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;
