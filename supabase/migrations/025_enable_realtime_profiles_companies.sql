-- =============================================
-- Migration 025: Enable Realtime for Profiles & Companies
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.companies;
