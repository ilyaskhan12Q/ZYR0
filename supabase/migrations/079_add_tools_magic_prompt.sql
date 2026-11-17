-- Migration: 079_add_tools_magic_prompt.sql
-- Description: Add magic_prompt column for AI agent copy-paste instruction templates.

ALTER TABLE public.tools
  ADD COLUMN IF NOT EXISTS magic_prompt TEXT;

COMMENT ON COLUMN public.tools.magic_prompt IS 'Optional pre-crafted prompt for AI agents (Claude, Cursor, Gemini, etc.) to install, configure, or invoke this tool/skill.';
