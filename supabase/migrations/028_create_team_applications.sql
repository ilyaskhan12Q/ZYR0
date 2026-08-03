-- =============================================
-- Migration 028: Create Team Applications
-- Founding development team recruitment.
-- Public can submit; admins manage + email.
-- =============================================

CREATE TABLE IF NOT EXISTS public.team_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  university text NOT NULL,
  degree_program text NOT NULL,
  academic_year text NOT NULL,
  github text NOT NULL DEFAULT '',
  linkedin text,
  portfolio text,
  resume_url text,
  resume_filename text,
  resume_size integer,
  preferred_role text NOT NULL,
  secondary_role text,
  skills text[] NOT NULL DEFAULT '{}',
  projects text,
  availability text NOT NULL,
  motivation text NOT NULL,
  status text NOT NULL DEFAULT 'New'
    CHECK (status IN ('New', 'Under Review', 'Shortlisted', 'Contacted', 'Rejected')),
  email_sent boolean NOT NULL DEFAULT false,
  email_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.team_applications ENABLE ROW LEVEL SECURITY;

-- Anyone on the public careers page can submit an application
CREATE POLICY "team_applications: public insert"
  ON public.team_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Read/manage only by admins
CREATE POLICY "team_applications: admin select"
  ON public.team_applications
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "team_applications: admin update"
  ON public.team_applications
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "team_applications: admin delete"
  ON public.team_applications
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ── Updated-at trigger ──────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS handle_team_applications_updated_at ON public.team_applications;
CREATE TRIGGER handle_team_applications_updated_at
  BEFORE UPDATE ON public.team_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── Storage bucket for resumes ──────────────────────────────────────────────
-- Separate from the auth-gated `resumes` bucket so anonymous candidates
-- (public careers page) can upload without signing in.

INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'team-resumes',
  'team-resumes',
  true,
  false,
  5242880,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "team-resumes: public read" ON storage.objects;
CREATE POLICY "team-resumes: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'team-resumes');

DROP POLICY IF EXISTS "team-resumes: anon upload" ON storage.objects;
CREATE POLICY "team-resumes: anon upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'team-resumes'
    AND name LIKE 'team-resumes/%'
  );

DROP POLICY IF EXISTS "team-resumes: anon update" ON storage.objects;
CREATE POLICY "team-resumes: anon update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'team-resumes'
    AND name LIKE 'team-resumes/%'
  );

DROP POLICY IF EXISTS "team-resumes: anon delete" ON storage.objects;
CREATE POLICY "team-resumes: anon delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'team-resumes'
    AND name LIKE 'team-resumes/%'
  );