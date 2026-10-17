-- =============================================
-- Migration 061: Admin Security, Governance, and Plan Management
--
-- 1. Hardens signup trigger: disallows client-injected 'admin' role
-- 2. Expands profiles.status constraint to include 'suspended'
-- 3. Adds plan tier and manual override columns to profiles
-- 4. Prevents self-elevation and privilege escalation on profiles
-- 5. Adds last-admin lockout protection trigger
-- 6. Adds Admin UPDATE policy on profiles (fixes RLS write block)
-- 7. Adds Admin SELECT policy on agent_usage (enables AI telemetry)
-- 8. Enhances activity_logs with actor_id, reason, and metadata
-- =============================================

-- 1. Harden registration trigger: never allow client-assigned 'admin' role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_requested_role text;
  v_assigned_role text;
BEGIN
  v_requested_role := lower(COALESCE(NEW.raw_user_meta_data->>'role', 'student'));
  
  -- Strict whitelist: users can only register as student, company, or mentor.
  -- 'admin' role must NEVER be self-assigned.
  IF v_requested_role IN ('student', 'company', 'mentor') THEN
    v_assigned_role := v_requested_role;
  ELSE
    v_assigned_role := 'student';
  END IF;

  INSERT INTO public.profiles (id, role, full_name, avatar_url, plan_tier)
  VALUES (
    NEW.id,
    v_assigned_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    'free'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Allow 'suspended' in profiles.status
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_status_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_status_check
  CHECK (status IN ('active', 'inactive', 'pending', 'suspended'));

-- 3. Add plan tier, suspension, and administrative audit columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_tier text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_granted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS plan_granted_at timestamptz,
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS status_reason text,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_tier_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_tier_check
  CHECK (plan_tier IN ('free', 'go', 'plus', 'enterprise'));

-- Create index on plan_tier for fast dashboard aggregation
CREATE INDEX IF NOT EXISTS idx_profiles_plan_tier
  ON public.profiles (plan_tier);

CREATE INDEX IF NOT EXISTS idx_profiles_status
  ON public.profiles (status);

-- 4. Server-side privilege protection trigger
-- Ensures non-admins cannot elevate their role, plan, or status
CREATE OR REPLACE FUNCTION public.protect_profile_privilege_fields()
RETURNS TRIGGER AS $$
DECLARE
  v_caller_is_admin boolean;
BEGIN
  -- If invoked from database migrations/service role without auth context, allow
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  v_caller_is_admin := public.is_admin();

  -- Non-admins cannot alter their role
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT v_caller_is_admin THEN
    RAISE EXCEPTION 'Privilege escalation rejected: only administrators can modify user roles';
  END IF;

  -- Non-admins cannot alter their account status
  IF NEW.status IS DISTINCT FROM OLD.status AND NOT v_caller_is_admin THEN
    RAISE EXCEPTION 'Status modification rejected: only administrators can alter account status';
  END IF;

  -- Non-admins cannot self-grant plan tiers or manual grant attributes
  IF (NEW.plan_tier IS DISTINCT FROM OLD.plan_tier OR
      NEW.plan_granted_by IS DISTINCT FROM OLD.plan_granted_by OR
      NEW.plan_expires_at IS DISTINCT FROM OLD.plan_expires_at) AND NOT v_caller_is_admin THEN
    RAISE EXCEPTION 'Plan modification rejected: only administrators can grant plan overrides';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_privileges ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileges
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privilege_fields();

-- 5. Last-Admin Lockout Protection trigger
-- Prevents demoting or deactivating the last remaining active administrator
CREATE OR REPLACE FUNCTION public.prevent_last_admin_lockout()
RETURNS TRIGGER AS $$
DECLARE
  v_remaining_admins int;
BEGIN
  IF OLD.role = 'admin' THEN
    -- Check if changing role away from admin
    IF NEW.role != 'admin' THEN
      SELECT count(*) INTO v_remaining_admins
      FROM public.profiles
      WHERE role = 'admin' AND status = 'active' AND id != OLD.id;

      IF v_remaining_admins < 1 THEN
        RAISE EXCEPTION 'Cannot demote the last remaining active platform administrator';
      END IF;
    END IF;

    -- Check if deactivating or suspending this admin
    IF NEW.status IN ('inactive', 'suspended') AND OLD.status = 'active' THEN
      SELECT count(*) INTO v_remaining_admins
      FROM public.profiles
      WHERE role = 'admin' AND status = 'active' AND id != OLD.id;

      IF v_remaining_admins < 1 THEN
        RAISE EXCEPTION 'Cannot deactivate or suspend the last remaining active platform administrator';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_last_admin_lockout ON public.profiles;
CREATE TRIGGER trg_prevent_last_admin_lockout
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_last_admin_lockout();

-- 6. Grant Admin UPDATE policy on profiles
DROP POLICY IF EXISTS "Profiles: admin update" ON public.profiles;
CREATE POLICY "Profiles: admin update"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7. Grant Admin SELECT policy on agent_usage (allows AI telemetry)
DROP POLICY IF EXISTS "agent_usage_admin_select" ON public.agent_usage;
CREATE POLICY "agent_usage_admin_select"
  ON public.agent_usage FOR SELECT
  USING (public.is_admin());

-- 8. Enhance activity_logs for rich administrative audit trails
ALTER TABLE public.activity_logs
  ADD COLUMN IF NOT EXISTS actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reason text,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_activity_logs_actor
  ON public.activity_logs (actor_id, created_at DESC);

-- Ensure activity logs are safely insertable by authenticated users & service role
DROP POLICY IF EXISTS "Activity logs: insert authenticated" ON public.activity_logs;
CREATE POLICY "Activity logs: insert authenticated"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
