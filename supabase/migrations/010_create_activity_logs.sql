-- =============================================
-- Migration 010: Activity Logs
-- =============================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action      text NOT NULL,
  target      text,
  target_type text,
  details     text,
  ip_address  inet,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for admin log viewer (newest first per user)
CREATE INDEX IF NOT EXISTS idx_activity_logs_time
  ON public.activity_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user
  ON public.activity_logs (user_id, created_at DESC);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
