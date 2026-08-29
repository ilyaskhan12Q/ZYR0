-- =============================================
-- Migration 044: Research pipeline — structured report payload
--
-- Extends agent_researches so completed deep-research runs persist the
-- full structured report (contracts, citation ledger, model, timings) for
-- the history panel and future PDF export (Phase 3).
-- =============================================

ALTER TABLE public.agent_researches
  ADD COLUMN IF NOT EXISTS report_data jsonb;

-- Reports: user+assistant message pair per run
CREATE INDEX IF NOT EXISTS idx_agent_researches_mode
  ON public.agent_researches (user_id, mode, created_at DESC);