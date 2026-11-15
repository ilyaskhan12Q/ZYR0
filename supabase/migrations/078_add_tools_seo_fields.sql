-- Migration: 078_add_tools_seo_fields.sql
-- Description: Persist editable SEO metadata for directory listings.
-- Slug already exists on public.tools; these columns cover the title and meta description.

ALTER TABLE public.tools
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT;

COMMENT ON COLUMN public.tools.seo_title IS 'Optional SEO page title. Falls back to the listing name and category when empty.';
COMMENT ON COLUMN public.tools.seo_description IS 'Optional meta description. Falls back to the tagline when empty.';
