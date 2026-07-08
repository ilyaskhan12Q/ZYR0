-- =============================================
-- Migration 015: Add performance indexes
-- Indexes foreign key and status columns to speed up dashboard queries.
-- =============================================

-- Indexes for tasks table
CREATE INDEX IF NOT EXISTS idx_tasks_internship_id ON public.tasks (internship_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks (assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks (status);

-- Indexes for task_submissions table
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id ON public.task_submissions (task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_student_id ON public.task_submissions (student_id);

-- Indexes for applications table
CREATE INDEX IF NOT EXISTS idx_applications_internship_id ON public.applications (internship_id);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON public.applications (student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications (status);
