-- =============================================
-- Migration 048: Add settings column to profiles
-- =============================================
-- Stores per-user notification and display preferences as JSONB.
-- NULL means "use code defaults" — no migration needed for existing users.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT NULL;
