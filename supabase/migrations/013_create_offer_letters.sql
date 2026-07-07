-- =============================================
-- Migration 013: Offer Letters
-- Tracks offer letters generated when a company
-- accepts a student's internship application.
-- =============================================

CREATE TABLE IF NOT EXISTS public.offer_letters (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id   uuid NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  application_id  uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  student_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id      uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'Pending'
                  CHECK (status IN ('Pending', 'Sent', 'Accepted', 'Rejected', 'Revoked', 'Expired')),
  pdf_url         text,
  issued_at       timestamptz,
  expires_at      timestamptz,
  accepted_at     timestamptz,
  rejected_at     timestamptz,
  revoked_at      timestamptz,
  revoke_reason   text,
  email_sent      boolean NOT NULL DEFAULT false,
  email_sent_at   timestamptz,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  -- Prevent duplicate offer letters for the same application
  CONSTRAINT unique_offer_per_application UNIQUE (application_id)
);

-- ── Triggers ─────────────────────────────────────────────────────────────────

CREATE TRIGGER offer_letters_updated_at
  BEFORE UPDATE ON public.offer_letters
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── Indexes ───────────────────────────────────────────────────────────────────

-- Fast lookup by student (student dashboard)
CREATE INDEX IF NOT EXISTS idx_offer_letters_student
  ON public.offer_letters (student_id);

-- Fast lookup by company (company dashboard)
CREATE INDEX IF NOT EXISTS idx_offer_letters_company
  ON public.offer_letters (company_id);

-- Fast lookup by application (duplicate check)
CREATE INDEX IF NOT EXISTS idx_offer_letters_application
  ON public.offer_letters (application_id);

-- Fast lookup by status (admin / company filters)
CREATE INDEX IF NOT EXISTS idx_offer_letters_status
  ON public.offer_letters (status);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.offer_letters ENABLE ROW LEVEL SECURITY;

-- Students: can only read their own offer letters
CREATE POLICY "Offer letters: student reads own"
  ON public.offer_letters FOR SELECT
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    )
    OR public.is_admin()
  );

-- Company: can insert offer letters for their own internships
CREATE POLICY "Offer letters: company inserts own"
  ON public.offer_letters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    )
  );

-- Company or admin: can update (send, revoke, resend email)
CREATE POLICY "Offer letters: company or admin updates"
  ON public.offer_letters FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.owner_id = auth.uid()
    )
    OR auth.uid() = student_id  -- student can accept/reject
    OR public.is_admin()
  );

-- Admin only: hard delete
CREATE POLICY "Offer letters: admin deletes"
  ON public.offer_letters FOR DELETE
  USING (public.is_admin());

-- Enable realtime for live status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.offer_letters;
