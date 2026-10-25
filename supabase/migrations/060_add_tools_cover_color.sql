-- Migration: 060_add_tools_cover_color.sql
-- Description: Add admin-customizable hero gradient color for tool/skill cards.

ALTER TABLE public.tools ADD COLUMN IF NOT EXISTS cover_color TEXT;
