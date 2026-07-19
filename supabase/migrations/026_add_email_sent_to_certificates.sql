-- =============================================
-- Migration 026: Add email_sent to Certificates
-- =============================================

ALTER TABLE public.certificates 
ADD COLUMN IF NOT EXISTS email_sent boolean NOT NULL DEFAULT false;
