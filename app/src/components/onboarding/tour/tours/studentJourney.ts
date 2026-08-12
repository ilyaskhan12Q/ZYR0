import {
  Award, Bookmark, Briefcase, ClipboardList, FileCheck, FileText,
  FolderOpen, Home, MessageSquare, TrendingUp, User, UserCog,
} from 'lucide-react';
import type { TourDefinition } from '../TourStep';

/**
 * First-run guided tour for the student dashboard.
 *
 * Teaches the internship journey (discover → apply → work → complete)
 * instead of explaining every navigation item. Steps target sidebar
 * nav links via `data-tour` attributes on the links in DashboardLayout.
 */
export const studentJourneyTour: TourDefinition = {
  id: 'student-journey',
  steps: [
    {
      id: 'nav-dashboard',
      icon: Home,
      title: 'Your internship home',
      body: 'See what\u2019s happening across your journey at a glance.',
      target: 'nav-dashboard',
      placement: 'right',
    },
    {
      id: 'nav-internships',
      icon: FolderOpen,
      title: 'Find your opportunity',
      body: 'Explore internships and find opportunities that match your interests.',
      target: 'nav-internships',
      placement: 'right',
    },
    {
      id: 'nav-applications',
      icon: FileCheck,
      title: 'Track your applications',
      body: 'Follow every application you send from one place.',
      chip: 'Applying with a team? That\u2019s under Team Applications.',
      target: 'nav-applications',
      placement: 'right',
    },
    {
      id: 'nav-workspace',
      icon: Briefcase,
      title: 'Your work starts here',
      body: 'Once you\u2019re selected, your workspace becomes your main place for internship work.',
      target: 'nav-workspace',
      placement: 'right',
    },
    {
      id: 'nav-tasks',
      icon: ClipboardList,
      title: 'Build. Submit. Learn.',
      body: 'Your tasks are where the practical experience happens \u2014 complete your work and submit it for review.',
      target: 'nav-tasks',
      placement: 'right',
    },
    {
      id: 'nav-progress',
      icon: TrendingUp,
      title: 'See how you\u2019re progressing',
      body: 'Track what you\u2019ve completed and what still needs your attention.',
      target: 'nav-progress',
      placement: 'right',
    },
    {
      id: 'nav-certificates',
      icon: Award,
      title: 'Your experience, documented',
      body: 'After your internship, your certificates and official documents are available here.',
      chip: 'Offer Letters and Portfolio are right next door.',
      target: 'nav-certificates',
      placement: 'right',
    },
    {
      id: 'journey-summary',
      variant: 'center',
    },
  ],
  summary: {
    title: 'There\u2019s more to explore',
    body: 'A few more places worth knowing about.',
    items: [
      { label: 'Saved', body: 'Keep opportunities you want to revisit.', icon: Bookmark },
      { label: 'Messages', body: 'Stay connected with your team.', icon: MessageSquare },
      { label: 'Offer Letters', body: 'Access your internship offers.', icon: FileText },
      { label: 'Portfolio', body: 'Showcase your work.', icon: User },
      { label: 'Profile', body: 'Keep your professional information up to date.', icon: UserCog },
    ],
  },
};