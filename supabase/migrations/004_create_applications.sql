-- =============================================
-- Migration 004: Applications table
-- =============================================

CREATE TABLE IF NOT EXISTS public.applications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id uuid NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  student_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'Applied'
                CHECK (status IN ('Applied', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected', 'Withdrawn')),
  cover_letter  text,
  resume_url    text,
  answers       jsonb NOT NULL DEFAULT '{}',
  applied_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT unique_application UNIQUE (internship_id, student_id)
);

-- Auto-increment applicant_count on internship
CREATE OR REPLACE FUNCTION public.handle_application_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.internships
  SET applicant_count = applicant_count + 1
  WHERE id = NEW.internship_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_application_created
  AFTER INSERT ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_application_insert();

-- Auto-decrement on withdrawal/delete
CREATE OR REPLACE FUNCTION public.handle_application_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.internships
  SET applicant_count = GREATEST(0, applicant_count - 1)
  WHERE id = OLD.internship_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_application_deleted
  AFTER DELETE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_application_delete();

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
