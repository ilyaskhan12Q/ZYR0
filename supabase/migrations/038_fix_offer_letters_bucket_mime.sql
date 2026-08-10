-- =============================================
-- Migration 038: Fix offer-letters bucket MIME types
-- The bucket was created with allowed_mime_types = ['image/png']
-- (copy-paste from the avatars bucket), which rejects PDF uploads
-- with 400 "mime type application/pdf is not supported".
-- =============================================

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['application/pdf']::text[]
WHERE id = 'offer-letters'
  AND NOT (allowed_mime_types @> ARRAY['application/pdf']::text[]);