export type TrackId = 'all' | 'frontend' | 'fullstack' | 'ai-ml' | 'backend' | 'data';

export interface Track {
  id: TrackId;
  label: string;
  flag: string;
}

export const TRACKS: Track[] = [
  { id: 'all', label: 'All Tracks', flag: '--all' },
  { id: 'frontend', label: 'Frontend', flag: '--frontend' },
  { id: 'fullstack', label: 'Full-Stack', flag: '--fullstack' },
  { id: 'ai-ml', label: 'AI / ML', flag: '--ai-ml' },
  { id: 'backend', label: 'Backend', flag: '--backend' },
  { id: 'data', label: 'Data', flag: '--data' },
];

export interface ExplorerTask {
  id: string;
  track: Exclude<TrackId, 'all'>;
  title: string;
  hours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  stack: string[];
}

export const EXPLORER_TASKS: ExplorerTask[] = [
  { id: 't1', track: 'frontend', title: 'Build an accessible dashboard shell', hours: 18, difficulty: 'Beginner', stack: ['React', 'TS', 'Tailwind'] },
  { id: 't2', track: 'frontend', title: 'Animate a scroll-driven product tour', hours: 26, difficulty: 'Intermediate', stack: ['React', 'Framer Motion'] },
  { id: 't3', track: 'fullstack', title: 'Internship application pipeline', hours: 40, difficulty: 'Intermediate', stack: ['React', 'TS', 'Supabase'] },
  { id: 't4', track: 'fullstack', title: 'Real-time mentor feedback inbox', hours: 34, difficulty: 'Advanced', stack: ['React', 'Supabase', 'RLS'] },
  { id: 't5', track: 'ai-ml', title: 'Resume parsing & skill extraction', hours: 36, difficulty: 'Intermediate', stack: ['Python', 'FastAPI', 'NLP'] },
  { id: 't6', track: 'ai-ml', title: 'Rubric-score prediction baseline', hours: 44, difficulty: 'Advanced', stack: ['Python', 'scikit-learn'] },
  { id: 't7', track: 'backend', title: 'Certificate signing edge function', hours: 24, difficulty: 'Intermediate', stack: ['Deno', 'Supabase', 'QR'] },
  { id: 't8', track: 'backend', title: 'Row-level security policy suite', hours: 30, difficulty: 'Advanced', stack: ['PostgreSQL', 'RLS'] },
  { id: 't9', track: 'data', title: 'Internship outcomes dashboard', hours: 28, difficulty: 'Intermediate', stack: ['SQL', 'Recharts', 'TS'] },
  { id: 't10', track: 'data', title: 'Cohort completion analytics ETL', hours: 22, difficulty: 'Beginner', stack: ['SQL', 'Python'] },
];
