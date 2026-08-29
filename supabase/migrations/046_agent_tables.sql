-- =============================================
-- Migration 043: Research Agent — sessions, messages & usage ledger
--
-- Backs the /research-agent workspace (Phase 1: gateway chat). Every row
-- is scoped to auth.uid() via RLS — users see exactly their own research.
-- agent_usage is the per-user meter that the ai-gateway edge function
-- writes to and rate-limits against (20 requests/min).
-- =============================================

-- 1. Research sessions
CREATE TABLE IF NOT EXISTS public.agent_researches (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt     text NOT NULL,
  mode       text NOT NULL DEFAULT 'chat',
  depth      text,
  status     text NOT NULL DEFAULT 'active',
  report_md  text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_researches
  DROP CONSTRAINT IF EXISTS agent_researches_mode_check,
  ADD CONSTRAINT agent_researches_mode_check
    CHECK (mode IN ('chat', 'research'));

ALTER TABLE public.agent_researches
  DROP CONSTRAINT IF EXISTS agent_researches_status_check,
  ADD CONSTRAINT agent_researches_status_check
    CHECK (status IN ('active', 'completed', 'failed'));

-- 2. Chat messages (research_id null = free-floating chat, not a session)
CREATE TABLE IF NOT EXISTS public.agent_messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id   uuid REFERENCES public.agent_researches(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content       text NOT NULL,
  model         text,
  input_tokens  integer,
  output_tokens integer,
  latency_ms    integer,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 3. Usage ledger (per-user meter for rate limiting & future quotas)
CREATE TABLE IF NOT EXISTS public.agent_usage (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model         text NOT NULL,
  tier          text NOT NULL DEFAULT 'free',
  input_tokens  integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  latency_ms    integer,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 4. Indexes for the hot read paths
CREATE INDEX IF NOT EXISTS idx_agent_researches_user
  ON public.agent_researches (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_messages_research
  ON public.agent_messages (research_id, created_at);
CREATE INDEX IF NOT EXISTS idx_agent_messages_user
  ON public.agent_messages (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_usage_user_time
  ON public.agent_usage (user_id, created_at DESC);

-- 5. RLS — owner-only on every table
ALTER TABLE public.agent_researches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_usage       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_researches_owner_select" ON public.agent_researches
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "agent_researches_owner_insert" ON public.agent_researches
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "agent_researches_owner_update" ON public.agent_researches
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "agent_researches_owner_delete" ON public.agent_researches
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "agent_messages_owner_select" ON public.agent_messages
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "agent_messages_owner_insert" ON public.agent_messages
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "agent_messages_owner_delete" ON public.agent_messages
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "agent_usage_owner_select" ON public.agent_usage
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "agent_usage_owner_insert" ON public.agent_usage
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "agent_usage_owner_delete" ON public.agent_usage
  FOR DELETE USING (user_id = auth.uid());

-- 6. Service role writes (edge function usage ledger)
GRANT INSERT ON public.agent_usage TO service_role;