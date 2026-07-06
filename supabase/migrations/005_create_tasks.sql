-- =============================================
-- Migration 005: Tasks & Task Submissions
-- =============================================

CREATE TABLE IF NOT EXISTS public.tasks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id uuid REFERENCES public.internships(id) ON DELETE SET NULL,
  title         text NOT NULL,
  description   text,
  assigned_to   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  due_date      date,
  status        text NOT NULL DEFAULT 'Pending'
                CHECK (status IN ('Pending', 'Submitted', 'Under Review', 'Approved', 'Rejected')),
  priority      text NOT NULL DEFAULT 'Medium'
                CHECK (priority IN ('High', 'Medium', 'Low')),
  attachments   jsonb NOT NULL DEFAULT '[]',
  feedback      text,
  grade         int CHECK (grade >= 0 AND grade <= 100),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.task_submissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  student_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes       text,
  attachments jsonb NOT NULL DEFAULT '[]',
  status      text NOT NULL DEFAULT 'Submitted'
              CHECK (status IN ('Submitted', 'Under Review', 'Approved', 'Rejected')),
  feedback    text,
  grade       int CHECK (grade >= 0 AND grade <= 100),
  submitted_at timestamptz NOT NULL DEFAULT now()
);

-- Update task status to 'Submitted' when submission is created
CREATE OR REPLACE FUNCTION public.handle_task_submission_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tasks
  SET status = 'Submitted', updated_at = now()
  WHERE id = NEW.task_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_task_submitted
  AFTER INSERT ON public.task_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_task_submission_insert();

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
