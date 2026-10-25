import type React from 'react';
import {
  Code, School, BrainCircuit, Briefcase, Compass,
  HelpCircle, MessageCircle, BookOpen, BadgeCheck, Shield, FileText, Cookie,
  Building2, Mail, CreditCard, Users,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ElementType;
  badge?: string;
}

export interface ProductNavItem {
  id: string;
  name: string;
  href: string;
  description: string;
  badge?: string;
  logo?: string;
  icon?: React.ElementType;
}

export interface ProductMegaColumn {
  title: string;
  items: ProductNavItem[];
}

// Single source of truth for every nav/footer link.
// All routes verified live in App.tsx.
export const productsNav: ProductNavItem[] = [
  {
    id: 'studio',
    name: 'ZYR0 Studio',
    href: '/studio',
    description: 'Autonomous AI website & full-stack app builder with one-click deploy.',
    logo: '/logos/studio.png',
    icon: Code,
    badge: 'Popular',
  },
  {
    id: 'research',
    name: 'ZYR0 Research',
    href: '/research',
    description: 'Autonomous deep research agent with verified multi-source citations.',
    logo: '/logos/research.png',
    icon: BrainCircuit,
  },
  {
    id: 'toolhub',
    name: 'ZYR0 ToolHub',
    href: '/tools',
    description: 'Curated directory of AI utilities, community skills, and dev tools.',
    icon: Compass,
    badge: 'New',
  },
  {
    id: 'edu',
    name: 'ZYR0 Edu',
    href: '/school',
    description: 'Modern operating system for schools and academic institutions.',
    logo: '/logos/schoolOS.png',
    icon: School,
  },
  {
    id: 'work',
    name: 'ZYR0 Work',
    href: '/internships',
    description: 'Project-driven internships with verifiable proof-of-work certificates.',
    icon: Briefcase,
  },
  {
    id: 'employers',
    name: 'For Employers',
    href: '/join#employers',
    description: 'Launch internship cohorts, track milestones, and issue certificates.',
    icon: Building2,
    badge: 'Hiring',
  },
  {
    id: 'mentors',
    name: 'For Mentors',
    href: '/join#mentors',
    description: 'Guide emerging engineers, review projects, and build leadership proof.',
    icon: Users,
  },
];

// Mega-menu layout: 3 categorized columns with titles + 1 live preview card
export const productsMegaColumns: ProductMegaColumn[] = [
  {
    title: 'AI & Platforms',
    items: [productsNav[0], productsNav[1], productsNav[2]],
  },
  {
    title: 'Education & Career',
    items: [productsNav[3], productsNav[4]],
  },
  {
    title: 'Partners & Programs',
    items: [productsNav[5], productsNav[6]],
  },
];

export const resourcesNav: NavItem[] = [
  { label: 'Pricing', href: '/pricing', icon: CreditCard },
  { label: 'Billing Help', href: '/billing-help', icon: CreditCard },
  { label: 'ToolHub', href: '/tools', icon: Compass, badge: 'New' },
  { label: 'Help Center', href: '/help', icon: HelpCircle },
  { label: 'FAQ', href: '/faq', icon: MessageCircle },
  { label: 'Blog', href: '/blog', icon: BookOpen },
  { label: 'Verify Certificate', href: '/verify', icon: BadgeCheck },
  { label: 'Privacy Policy', href: '/privacy', icon: Shield },
  { label: 'Terms of Service', href: '/terms', icon: FileText },
  { label: 'Cookie Policy', href: '/cookies', icon: Cookie },
];

export const companyNav: NavItem[] = [
  { label: 'About', href: '/about', icon: Building2 },
  { label: 'Contact', href: '/contact', icon: Mail },
  { label: 'Careers', href: '/careers', icon: Briefcase },
];

export const footerNav = {
  products: [
    { label: 'ZYR0 Studio', href: '/studio' },
    { label: 'ZYR0 Edu', href: '/school' },
    { label: 'ZYR0 Research', href: '/research' },
    { label: 'ZYR0 Work', href: '/internships' },
    { label: 'ZYR0 ToolHub', href: '/tools' },
    { label: 'Pricing & Plans', href: '/pricing' },
    { label: 'Browse Internships', href: '/internships/browse' },
  ],
  students: [
    { label: 'Browse Internships', href: '/internships/browse' },
    { label: 'My Applications', href: '/student/applications' },
    { label: 'Workspace', href: '/student/workspace' },
    { label: 'Certificates', href: '/student/certificates' },
    { label: 'Verify Certificate', href: '/verify' },
  ],
  companies: [
    { label: 'Partner Onboarding', href: '/join' },
    { label: 'Post Internship', href: '/company/internships/new' },
    { label: 'Dashboard', href: '/company/dashboard' },
    { label: 'Browse Companies', href: '/companies' },
    { label: 'Careers', href: '/careers' },
  ],
  resources: [
    { label: 'Help Center', href: '/help' },
    { label: 'Billing Help', href: '/billing-help' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Blog', href: '/blog' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};
