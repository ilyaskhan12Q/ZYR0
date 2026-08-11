import type { TourDefinition } from '../TourStep';

/**
 * First-run guided tour for the student Workspace.
 * Targets use `data-tour` attributes added to elements in
 * DashboardLayout.tsx (chrome) and pages/student/Workspace.tsx.
 */
export const studentWorkspaceTour: TourDefinition = {
  id: 'student-workspace',
  steps: [
    {
      id: 'sidebar-nav',
      title: 'Your command center',
      body: 'Everything lives in this sidebar — dashboard, internships, applications, tasks, messages and your profile.',
      target: 'sidebar-nav',
      placement: 'right',
    },
    {
      id: 'header-notifications',
      title: 'Stay in the loop',
      body: 'Offers, task updates and messages land in your notifications. The red dot means something new.',
      target: 'header-notifications',
      placement: 'bottom',
    },
    {
      id: 'header-theme-toggle',
      title: 'Your look, your way',
      body: 'Switch between light and dark mode anytime.',
      target: 'header-theme-toggle',
      placement: 'bottom',
    },
    {
      id: 'workspace-internship-header',
      title: 'Your active internship',
      body: 'This is your current internship at a glance — company, position and engagement details.',
      target: 'workspace-internship-header',
      placement: 'bottom',
    },
    {
      id: 'workspace-tabs',
      title: 'Switch between views',
      body: 'Jump between tasks, submissions, and internship details without leaving the workspace.',
      target: 'workspace-tabs',
      placement: 'bottom',
    },
    {
      id: 'workspace-task-list',
      title: 'Tasks & deadlines',
      body: 'Each assigned task has a deadline. Open one to read its requirements and submit your work.',
      target: 'workspace-task-list',
      placement: 'left',
    },
    {
      id: 'workspace-support-card',
      title: 'Help is always here',
      body: 'Stuck? Your mentor and the ZYR0 team are one click away.',
      target: 'workspace-support-card',
      placement: 'top',
    },
  ],
};

export const TOUR_REGISTRY: Record<string, TourDefinition> = {
  'student-workspace': studentWorkspaceTour,
};
