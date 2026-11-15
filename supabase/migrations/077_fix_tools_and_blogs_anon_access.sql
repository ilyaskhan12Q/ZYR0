-- Migration: 077_fix_tools_and_blogs_anon_access.sql
-- Description: Fix RLS policies on tools and blogs for anonymous visitors.
-- Root cause: 057 and 058 used raw subqueries on public.profiles in "FOR ALL" policies
-- without scoping TO authenticated. When 063 revoked SELECT on profiles from anon,
-- all public SELECT queries on tools and blogs began failing with HTTP 401:
-- "permission denied for table profiles".
--
-- Fix:
-- 1. Replace raw profile subqueries with public.is_admin() (SECURITY DEFINER).
-- 2. Scope admin ALL policies TO authenticated.
-- 3. Explicitly grant SELECT on tools and blogs to anon and authenticated.

-- ── TOOLS ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins have full access to tools" ON public.tools;
CREATE POLICY "Admins have full access to tools"
  ON public.tools FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Re-assert public read policy for approved tools
DROP POLICY IF EXISTS "Public can view approved tools" ON public.tools;
CREATE POLICY "Public can view approved tools"
  ON public.tools FOR SELECT
  USING (status = 'approved');

GRANT SELECT ON public.tools TO anon, authenticated;

-- ── BLOGS ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins have full access to blogs" ON public.blogs;
CREATE POLICY "Admins have full access to blogs"
  ON public.blogs FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Re-assert public read policy for published blogs
DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
CREATE POLICY "Public can view published blogs"
  ON public.blogs FOR SELECT
  USING (is_published = true);

GRANT SELECT ON public.blogs TO anon, authenticated;
