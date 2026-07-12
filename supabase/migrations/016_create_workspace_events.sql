-- =============================================
-- Migration 016: Workspace Events
-- Creates public.workspace_events and triggers to
-- automatically audit and update workspace timeline milestones.
-- =============================================

CREATE TABLE IF NOT EXISTS public.workspace_events (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id  uuid NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  student_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type     text NOT NULL CHECK (event_type IN ('offer_accepted', 'task_assigned', 'task_submitted', 'task_approved', 'task_rejected', 'certificate_issued')),
  title          text NOT NULL,
  description    text,
  metadata       jsonb NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspace_events_internship_student
  ON public.workspace_events (internship_id, student_id);

CREATE INDEX IF NOT EXISTS idx_workspace_events_created_at
  ON public.workspace_events (created_at DESC);

-- RLS Enablement
ALTER TABLE public.workspace_events ENABLE ROW LEVEL SECURITY;

-- Select Policies
CREATE POLICY "Workspace events: select permitted users"
  ON public.workspace_events FOR SELECT
  USING (
    auth.uid() = student_id
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.internships i
      JOIN public.companies c ON c.id = i.company_id
      WHERE i.id = internship_id AND c.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.internships i
      JOIN public.company_team_members ctm ON ctm.company_id = i.company_id
      WHERE i.id = internship_id AND ctm.user_id = auth.uid()
    )
  );

-- Insert/Update/Delete is restricted to only triggers (service role), prevent manual tampering from API
CREATE POLICY "Workspace events: triggers only write"
  ON public.workspace_events FOR ALL
  USING (false)
  WITH CHECK (false);

-- ── Trigger Functions ────────────────────────────────────────────────────────

