import {
  Code, GraduationCap, Sparkles, Briefcase,
  Shield, Zap, Globe, Layers, BarChart3, Users,
  ArrowRight, Check, CheckCircle2, ChevronRight, FileCode,
  School, BrainCircuit, Rocket, Lock, Laptop
} from 'lucide-react';

export interface ProductItem {
  id: string;
  name: string;
  badge?: string;
  headline: string;
  description: string;
  href: string;
  icon: any;
  color: string;
  features: string[];
}

export const productsList: ProductItem[] = [
  {
    id: 'studio',
    name: 'ZYR0 Studio',
    badge: 'AI Builder',
    headline: 'Prompt-to-production web apps in seconds',
    description: 'Autonomous AI website and full-stack application builder with visual canvas, live preview, and 1-click cloud deployment.',
    href: '/studio',
    icon: Code,
    color: 'rgb(56, 189, 248)',
    features: ['Natural language prompt-to-app', 'React 19 + Tailwind component stack', 'Instant Cloudflare/Vercel deploy', 'Full code export & Git sync']
  },
  {
    id: 'edu',
    name: 'ZYR0 Edu (School OS)',
    badge: 'Institution SaaS',
    headline: 'Modern operating system for schools & colleges',
    description: 'Unified educational administration platform managing admissions, biometric attendance, smart fee invoicing, grading, and timetables.',
    href: '/school',
    icon: School,
    color: 'rgb(129, 140, 248)',
    features: ['Multi-role portals (Admin, Teacher, Parent, Student)', 'Automated fee collections & receipting', 'AI timetable scheduler & substitutions', 'Live academic & attendance telemetry']
  },
  {
    id: 'research',
    name: 'ZYR0 Research (0-AI)',
    badge: 'Deep AI Agent',
    headline: 'Autonomous multi-step research with verified citations',
    description: 'Agentic intelligence engine that plans, executes, cross-verifies, and synthesizes exhaustive industry and academic reports.',
    href: '/research',
    icon: BrainCircuit,
    color: 'rgb(244, 63, 94)',
    features: ['Multi-agent recursive search loops', 'Verifiable source citations', 'LaTeX mathematical rendering', 'Export to PDF & Markdown']
  },
  {
    id: 'work',
    name: 'ZYR0 Work',
    badge: 'Internship Engine',
    headline: 'Project-driven internships & verifiable proof-of-work',
    description: 'Connect top student engineering talent with fast-growing companies through structured assignments and cryptographically verifiable certificates.',
    href: '/internships',
    icon: Briefcase,
    color: 'rgb(52, 211, 153)',
    features: ['GitHub-backed project delegations', 'PR-style split-pane review drawer', 'Cryptographic certificate verification', 'End-to-end talent pipeline']
  }
];

export const stats = [
  { number: '4', label: 'Flagship SaaS Products' },
  { number: '10K+', label: 'Active Users & Builders' },
  { number: '120+', label: 'Partner Companies & Schools' },
  { number: '99.9%', label: 'Platform Uptime' },
];

export const ecosystemSolutions = [
  {
    category: 'For Builders & Developers',
    title: 'From idea to live full-stack app in minutes.',
    description: 'Use ZYR0 Studio to generate clean, production-ready React apps with zero boilerplate and one-click cloud hosting.',
    icon: Rocket,
    href: '/studio',
  },
  {
    category: 'For Educational Institutions',
    title: 'Transform school management with intelligent automation.',
    description: 'Streamline attendance, fee collection, examinations, and communication with ZYR0 Edu/School OS.',
    icon: School,
    href: '/school',
  },
  {
    category: 'For Researchers & Analysts',
    title: 'Autonomous deep intelligence at your fingertips.',
    description: 'Conduct deep literature reviews, market intelligence, and code audits in minutes with 0-AI Research Agent.',
    icon: BrainCircuit,
    href: '/research',
  },
  {
    category: 'For Students & Companies',
    title: 'Bridge academic theory with real engineering experience.',
    description: 'Gain verifiable proof-of-work credentials and hire evaluated engineering interns with ZYR0 Work.',
    icon: Briefcase,
    href: '/internships',
  },
];

