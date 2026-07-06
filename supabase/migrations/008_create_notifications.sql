-- =============================================
-- Migration 008: Notifications
-- =============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text NOT NULL
              CHECK (type IN ('application', 'task', 'message', 'certificate', 'system', 'deadline')),
  title       text NOT NULL,
  message     text NOT NULL,
  read        boolean NOT NULL DEFAULT false,
  action_url  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for fast per-user notification fetching + unread count
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id, read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