-- 1. Offer Accepted Trigger
CREATE OR REPLACE FUNCTION public.handle_offer_letter_workspace_event()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Accepted' AND (OLD.status IS NULL OR OLD.status <> 'Accepted') THEN
    INSERT INTO public.workspace_events (internship_id, student_id, actor_id, event_type, title, description, metadata, created_at)
    VALUES (
      NEW.internship_id,
      NEW.student_id,
      NEW.student_id,
      'offer_accepted',
      'Internship Initiated',
      'Offer Letter accepted by student.',
      jsonb_build_object('offer_letter_id', NEW.id, 'accepted_at', NEW.accepted_at),
      COALESCE(NEW.accepted_at, now())
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_offer_letter_accepted
  AFTER UPDATE ON public.offer_letters
  FOR EACH ROW EXECUTE FUNCTION public.handle_offer_letter_workspace_event();


-- 2. Task Assigned Trigger
CREATE OR REPLACE FUNCTION public.handle_task_workspace_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.workspace_events (internship_id, student_id, actor_id, event_type, title, description, metadata, created_at)
  VALUES (
    NEW.internship_id,
    NEW.assigned_to,
    NEW.assigned_by,
    'task_assigned',
    'Task Assigned: ' || NEW.title,
    COALESCE(NEW.description, 'A new task has been assigned.'),
    jsonb_build_object('task_id', NEW.id, 'priority', NEW.priority, 'due_date', NEW.due_date),
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_task_assigned
  AFTER INSERT ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_task_workspace_event();


-- 3. Task Submitted Trigger
CREATE OR REPLACE FUNCTION public.handle_task_submission_insert_workspace_event()
RETURNS TRIGGER AS $$
DECLARE
  t_title text;
  t_internship_id uuid;
BEGIN
  SELECT title, internship_id INTO t_title, t_internship_id
  FROM public.tasks WHERE id = NEW.task_id;

  INSERT INTO public.workspace_events (internship_id, student_id, actor_id, event_type, title, description, metadata, created_at)
  VALUES (
    t_internship_id,
    NEW.student_id,
    NEW.student_id,
    'task_submitted',
    'Task Submitted: ' || t_title,
    NEW.notes,
    jsonb_build_object('task_id', NEW.task_id, 'submission_id', NEW.id, 'github_url', NEW.github_url),
    NEW.submitted_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_task_submitted_event
  AFTER INSERT ON public.task_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_task_submission_insert_workspace_event();


-- 4. Task Reviewed Trigger
CREATE OR REPLACE FUNCTION public.handle_task_submission_update_workspace_event()
RETURNS TRIGGER AS $$
DECLARE
  t_title text;
  t_internship_id uuid;
  t_assigned_by uuid;
BEGIN
  IF NEW.status <> OLD.status AND NEW.status IN ('Approved', 'Rejected') THEN
    SELECT title, internship_id, assigned_by INTO t_title, t_internship_id, t_assigned_by
    FROM public.tasks WHERE id = NEW.task_id;

    INSERT INTO public.workspace_events (internship_id, student_id, actor_id, event_type, title, description, metadata)
    VALUES (
      t_internship_id,
      NEW.student_id,
      t_assigned_by,
      CASE WHEN NEW.status = 'Approved' THEN 'task_approved' ELSE 'task_rejected' END,
      'Task ' || NEW.status || ': ' || t_title,
      NEW.feedback,
      jsonb_build_object(
        'task_id', NEW.task_id,
        'submission_id', NEW.id,
        'status', NEW.status,
        'grade', NEW.grade
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_task_reviewed_event
  AFTER UPDATE ON public.task_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_task_submission_update_workspace_event();


-- 5. Certificate Issued Trigger
CREATE OR REPLACE FUNCTION public.handle_certificate_workspace_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.workspace_events (internship_id, student_id, actor_id, event_type, title, description, metadata, created_at)
  VALUES (
    NEW.internship_id,
    NEW.recipient_id,
    NEW.issued_by,
    'certificate_issued',
    'Certificate Issued',
    'Official credential has been generated and verified.',
    jsonb_build_object('certificate_id', NEW.id, 'credential_id', NEW.credential_id),
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_certificate_issued
  AFTER INSERT ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.handle_certificate_workspace_event();

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_events;

-- ── Historical Backfill ──────────────────────────────────────────────────────

-- 1. Backfill Accepted Offer Letters
INSERT INTO public.workspace_events (internship_id, student_id, actor_id, event_type, title, description, metadata, created_at)
SELECT
  internship_id,
  student_id,
  student_id,
  'offer_accepted',
  'Internship Initiated',
  'Offer Letter accepted by student.',
  jsonb_build_object('offer_letter_id', id, 'accepted_at', accepted_at),
  COALESCE(accepted_at, created_at)
FROM public.offer_letters
WHERE status = 'Accepted'
ON CONFLICT DO NOTHING;

-- 2. Backfill Assigned Tasks
INSERT INTO public.workspace_events (internship_id, student_id, actor_id, event_type, title, description, metadata, created_at)
SELECT
  internship_id,
  assigned_to,
  assigned_by,
  'task_assigned',
  'Task Assigned: ' || title,
  COALESCE(description, 'A new task has been assigned.'),
  jsonb_build_object('task_id', id, 'priority', priority, 'due_date', due_date),
  created_at
FROM public.tasks
ON CONFLICT DO NOTHING;

-- 3. Backfill Task Submissions
INSERT INTO public.workspace_events (internship_id, student_id, actor_id, event_type, title, description, metadata, created_at)
SELECT
  t.internship_id,
  ts.student_id,
  ts.student_id,
  'task_submitted',
  'Task Submitted: ' || t.title,
  ts.notes,
  jsonb_build_object('task_id', ts.task_id, 'submission_id', ts.id, 'github_url', ts.github_url),
  ts.submitted_at
FROM public.task_submissions ts
JOIN public.tasks t ON t.id = ts.task_id
ON CONFLICT DO NOTHING;

-- 4. Backfill Task Reviews
INSERT INTO public.workspace_events (internship_id, student_id, actor_id, event_type, title, description, metadata, created_at)
SELECT
  t.internship_id,
  ts.student_id,
  t.assigned_by,
  CASE WHEN ts.status = 'Approved' THEN 'task_approved' ELSE 'task_rejected' END,
  'Task ' || ts.status || ': ' || t.title,
  ts.feedback,
  jsonb_build_object('task_id', ts.task_id, 'submission_id', ts.id, 'status', ts.status, 'grade', ts.grade),
  ts.submitted_at + interval '1 minute'
FROM public.task_submissions ts
JOIN public.tasks t ON t.id = ts.task_id
WHERE ts.status IN ('Approved', 'Rejected')
ON CONFLICT DO NOTHING;

-- 5. Backfill Certificates
INSERT INTO public.workspace_events (internship_id, student_id, actor_id, event_type, title, description, metadata, created_at)
SELECT
  internship_id,
  recipient_id,
  issued_by,
  'certificate_issued',
  'Certificate Issued',
  'Official credential has been generated and verified.',
  jsonb_build_object('certificate_id', id, 'credential_id', credential_id),
  created_at
FROM public.certificates
ON CONFLICT DO NOTHING;