export const pricing = [
  {
    name: 'Starter / Student',
    price: '$0',
    period: 'free forever',
    description: 'Essential access across the ZYR0 ecosystem.',
    popular: false,
    features: [
      { text: 'Full access to ZYR0 Work & Internships', included: true },
      { text: 'Standard 0-AI Research queries', included: true },
      { text: 'ZYR0 Studio free tier (2 projects)', included: true },
      { text: 'Verifiable digital credentials', included: true },
      { text: 'Community support', included: true },
      { text: 'Custom domains & SLA', included: false },
    ],
  },
  {
    name: 'Builder Pro',
    price: '$24',
    period: '/month',
    description: 'For power users, creators, and developers.',
    popular: true,
    features: [
      { text: 'Unlimited ZYR0 Studio web apps & code export', included: true },
      { text: 'High-depth 0-AI Deep Research agent runs', included: true },
      { text: 'Custom domains & instant CDN deployment', included: true },
      { text: 'Priority API & GPU processing', included: true },
      { text: 'Priority 24/7 developer support', included: true },
      { text: 'Institution-wide multi-tenancy', included: false },
    ],
  },
  {
    name: 'Enterprise / School OS',
    price: 'Custom',
    period: 'annual license',
    description: 'For schools, universities, and enterprises.',
    popular: false,
    features: [
      { text: 'Full ZYR0 Edu / School OS deployment', included: true },
      { text: 'Unlimited students, teachers & parent accounts', included: true },
      { text: 'Biometric & fee gateway integrations', included: true },
      { text: 'Dedicated company internship portal & ATS', included: true },
      { text: 'Custom SLA, dedicated onboarding & support', included: true },
      { text: 'SOC 2 compliant security & dedicated cloud', included: true },
    ],
  },
];

export const faqItems = [
  {
    question: 'What is the ZYR0 platform?',
    answer: 'ZYR0 is a multi-product AI and SaaS company providing four interconnected solutions: ZYR0 Studio (AI website/app builder), ZYR0 Edu / School OS (educational institution management), ZYR0 Research / 0-AI (autonomous deep research agent), and ZYR0 Work (project-based internships and verified credentials).'
  },
  {
    question: 'Can I use ZYR0 products individually?',
    answer: 'Yes! Each ZYR0 product (Studio, School OS, Research Agent, and Work) functions both as a standalone powerhouse and as part of the interconnected ZYR0 ecosystem.'
  },
  {
    question: 'How do I get started with ZYR0 Studio?',
    answer: 'Visit the ZYR0 Studio page (/studio) to try the interactive prompt builder, view sample generated web applications, and join the builder waitlist for immediate early access.'
  },
  {
    question: 'How does School OS onboarding work for institutions?',
    answer: 'Schools, colleges, and academies can book an institutional walkthrough through /school. Our team configures your custom domain, imports student/staff data, and provides end-to-end training.'
  },
  {
    question: 'Is ZYR0 Work still available for students and companies?',
    answer: 'Absolutely. ZYR0 Work remains the premier project-driven internship platform with verified GitHub task workflows, mentor code reviews, and tamper-proof digital certificates.'
  },
  {
    question: 'How do I contact the team or book a custom enterprise demo?',
    answer: 'You can reach us at support@zyroo.org or visit our Contact page (/contact) to book a live demo with our product architects.'
  }
];

export const footerNav = {
  products: [
    { label: 'ZYR0 Studio', href: '/studio' },
    { label: 'ZYR0 Edu', href: '/school' },
    { label: 'ZYR0 Research', href: '/research' },
    { label: 'ZYR0 Work', href: '/internships' },
    { label: 'Browse Internships', href: '/internships/browse' },
  ],
  resources: [
    { label: 'Help Center', href: '/help' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Blog', href: '/blog', badge: 'Soon' },
    { label: 'Verify Certificate', href: '/verify' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/careers' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ]
};
