-- =============================================
-- Migration 009: Evaluations
-- =============================================

CREATE TABLE IF NOT EXISTS public.evaluations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  internship_id         uuid REFERENCES public.internships(id) ON DELETE SET NULL,
  period                text,
  skills_assessment     jsonb NOT NULL DEFAULT '[]',
  overall_rating        numeric(3,2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
  strengths             text,
  improvements          text,
  goals_achieved        text,
  recommend_certificate boolean NOT NULL DEFAULT false,
  would_rehire          boolean NOT NULL DEFAULT false,
  additional_comments   text,
  status                text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted')),
  submitted_at          timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Only one evaluation per intern per internship per period
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_evaluation
  ON public.evaluations (mentor_id, intern_id, internship_id, period);

CREATE TRIGGER evaluations_updated_at
  BEFORE UPDATE ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
