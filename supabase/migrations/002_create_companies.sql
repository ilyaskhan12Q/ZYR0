-- =============================================
-- Migration 002: Companies table
-- =============================================

CREATE TABLE IF NOT EXISTS public.companies (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  logo_url        text,
  cover_gradient  text DEFAULT 'linear-gradient(135deg, #1E3A5F, #3B82F6)',
  industry        text,
  size            text,
  website         text,
  description     text,
  location        text,
  founded         text,
  email           text,
  phone           text,
  social_links    jsonb NOT NULL DEFAULT '{}',
  status          text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Active', 'Pending', 'Suspended')),
  rating          numeric(3,2) NOT NULL DEFAULT 0,
  review_count    int NOT NULL DEFAULT 0,
  owner_id        uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Team members as a separate table (referenced from company)
CREATE TABLE IF NOT EXISTS public.company_team_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name        text NOT NULL,
  role        text NOT NULL,
  avatar_url  text,
  email       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Add the deferred FK from profiles → companies
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_company
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_team_members ENABLE ROW LEVEL SECURITY;
