-- Migration 012: Missing RPC functions and FK fix
-- Fixes: BUG-004 (missing mark_messages_read RPC)
--        BUG-005 (company_id FK on profiles)

-- ============================================================
-- BUG-004: mark_messages_read RPC
-- Called by: app/src/services/messages.ts
-- Appends a user_id to the read_by array of unread messages
-- in a conversation without race conditions
-- ============================================================
CREATE OR REPLACE FUNCTION mark_messages_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE messages
  SET read_by = array_append(read_by, p_user_id)
  WHERE
    conversation_id = p_conversation_id
    AND sender_id != p_user_id
    AND NOT (p_user_id = ANY(read_by));
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION mark_messages_read(UUID, UUID) TO authenticated;


-- ============================================================
-- BUG-005: Add proper FK constraint from profiles.company_id
-- to companies.id (was missing in migration 001)
-- The column exists but had no FK enforcement.
-- ============================================================
DO $$
BEGIN
  -- Only add if the constraint doesn't already exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_company_id_fkey'
      AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_company_id_fkey
      FOREIGN KEY (company_id)
      REFERENCES companies(id)
      ON DELETE SET NULL;
  END IF;
END;
$$;


-- ============================================================
-- BUG-008: OAuth role assignment
-- When a user signs in with Google/LinkedIn and no role is set
-- in user_metadata, the handle_new_user trigger defaults to
-- 'student'. This is acceptable, but we need a way to detect
-- OAuth users who haven't set their role yet.
-- Add a flag so the frontend can show a "complete profile" modal.
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN NOT NULL DEFAULT FALSE;

-- Mark existing users as complete (they signed up with email+role)
UPDATE profiles
SET profile_complete = TRUE
WHERE role IS NOT NULL;

-- Update the handle_new_user trigger to set profile_complete = FALSE
-- for OAuth users (those without explicit role in metadata)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  is_complete BOOLEAN;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  -- Mark as incomplete if role wasn't explicitly provided (OAuth flow)
  is_complete := (NEW.raw_user_meta_data->>'role') IS NOT NULL;

  INSERT INTO public.profiles (id, role, full_name, avatar_url, email, profile_complete)
  VALUES (
    NEW.id,
    user_role,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    is_complete
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(
      EXCLUDED.full_name,
      profiles.full_name
    ),
    avatar_url = COALESCE(
      EXCLUDED.avatar_url,
      profiles.avatar_url
    ),
    email = COALESCE(
      EXCLUDED.email,
      profiles.email
    );

  RETURN NEW;
END;
$$;
