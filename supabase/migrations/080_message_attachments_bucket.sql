-- =============================================
-- Migration 080: message-attachments Storage Bucket
-- Chat attachments (screenshots, resumes, docs) sent inside a conversation.
-- =============================================
--
-- The bucket is PRIVATE: resumes and documents must not be publicly readable.
-- Clients read files through short-lived signed URLs (storage.from(...).createSignedUrls).
--
-- Path convention: {conversation_id}/{uuid}-{filename}
-- Access is granted only to the participants of that conversation, derived from
-- the first path folder. The uuid regex guard keeps the ::uuid cast in the
-- policy from erroring on unexpected names.

INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  false,
  false,
  10485760, -- 10 MB
  ARRAY[
    'image/png', 'image/jpeg', 'image/webp', 'image/gif',
    'application/pdf', 'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS Policies ────────────────────────────────────────────────────

DROP POLICY IF EXISTS "message-attachments: participants read" ON storage.objects;
CREATE POLICY "message-attachments: participants read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'message-attachments'
    AND storage.foldername(name)[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND EXISTS (
      SELECT 1
      FROM public.conversation_participants cp
      WHERE cp.conversation_id = (storage.foldername(name))[1]::uuid
        AND cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "message-attachments: participants upload" ON storage.objects;
CREATE POLICY "message-attachments: participants upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'message-attachments'
    AND auth.role() = 'authenticated'
    AND auth.uid() = owner_id
    AND storage.foldername(name)[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND EXISTS (
      SELECT 1
      FROM public.conversation_participants cp
      WHERE cp.conversation_id = (storage.foldername(name))[1]::uuid
        AND cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "message-attachments: owner update" ON storage.objects;
CREATE POLICY "message-attachments: owner update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'message-attachments'
    AND auth.uid() = owner_id
  );

DROP POLICY IF EXISTS "message-attachments: owner delete" ON storage.objects;
CREATE POLICY "message-attachments: owner delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'message-attachments'
    AND auth.uid() = owner_id
  );
