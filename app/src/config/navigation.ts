import type React from 'react';
import {
  Code, School, BrainCircuit, Briefcase, Compass,
  HelpCircle, MessageCircle, BookOpen, BadgeCheck, Shield, FileText, Cookie,
  Building2, Mail,
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

// Single source of truth for every nav/footer link.
// Only routes verified live in App.tsx — no /cookie, no #pricing, no /security.
export const productsNav: ProductNavItem[] = [
  {
    id: 'studio',
    name: 'ZYR0 Studio',
    href: '/studio',
    description: 'Autonomous AI website & full-stack app builder with one-click deploy.',
    badge: 'AI Builder',
    logo: '/logos/studio.png',
    icon: Code,
  },
  {
    id: 'edu',
    name: 'ZYR0 Edu',
    href: '/school',
    description: 'Modern operating system for schools and colleges.',
    badge: 'Institutions',
    logo: '/logos/schoolOS.png',
    icon: School,
  },
  {
    id: 'research',
    name: 'ZYR0 Research',
    href: '/research',
    description: 'Autonomous deep research with verified citations.',
    badge: 'Deep AI',
    logo: '/logos/research.png',
    icon: BrainCircuit,
  },
  {
    id: 'work',
    name: 'ZYR0 Work',
    href: '/internships',
    description: 'Project-driven internships with verifiable certificates.',
    badge: 'Internships',
    icon: Briefcase,
  },
  {
    id: 'toolhub',
    name: 'ZYR0 ToolHub',
    href: '/tools',
    description: 'Curated directory of AI utilities and developer tools.',
    badge: 'Directory',
    icon: Compass,
  },
];

export const resourcesNav: NavItem[] = [
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
    { label: 'Post Internship', href: '/company/internships/new' },
    { label: 'Dashboard', href: '/company/dashboard' },
    { label: 'Browse Companies', href: '/companies' },
    { label: 'Careers', href: '/careers' },
  ],
  resources: [
    { label: 'Help Center', href: '/help' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Blog', href: '/blog' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};
