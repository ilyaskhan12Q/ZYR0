-- =============================================
-- Migration 029: Add phone & gender to team applications
-- Additive to 028 in case it already ran
-- =============================================

ALTER TABLE public.team_applications
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS gender text;
