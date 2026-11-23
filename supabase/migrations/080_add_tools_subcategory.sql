-- Migration: 080_add_tools_subcategory.sql
-- Description: Add a discipline/use-case subcategory (Design, Engineering, Research, ...) for filtering.
-- Kept nullable with no CHECK so new subcategories ship without a migration; form input is constrained in the app.

ALTER TABLE public.tools
  ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- Backfill existing listings so every current row has a useful subcategory.
UPDATE public.tools
SET subcategory = CASE category
  WHEN 'AI & Agents' THEN 'AI & LLMs'
  WHEN 'Developer Tools' THEN 'Engineering'
  WHEN 'Research & Docs' THEN 'Research'
  WHEN 'Productivity' THEN 'Productivity'
END
WHERE subcategory IS NULL;

CREATE INDEX IF NOT EXISTS idx_tools_subcategory ON public.tools(subcategory);

COMMENT ON COLUMN public.tools.subcategory IS 'Optional discipline/use-case: Design & UI/UX, Engineering, AI & LLMs, Data & Analytics, Writing & Content, Marketing & Growth, Research, Productivity, Security, Business & Ops, Education.';
