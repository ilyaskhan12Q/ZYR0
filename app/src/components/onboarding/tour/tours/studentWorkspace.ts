import type { TourDefinition } from '../TourStep';
import { studentJourneyTour } from './studentJourney';

/**
 * First-run guided tour for the student Workspace.
 * Targets use `data-tour` attributes added to elements in
 * DashboardLayout.tsx (chrome) and pages/student/Workspace.tsx.
 */
export const studentWorkspaceTour: TourDefinition = {
  id: 'student-workspace',
  steps: [
    {
      id: 'workspace-internship-header',
      title: 'Your active internship',
      body: 'This is your current internship at a glance — company, position and engagement details.',
      target: 'workspace-internship-header',
      placement: 'bottom',
    },
    {
      id: 'workspace-tabs',
      title: 'Head to Tasks & Submission',
      body: 'This is where your assignments live. I\'ll switch you to the Tasks tab and walk you through submitting one, step by step.',
      target: 'workspace-tabs',
      placement: 'bottom',
      activateTab: 'Tasks',
    },
    {
      id: 'workspace-task-item',
      title: 'Pick an assigned task',
      body: 'Each card is an assignment with a status badge, deadline and difficulty. Click the first task to open its details.',
      target: 'workspace-task-item',
      placement: 'right',
    },
    {
      id: 'workspace-task-details',
      title: 'Read the brief carefully',
      body: 'The description, objectives and acceptance criteria tell you exactly what is expected. Check the due date before starting.',
      target: 'workspace-task-details',
      placement: 'bottom',
    },
    {
      id: 'workspace-submission-github',
      title: '1. Add your repository link',
      body: 'Paste the GitHub URL of your completed project here — this field is required before you can submit.',
      target: 'workspace-submission-github',
      placement: 'top',
    },
    {
      id: 'workspace-submission-demo',
      title: '2. Optional live demo',
      body: 'If your project is deployed, add the live URL too so the coordinator can try it directly.',
      target: 'workspace-submission-demo',
      placement: 'top',
    },
    {
      id: 'workspace-submission-notes',
      title: '3. Explain your work',
      body: 'Briefly summarize what you built, any challenges you faced, and assumptions you made.',
      target: 'workspace-submission-notes',
      placement: 'top',
    },
    {
      id: 'workspace-submission-submit',
      title: '4. Submit for review',
      body: 'Hit "Submit Solution" and your work is sent to the coordinator for grading. You can track progress under Submissions History.',
      target: 'workspace-submission-submit',
      placement: 'right',
    },
  ],
};

export const TOUR_REGISTRY: Record<string, TourDefinition> = {
  'student-workspace': studentWorkspaceTour,
  'student-journey': studentJourneyTour,
};
