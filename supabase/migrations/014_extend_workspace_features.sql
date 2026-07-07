-- =============================================
-- Migration 014: Extend tasks & task_submissions for Internship Workspace
-- Adds fields for richer task definition and repository submission details.
-- =============================================

-- Extend tasks table
ALTER TABLE public.tasks 
  ADD COLUMN IF NOT EXISTS objectives text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS acceptance_criteria text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS difficulty text CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
  ADD COLUMN IF NOT EXISTS estimated_duration text;

-- Extend task_submissions table
ALTER TABLE public.task_submissions 
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS live_demo_url text;

-- Update RLS policies to make sure all selects still work as expected
-- Ensure they are enabled (ALTER TABLE ... ENABLE ROW LEVEL SECURITY is already active, but let's be explicit)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
