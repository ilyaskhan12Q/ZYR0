-- =============================================
-- Migration 045: Create task-documents Storage Bucket
-- Stores task brief PDFs (company -> student) and submission files (student -> company)
-- =============================================

INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'task-documents',
  'task-documents',
  true,
  false,
  26214400,
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS Policies ────────────────────────────────────────────────────

DROP POLICY IF EXISTS "task-documents: public read" ON storage.objects;
CREATE POLICY "task-documents: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'task-documents');

DROP POLICY IF EXISTS "task-documents: authenticated upload" ON storage.objects;
CREATE POLICY "task-documents: authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'task-documents'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "task-documents: authenticated update" ON storage.objects;
CREATE POLICY "task-documents: authenticated update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'task-documents'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "task-documents: authenticated delete" ON storage.objects;
CREATE POLICY "task-documents: authenticated delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'task-documents'
    AND auth.role() = 'authenticated'
  );
