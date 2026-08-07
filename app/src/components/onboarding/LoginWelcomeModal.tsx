import { motion } from 'framer-motion';
import { ArrowRight, Rocket, Sparkles, Timer, X } from 'lucide-react';
import type { UserRole } from '@/lib/database.types';

interface LoginWelcomeModalProps {
  open: boolean;
  role: UserRole;
  firstName?: string;
  onAction: (path: string) => void;
  onDismiss: () => void;
}

function roleCopy(role: UserRole, firstName?: string) {
  if (role === 'student') {
    return {
      title: `Welcome to ZYR0${firstName ? `, ${firstName}` : ''}!`,
      headline: 'Your career accelerator is ready',
      body: 'Start by applying to internships that match your skills, then complete your profile so recruiters can find you.',
      primary: { label: 'Apply for an Internship', path: '/student/internships' },
      secondary: { label: 'Complete Your Profile', path: '/student/profile', note: 'Takes less than 2 minutes' },
    };
  }
  if (role === 'company') {
    return {
      title: `Welcome to ZYR0${firstName ? `, ${firstName}` : ''}!`,
      headline: 'Your hiring hub is ready',
      body: 'Post an internship to start receiving applications, then complete your company profile to build trust with candidates.',
      primary: { label: 'Post an Internship', path: '/company/internships/new' },
      secondary: { label: 'Complete Company Profile', path: '/company/profile', note: 'Takes less than 2 minutes' },
    };
  }
  if (role === 'mentor') {
    return {
      title: `Welcome to ZYR0${firstName ? `, ${firstName}` : ''}!`,
      headline: 'Your mentorship workspace is ready',
      body: 'Review assigned interns and tasks, then complete your profile to reflect your expertise.',
      primary: { label: 'View Your Interns', path: '/mentor/interns' },
      secondary: { label: 'Complete Your Profile', path: '/mentor/profile', note: 'Takes less than 2 minutes' },
    };
  }
  return {
    title: `Welcome to ZYR0${firstName ? `, ${firstName}` : ''}!`,
    headline: 'Your dashboard is ready',
    body: 'Explore the ZYR0 platform to manage users, companies, and internships.',
    primary: { label: 'Open Dashboard', path: '/admin/dashboard' },
    secondary: { label: 'Manage Platform', path: '/admin/users', note: '' },
  };
}

export default function LoginWelcomeModal({ open, role, firstName, onAction, onDismiss }: LoginWelcomeModalProps) {
  if (!open) return null;
  const copy = roleCopy(role, firstName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-accent to-accent/80 px-6 sm:px-8 pt-8 pb-6 text-white relative">
          <button
            onClick={onDismiss}
            aria-label="Close welcome dialog"
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center mb-4">
            <Rocket className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold">{copy.title}</h3>
          <p className="text-sm text-white/80 mt-1">{copy.headline}</p>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8">
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">{copy.body}</p>

          <button
            onClick={() => onAction(copy.primary.path)}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-accent/10"
          >
            {copy.primary.label}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onAction(copy.secondary.path)}
            className="mt-3 w-full flex items-center justify-center gap-2 border border-border hover:bg-muted px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            {copy.secondary.label}
          </button>

          {copy.secondary.note && (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Timer className="w-3.5 h-3.5" />
              {copy.secondary.note}
            </p>
          )}

          <button
            onClick={onDismiss}
            className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </motion.div>
    </div>
  );
}
