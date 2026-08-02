-- =============================================
-- Migration 027: Certificate period dates
-- =============================================

-- Internship period end date (start_date already exists).
-- The certificate body shows "from <start> to <end>", so the internship
-- needs a real end date in addition to the existing start_date.
ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS end_date date;

-- Snapshot the internship period onto the certificate at issue time so a
-- later internship edit never alters an already-issued certificate.
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS end_date date;

-- Backfill already-issued certificates from their internship's period.
UPDATE public.certificates c
SET start_date = i.start_date,
    end_date   = i.end_date
FROM public.internships i
WHERE c.internship_id = i.id
  AND c.start_date IS NULL
  AND c.end_date IS NULL;
