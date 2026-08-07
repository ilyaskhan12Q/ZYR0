import type { ApplicationStatus } from '@/lib/database.types';

/** Badge color classes for internship-application statuses (light / dark). */
export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  Applied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Under Review': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Shortlisted: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  Accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400',
  Withdrawn: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export function applicationStatusClass(status: string) {
  return APPLICATION_STATUS_COLORS[status as ApplicationStatus] || 'bg-muted text-muted-foreground';
}