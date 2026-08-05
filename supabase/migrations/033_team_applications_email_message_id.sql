-- Migration 033: Track Resend message id for team application emails so
-- delivery can be verified post-send (email bounces happen asynchronously
-- after Resend accepts the message).

ALTER TABLE team_applications
  ADD COLUMN IF NOT EXISTS email_message_id text;
