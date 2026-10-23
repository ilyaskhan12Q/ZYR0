-- Migration: 062_add_install_commands_to_tools.sql
-- Description: Add install_commands JSONB column for multi-command setup (e.g. Agent Setup, CLI, Docker, npm/pip/cargo).

ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS install_commands JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.tools.install_commands IS 'Structured array of installation commands with labels: [{"label": "Agent Setup", "command": "..."}, {"label": "CLI", "command": "..."}]';
