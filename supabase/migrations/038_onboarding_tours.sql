-- Migration 038: Onboarding tour tracking.
-- Tracks which guided onboarding tours a user has seen (or skipped) so that
-- each tour auto-launches only once per user, e.g. 'student-workspace'.

alter table public.profiles add column if not exists onboarding_tours text[] not null default '{}';
