-- =============================================
-- Migration 006: Certificates
-- =============================================

CREATE TABLE IF NOT EXISTS public.certificates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  recipient_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id      uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  internship_id   uuid REFERENCES public.internships(id) ON DELETE SET NULL,
  issue_date      date NOT NULL DEFAULT CURRENT_DATE,
  credential_id   text UNIQUE NOT NULL,
  skills          text[] DEFAULT '{}',
  description     text,
  blockchain_hash text,
  status          text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Revoked')),
  issued_by       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Unique index on credential_id for fast public lookups
CREATE INDEX IF NOT EXISTS idx_certificates_credential_id
  ON public.certificates (credential_id);

-- Index for recipient lookups
CREATE INDEX IF NOT EXISTS idx_certificates_recipient
  ON public.certificates (recipient_id);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
