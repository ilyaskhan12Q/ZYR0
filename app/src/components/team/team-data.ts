import type { LucideIcon } from 'lucide-react';
import {
  Compass, Blocks, Rocket, GraduationCap,
  Briefcase, Code2, Users, BadgeCheck, Share2,
  BookOpen, RefreshCw, HeartHandshake, Eye, PenLine,
  GitPullRequest, ListTodo, TestTube2, Award, Medal,
  ClipboardList, FileText, UserSearch, MessagesSquare, UserCheck,
  Clock, Github, FileCheck2, MessageSquare, ShieldCheck,
  UserRound, IdCard, FolderGit2, TrendingUp, Palette, Server,
  BrainCircuit, CloudCog, Database, Lock, FileCode2, Megaphone, Search, Sparkles,
} from 'lucide-react';

/* ────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────── */

export type RoleStatus = 'open' | 'limited';

export interface TeamRole {
  id: string;
  title: string;
  department: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon chip (light / dark) */
  accent: string;
  overview: string;
  responsibilities: string[];
  requiredTech: string[];
  preferredSkills: string[];
  positions: number;
  status: RoleStatus;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface TimelineStep {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface FeatureCard {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}

/* ────────────────────────────────────────────────────────────────
   Accent palette helpers
   ──────────────────────────────────────────────────────────────── */

export const STATUS_META: Record<RoleStatus, { label: string; classes: string }> = {
  open: {
    label: 'Open',
    classes:
      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
  },
  limited: {
    label: 'Limited',
    classes:
      'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
  },
};

export function departmentCounts(roles: TeamRole[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const role of roles) {
    counts.set(role.department, (counts.get(role.department) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
}

/* ────────────────────────────────────────────────────────────────
   Open roles — reusable data structure (extend this array to add roles)
   ──────────────────────────────────────────────────────────────── */

export const TEAM_ROLES: TeamRole[] = [
  {
    id: 'product-designer',
    title: 'Product Designer (UI/UX)',
    department: 'Design',
    icon: Palette,
    accent: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    overview:
      'Own the visual language and experience of the ZYR0 platform. You will translate complex internship workflows into clean, accessible, and beautiful interfaces that students and employers enjoy using.',
    responsibilities: [
      'Design new pages, flows, and components within the ZYR0 design system',
      'Turn requirements into wireframes, prototypes, and high-fidelity mockups',
      'Collaborate with engineers to ship pixel-consistent, accessible UI',
      'Contribute to the shared component library and design tokens',
    ],
    requiredTech: ['Figma', 'UI/UX Principles', 'Design Systems', 'Prototyping'],
    preferredSkills: ['Motion Design', 'User Research', 'Accessibility (WCAG)', 'Illustration'],
    positions: 2,
    status: 'open',
  },
  {
    id: 'frontend-engineer',
    title: 'Frontend Software Engineer',
    department: 'Engineering',
    icon: Code2,
    accent: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    overview:
      'Build the product experience that defines ZYR0 every day. You turn design into fast, responsive, and accessible tools that students and companies rely on to manage real internships.',
    responsibilities: [
      'Build reusable React components and feature modules with TypeScript',
      'Maintain design-system consistency, performance, and accessibility',
      'Work on the landing experience, portal dashboards, and application flows',
      'Review pull requests and keep the codebase clean and well-tested',
    ],
    requiredTech: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    preferredSkills: ['Framer Motion', 'Radix UI', 'Next.js', 'React Query'],
    positions: 3,
    status: 'open',
  },
  {
    id: 'backend-engineer',
    title: 'Backend Software Engineer',
    department: 'Engineering',
    icon: Server,
    accent: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    overview:
      'Build the reliable, observable backend that powers internships, task tracking, and credential verification. You design APIs and services that keep the platform fast, correct, and safe.',
    responsibilities: [
      'Design and implement REST/GraphQL services and third-party integrations',
      'Own data validation, error handling, and service architecture decisions',
      'Write tests that keep core platform flows robust and predictable',
      'Collaborate on API contracts and service documentation',
    ],
    requiredTech: ['Node.js', 'TypeScript', 'REST APIs', 'PostgreSQL'],
    preferredSkills: ['Supabase', 'GraphQL', 'Edge Functions', 'Caching'],
    positions: 2,
    status: 'limited',
  },
  {
    id: 'ai-systems-engineer',
    title: 'AI Systems Engineer',
    department: 'AI & Data',
    icon: BrainCircuit,
    accent: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400',
    overview:
      'Explore and ship intelligent features — from skill matching to summarization — that make mentorship and discovery smarter, while keeping user data private and decisions explainable.',
    responsibilities: [
      'Build and evaluate ML pipelines, recommendation, and NLP features',
      'Integrate AI capabilities behind clean, audited service boundaries',
      'Write evaluation, retrieval, and data-quality tooling',
      'Document models, prompts, and decision logic for the team',
    ],
    requiredTech: ['Python', 'ML / LLM Fundamentals', 'Vector Databases', 'API Design'],
    preferredSkills: ['RAG', 'PyTorch', 'A/B Experimentation', 'Prompt Engineering'],
    positions: 2,
    status: 'open',
  },
  {
    id: 'devops-engineer',
    title: 'DevOps & Cloud Engineer',
    department: 'Platform',
    icon: CloudCog,
    accent: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    overview:
      'Keep the platform smooth, fast, and always available. You own CI/CD, infrastructure, and observability so the rest of the team can ship with confidence.',
    responsibilities: [
      'Build and maintain CI/CD pipelines for deployment and releases',
      'Manage cloud infrastructure, containerization, and environment parity',
      'Instrument metrics, logs, and alerts across the full platform',
      'Automate routine operations and improve developer experience',
    ],
    requiredTech: ['Docker', 'CI/CD', 'Linux', 'AWS or GCP'],
    preferredSkills: ['Kubernetes', 'Terraform', 'GitHub Actions', 'Observability'],
    positions: 1,
    status: 'open',
  },
  {
    id: 'database-engineer',
    title: 'Database Systems Engineer',
    department: 'Platform',
    icon: Database,
    accent: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
    overview:
      'Own the data layer — schema design, query performance, and secure access. Your work ensures every student, company, and mentor sees the right data at the right moment.',
    responsibilities: [
      'Design and evolve the PostgreSQL schema and Row Level Security policies',
      'Profile queries and indexes to keep dashboards and flows fast',
      'Write safe data migrations and maintain referential integrity',
      'Build tooling for inspecting and working with production data',
    ],
    requiredTech: ['PostgreSQL', 'SQL', 'Schema Design', 'Indexing'],
    preferredSkills: ['Supabase', 'Query Planning', 'Data Modelling', 'Redis'],
    positions: 2,
    status: 'open',
  },
  {
    id: 'security-engineer',
    title: 'Security Engineer',
    department: 'Engineering',
    icon: Lock,
    accent: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    overview:
      'Guard the trust ZYR0 is built on. You review threats and make sure authentication, authorization, and data handling stand up to scrutiny at every layer.',
    responsibilities: [
      'Review authentication, authorization, and access-control flows',
      'Audit new features for injection, IDOR, and data-exposure risks',
      'Maintain security documentation and incident-response guidance',
      'Educate the team on secure coding practices',
    ],
    requiredTech: ['Web Security (OWASP)', 'Authentication', 'TypeScript'],
    preferredSkills: ['Penetration Testing', 'Threat Modelling', 'Security Headers'],
    positions: 1,
    status: 'limited',
  },
  {
    id: 'qa-engineer',
    title: 'QA & Reliability Engineer',
    department: 'Engineering',
    icon: TestTube2,
    accent: 'bg-lime-500/15 text-lime-700 dark:text-lime-400',
    overview:
      'Lead reliability across the product. You define how the team tests, measure quality, and prevent regressions before they ever reach students or companies.',
    responsibilities: [
      'Build automated regression suites for the most critical flows',
      'Write and maintain end-to-end browser tests',
      'Enforce testing guidance in code review and release checklists',
      'Turn bug reports into reproducible test cases and fixes',
    ],
    requiredTech: ['Testing Foundations', 'Node.js', 'Git & CI'],
    preferredSkills: ['Playwright', 'Vitest / Jest', 'Accessibility Testing'],
    positions: 2,
    status: 'open',
  },
  {
    id: 'technical-writer',
    title: 'Technical Writer & Documentation Engineer',
    department: 'Engineering',
    icon: FileCode2,
    accent: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    overview:
      'Turn complex systems into clear guidance. You document architecture, APIs, release notes, and student-facing guides so the whole community can move faster and safer.',
    responsibilities: [
      'Maintain API references, architecture docs, and user guides',
      'Write release notes and changelog updates alongside the team',
      'Improve developer onboarding through clear structure and examples',
      'Review feature documentation for accuracy and clarity',
    ],
    requiredTech: ['Markdown', 'Technical Writing', 'API Literacy'],
    preferredSkills: ['OpenAPI', 'MDX / Docs Sites', 'Technical Diagrams'],
    positions: 2,
    status: 'open',
  },
  {
    id: 'devrel-coordinator',
    title: 'Developer Relations Coordinator',
    department: 'Community',
    icon: Megaphone,
    accent: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
    overview:
      'Be the voice of ZYR0 for students, mentors, and universities. You turn questions into content, feedback into product improvements, and newcomers into contributors.',
    responsibilities: [
      'Grow and moderate the contributor and mentor community',
      'Write developer posts, guides, and demo content',
      'Coordinate collaborations with universities and student clubs',
      'Synthesize user feedback into actionable product insights',
    ],
    requiredTech: ['Technical Writing', 'GitHub', 'Community Platforms'],
    preferredSkills: ['Content Strategy', 'Events', 'SEO Basics'],
    positions: 1,
    status: 'open',
  },
  {
    id: 'seo-specialist',
    title: 'Technical SEO Specialist',
    department: 'Growth',
    icon: Search,
    accent: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    overview:
      'Make sure students can find us. You own technical SEO, structured data, and Core Web Vitals — turning helpful pages into search traffic and internships into discoverable opportunities.',
    responsibilities: [
      'Audit and improve metadata, sitemaps, and Core Web Vitals',
      'Design programmatic SEO pages that stay high-quality and index-friendly',
      'Maintain structured data and measurement reporting',
      'Report on visibility trends and share wins across the team',
    ],
    requiredTech: ['Technical SEO', 'Analytics', 'HTML / CSS'],
    preferredSkills: ['Search Console', 'Web Vitals', 'Lighthouse', 'Content Strategy'],
    positions: 2,
    status: 'open',
  },
];

/* ────────────────────────────────────────────────────────────────
   Mission
   ──────────────────────────────────────────────────────────────── */

export const MISSION_CARDS: FeatureCard[] = [
  {
    icon: Compass,
    title: 'Why This Team Exists',
    description:
      'Every meaningful product starts with a small group of builders who care deeply about the problem. The founding development team gives students a real seat at the table — building production software that thousands of learners will rely on.',
    accent: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  {
    icon: Blocks,
    title: 'Why the Platform Matters',
    description:
      'Students graduate with strong theory but few chances to prove their craft. ZYR0 turns that around with structured internships, real projects, and verifiable certificates that employers can trust.',
    accent: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: Rocket,
    title: 'What We Are Building',
    description:
      'A transparent internship operating system: student profiles, task tracking, mentorship feedback, and tamper-proof credentials — all connected in one honest workflow.',
    accent: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  },
  {
    icon: GraduationCap,
    title: 'How You Can Contribute',
    description:
      'As a founding contributor you ship real pages, services, and documentation. You learn exactly how modern teams operate — planning, reviewing, and deploying to production — from the first week.',
    accent: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
];

/* ────────────────────────────────────────────────────────────────
   Why join
   ──────────────────────────────────────────────────────────────── */

export const WHY_JOIN: FeatureCard[] = [
  {
    icon: Rocket,
    title: 'Build a Real Product',
    description:
      'No mock projects. Your contributions ship to production and are used by real students, companies, and mentors from day one.',
    accent: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  {
    icon: Briefcase,
    title: 'Learn Modern Development',
    description:
      'Work with React, TypeScript, Supabase, CI/CD, code review, and everything a modern SaaS team runs on.',
    accent: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: Users,
    title: 'Work in Cross-Functional Teams',
    description:
      'Pair with designers, writers, and engineers across disciplines — exactly how you will collaborate in industry.',
    accent: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  },
  {
    icon: Palette,
    title: 'Gain Practical Experience',
    description:
      'Turn academic knowledge into shipped work: review feedback, sprint execution, and a portfolio of real outcomes.',
    accent: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  {
    icon: BadgeCheck,
    title: 'Earn Official Recognition',
    description:
      'Receive verified certificates, a public team profile, and GitHub recognition for every contribution you make.',
    accent: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  },
  {
    icon: Share2,
    title: 'Help Shape the Platform',
    description:
      'Have a direct voice in product direction, design decisions, and the roadmap of a growing career platform.',
    accent: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400',
  },
];

/* ────────────────────────────────────────────────────────────────
   Engineering culture
   ──────────────────────────────────────────────────────────────── */

export const CULTURE_PRINCIPLES: FeatureCard[] = [
  {
    icon: PenLine,
    title: 'Ownership',
    description:
      'You take responsibility for outcomes, not just tasks. Your work carries your name and it ships to real students.',
    accent: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description:
      'Ideas win over hierarchy. We sync, debate with respect, and ship together across every discipline on the team.',
    accent: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: BadgeCheck,
    title: 'Quality',
    description:
      'Clean, tested, accessible code is the baseline. We prefer a small, polished scope over a large, broken one.',
    accent: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  },
  {
    icon: BookOpen,
    title: 'Documentation',
    description:
      'Good work explains itself. We document decisions, tools, and processes so knowledge stays with the team.',
    accent: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  {
    icon: GitPullRequest,
    title: 'Code Review',
    description:
      'Every change passes through review. Feedback is treated as the cheapest way to keep the codebase healthy.',
    accent: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  },
  {
    icon: RefreshCw,
    title: 'Continuous Learning',
    description:
      'We are students building for students. Experiment, ask questions, and improve with every milestone.',
    accent: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  },
  {
    icon: Eye,
    title: 'Transparency',
    description:
      'Open tickets, honest notes, and visible priorities. Everyone can see the roadmap and their place in it.',
    accent: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  },
  {
    icon: HeartHandshake,
    title: 'Respect',
    description:
      'Kindness is a talent priority. We disagree constructively and treat every contributor\'s time with care.',
    accent: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400',
  },
];

/* ────────────────────────────────────────────────────────────────
   Development workflow
   ──────────────────────────────────────────────────────────────── */

export const WORKFLOW: TimelineStep[] = [
  {
    icon: ClipboardList,
    title: 'Planning',
    description:
      'Every feature starts with a ticket: clear scope, acceptance criteria, and a linked design or reference. Nothing ambiguous ships.',
  },
  {
    icon: ListTodo,
    title: 'Issue Assignment',
    description:
      'Tickets are picked up in team syncs based on interest and skill, so everyone grows into the work they care about.',
  },
  {
    icon: Code2,
    title: 'Development',
    description:
      'Work happens on a dedicated branch with conventional commits, focused changes, and self-review before opening a PR.',
  },
  {
    icon: GitPullRequest,
    title: 'Code Review',
    description:
      'Every PR gets reviewed for correctness, clarity, and security. Comments are constructive; the codebase stays healthy.',
  },
  {
    icon: TestTube2,
    title: 'Testing',
    description:
      'Changes pass automated checks plus manual QA against the acceptance criteria before they are ever merged.',
  },
  {
    icon: Rocket,
    title: 'Deployment',
    description:
      'Merged work flows through CI/CD to production with monitoring, rollback plans, and release notes for everyone.',
  },
  {
    icon: Award,
    title: 'Recognition',
    description:
      'Every merged contribution is credited to your team profile, tracked in our logs, and recognized at milestone reviews.',
  },
];

/* ────────────────────────────────────────────────────────────────
   Expectations
   ──────────────────────────────────────────────────────────────── */

export const EXPECTATIONS: FeatureCard[] = [
  {
    icon: Clock,
    title: 'Weekly Availability',
    description:
      'Commit to a consistent 8–12 hours per week, plus one team sync. Life happens — communicate early and we adjust.',
    accent: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  {
    icon: Github,
    title: 'GitHub Workflow',
    description:
      'All work happens in the open: branches, pull requests, and issues on our public and internal repositories.',
    accent: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
  },
  {
    icon: GitPullRequest,
    title: 'Pull Requests',
    description:
      'Ship small, self-contained PRs with clear descriptions, tests where relevant, and a short self-review.',
    accent: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: ListTodo,
    title: 'Issue Tracking',
    description:
      'Every task has a ticket. Update statuses as you work so the team always sees accurate progress.',
    accent: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  },
  {
    icon: BookOpen,
    title: 'Documentation',
    description:
      'Update docs alongside code. If it changed behaviour, the docs change with it.',
    accent: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  {
    icon: Eye,
    title: 'Code Reviews',
    description:
      'Review peers with respect and rigour. Thorough reviews are as valued as the code itself.',
    accent: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  },
  {
    icon: MessageSquare,
    title: 'Communication',
    description:
      'Replies within 24 hours on team channels. Questions are asked early, blockers are raised fast.',
    accent: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Attend syncs, unblock teammates, and share knowledge freely. We win and learn together.',
    accent: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  },
  {
    icon: BadgeCheck,
    title: 'Professional Behaviour',
    description:
      'Deadlines are respected, feedback is received gracefully, and community guidelines are followed.',
    accent: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  },
];

/* ────────────────────────────────────────────────────────────────
   Selection process
   ──────────────────────────────────────────────────────────────── */

export const SELECTION_STEPS: TimelineStep[] = [
  {
    icon: FileText,
    title: 'Application',
    description:
      'Submit the multi-step application with your details, links, role preferences, and motivation.',
  },
  {
    icon: UserSearch,
    title: 'Profile Review',
    description:
      'The team reviews your application, GitHub, and projects for skill fit, clarity, and potential.',
  },
  {
    icon: MessagesSquare,
    title: 'Technical Discussion',
    description:
      'A friendly, low-pressure conversation about your experience, working style, and the role.',
  },
  {
    icon: UserCheck,
    title: 'Role Assignment',
    description:
      'You are matched to a primary role and mentor, with a clear list of starter responsibilities.',
  },
  {
    icon: ListTodo,
    title: 'Trial Contribution',
    description:
      'A small, real task — often a bug fix or documentation slice — completed with full team support.',
  },
  {
    icon: BookOpen,
    title: 'Onboarding',
    description:
      'Access, guidelines, and a first sprint are set up. You meet the team and your mentor in a kickoff sync.',
  },
  {
    icon: Medal,
    title: 'Official Team Member',
    description:
      'After onboarding, you join the team directory, get your profile live, and begin contributing full time.',
  },
];

/* ────────────────────────────────────────────────────────────────
   Recognition
   ──────────────────────────────────────────────────────────────── */

export const RECOGNITION: FeatureCard[] = [
  {
    icon: UserRound,
    title: 'Official Team Profile',
    description:
      'A permanent profile on the ZYR0 team page with your role, bio, and contribution highlights.',
    accent: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  {
    icon: IdCard,
    title: 'Professional Team Card',
    description:
      'A shareable digital team card with your official role title, ready for LinkedIn and portfolios.',
    accent: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Contribution Certificate',
    description:
      'A verified certificate documenting your role, tenure, and key contributions — checkable through the ZYR0 verification portal.',
    accent: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  },
  {
    icon: Github,
    title: 'GitHub Recognition',
    description:
      'Every merge is visible on your GitHub contribution graph and public repositories.',
    accent: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
  },
  {
    icon: FolderGit2,
    title: 'Portfolio Experience',
    description:
      'Leave with shipped, production-quality work and documented outcomes you can show employers.',
    accent: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  {
    icon: TrendingUp,
    title: 'Future Leadership Opportunities',
    description:
      'Top contributors lead workstreams, mentor newcomers, and are first in line for roles as the team scales.',
    accent: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  },
];

/* ────────────────────────────────────────────────────────────────
   FAQ
   ──────────────────────────────────────────────────────────────── */

export const FAQS: FaqItem[] = [
  {
    question: 'Can beginners apply?',
    answer:
      'Absolutely. Most roles are designed for students, and we evaluate potential, motivation, and communication far more than years of experience. Every selection includes a supported trial contribution, so you can demonstrate your skills in a real, low-pressure setting before joining.',
  },
  {
    question: 'Can I apply for multiple roles?',
    answer:
      'Yes. You choose a preferred role and an optional secondary role in the application. During profile review we look at your skills and goals to find the best fit — many contributors start in one discipline and grow into another.',
  },
  {
    question: 'How much time is expected?',
    answer:
      'We ask for a consistent 8–12 hours per week plus one team sync. The exact rhythm depends on your role and academic calendar — we plan around exam seasons and deadlines together.',
  },
  {
    question: 'How are contributors selected?',
    answer:
      'Through a transparent pipeline: application, profile review, a friendly technical discussion, role assignment, and a trial contribution. You always know where you stand, and you receive clear feedback at every stage.',
  },
  {
    question: 'Will I receive a certificate?',
    answer:
      'Yes. Contributors who complete onboarding and maintain consistent contributions receive a verified ZYR0 contribution certificate with a unique credential ID that employers can check through the public verification portal.',
  },
  {
    question: 'Can I change roles later?',
    answer:
      'Yes. Once you are part of the team, you can shift focus based on interest and skill growth. Cross-functional moves are encouraged — they make better engineers and a stronger team.',
  },
];

/* ────────────────────────────────────────────────────────────────
   Application form options
   ──────────────────────────────────────────────────────────────── */

export const TEAM_SKILLS: string[] = [
  'React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Node.js', 'Python',
  'PostgreSQL', 'Supabase', 'REST APIs', 'GraphQL', 'Docker', 'Git & GitHub',
  'CI/CD', 'Testing', 'Playwright', 'Figma', 'UI/UX Design', 'Design Systems',
  'Machine Learning', 'NLP', 'Vector Databases', 'Cloud (AWS/GCP)', 'Linux',
  'Security', 'SEO', 'Technical Writing', 'Community Management', 'DevOps',
];

export const ACADEMIC_YEARS: string[] = [
  'Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate (Masters)', 'Other',
];

export const AVAILABILITY_OPTIONS: string[] = [
  '5–10 hours / week', '10–15 hours / week', '15–20 hours / week', '20+ hours / week',
];

export const GENDER_OPTIONS: string[] = [
  'Female', 'Male', 'Non-binary', 'Prefer not to say',
];

export const APPLICATION_STEPS: { id: string; label: string }[] = [
  { id: 'basics', label: 'Basics' },
  { id: 'links', label: 'Links & Resume' },
  { id: 'role', label: 'Role & Skills' },
  { id: 'commitment', label: 'Commitment' },
  { id: 'review', label: 'Review' },
];
