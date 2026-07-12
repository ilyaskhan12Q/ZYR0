-- =============================================
-- Migration 003: Internships table
-- =============================================

CREATE TABLE IF NOT EXISTS public.internships (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title            text NOT NULL,
  description      text,
  responsibilities text[] DEFAULT '{}',
  requirements     text[] DEFAULT '{}',
  skills           text[] DEFAULT '{}',
  domain           text,
  location         text,
  location_type    text CHECK (location_type IN ('Remote', 'On-site', 'Hybrid')),
  type             text CHECK (type IN ('Full-time', 'Part-time', 'Project-based')),
  duration         text,
  start_date       date,
  deadline         date,
  stipend          text,
  stipend_type     text CHECK (stipend_type IN ('Paid', 'Unpaid', 'Academic Credit')),
  benefits         text[] DEFAULT '{}',
  status           text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Active', 'Closed', 'Draft')),
  education_level  text,
  experience_level text CHECK (experience_level IN ('Beginner', 'Intermediate', 'Advanced')),
  openings         int NOT NULL DEFAULT 1,
  applicant_count  int NOT NULL DEFAULT 0,
  view_count       int NOT NULL DEFAULT 0,
  posted_date      timestamptz NOT NULL DEFAULT now(),
  created_by       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Increment view count safely
CREATE OR REPLACE FUNCTION public.increment_internship_view(internship_id uuid)
RETURNS void AS $$
  UPDATE public.internships
  SET view_count = view_count + 1
  WHERE id = internship_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE TRIGGER internships_updated_at
  BEFORE UPDATE ON public.internships
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
