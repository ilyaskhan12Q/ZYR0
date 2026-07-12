-- =============================================
-- Migration 020: Add email column to profiles
--
-- WHY: Several PostgREST queries select email from profiles
--      (e.g. assignee:profiles!assigned_to (id, full_name, avatar_url, email))
--      but the column didn't exist, causing HTTP 400.
--
--      The email is sourced from auth.users.email (available in triggers
--      as NEW.email) and stored so REST API consumers can read it via
--      the profiles embed without needing access to auth schema.
-- =============================================

-- 1. Add the column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text;

-- 2. Backfill from auth.users for existing rows
UPDATE public.profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id
    AND p.email IS NULL;

-- 3. Update the trigger to store email on new sign-ups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    email = COALESCE(EXCLUDED.email, profiles.email);
  RETURN NEW;
END;
$$;
