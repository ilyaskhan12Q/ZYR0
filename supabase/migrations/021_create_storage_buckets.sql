-- =============================================
-- Migration 021: Create Storage Buckets
-- Creates required storage buckets and RLS policies
-- for offer-letters, company-assets, avatars, resumes
-- =============================================

-- ── Create buckets ──────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'offer-letters',
  'offer-letters',
  true,
  false,
  52428800,
  ARRAY['image/png']::text[]
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'company-assets',
  'company-assets',
  true,
  false,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']::text[]
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  false,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  true,
  false,
  10485760,
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS Policies ────────────────────────────────────────────────────

DROP POLICY IF EXISTS "offer-letters: public read" ON storage.objects;
CREATE POLICY "offer-letters: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'offer-letters');

DROP POLICY IF EXISTS "offer-letters: authenticated upload" ON storage.objects;
CREATE POLICY "offer-letters: authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'offer-letters'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "offer-letters: authenticated update" ON storage.objects;
CREATE POLICY "offer-letters: authenticated update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'offer-letters'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "offer-letters: authenticated delete" ON storage.objects;
CREATE POLICY "offer-letters: authenticated delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'offer-letters'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "company-assets: public read" ON storage.objects;
CREATE POLICY "company-assets: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-assets');

DROP POLICY IF EXISTS "company-assets: authenticated upload" ON storage.objects;
CREATE POLICY "company-assets: authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'company-assets'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "company-assets: authenticated update" ON storage.objects;
CREATE POLICY "company-assets: authenticated update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'company-assets'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "company-assets: authenticated delete" ON storage.objects;
CREATE POLICY "company-assets: authenticated delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'company-assets'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "avatars: public read" ON storage.objects;
CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars: authenticated upload" ON storage.objects;
CREATE POLICY "avatars: authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "avatars: authenticated update" ON storage.objects;
CREATE POLICY "avatars: authenticated update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "avatars: authenticated delete" ON storage.objects;
CREATE POLICY "avatars: authenticated delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "resumes: public read" ON storage.objects;
CREATE POLICY "resumes: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes');

DROP POLICY IF EXISTS "resumes: authenticated upload" ON storage.objects;
CREATE POLICY "resumes: authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "resumes: authenticated update" ON storage.objects;
CREATE POLICY "resumes: authenticated update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "resumes: authenticated delete" ON storage.objects;
CREATE POLICY "resumes: authenticated delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
  );
