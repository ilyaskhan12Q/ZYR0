export type JourneyVisual = 'chips' | 'seal' | 'tasks' | 'diff' | 'rubric' | 'qr';
export type JourneyAccent = 'sky' | 'indigo' | 'emerald';

export interface JourneyPhase {
  index: string;
  title: string;
  subtitle: string;
  accent: JourneyAccent;
  visual: JourneyVisual;
  points: string[];
}

export const JOURNEY_PHASES: JourneyPhase[] = [
  {
    index: '01',
    title: 'Explore & Apply',
    subtitle: 'Filter domain-specific role tracks and submit a structured application in minutes.',
    accent: 'sky',
    visual: 'chips',
    points: [
      'Curated drops across Frontend, Backend, AI/ML, and Data',
      'One profile powers every application',
      'Transparent review status from day one',
    ],
  },
  {
    index: '02',
    title: 'Instant Offer Letter',
    subtitle: 'Accepted candidates receive a formal, downloadable offer letter with official credentials.',
    accent: 'sky',
    visual: 'seal',
    points: [
      'System-generated PDF with company branding',
      'Embedded verification QR on every document',
      'Accept the offer directly from your dashboard',
    ],
  },
  {
    index: '03',
    title: 'Dedicated Task Workspace',
    subtitle: 'Clear problem statements, acceptance criteria, and milestone tracking in one place.',
    accent: 'indigo',
    visual: 'tasks',
    points: [
      'Every task ships with defined acceptance criteria',
      'Milestone progress visible to you and your mentor',
      'Structured feedback loops on each submission',
    ],
  },
  {
    index: '04',
    title: 'GitHub PR Submission',
    subtitle: 'Build in your own repository and submit a pull request link — your code stays yours.',
    accent: 'indigo',
    visual: 'diff',
    points: [
      'Public repo + live URL submission flow',
      'Real engineering workflow, not a sandbox',
      'Commit history becomes part of your proof',
    ],
  },
  {
    index: '05',
    title: 'Transparent Mentor Grading',
    subtitle: 'Detailed rubric breakdown across code quality, architecture, and security.',
    accent: 'emerald',
    visual: 'rubric',
    points: [
      'Rubric-based scoring, never a black box',
      'Actionable revision requests when needed',
      'Industry mentors review every submission',
    ],
  },
  {
    index: '06',
    title: 'Verifiable Certificate',
    subtitle: 'Earn a cryptographically signed credential any employer can verify in seconds.',
    accent: 'emerald',
    visual: 'qr',
    points: [
      'Unique credential ID + scannable QR code',
      'Public verification endpoint, no login required',
      'Permanent record of real project work',
    ],
  },
];
