import { motion } from 'framer-motion';
import { ArrowRight, Rocket, Sparkles, ShieldCheck, Zap, X, CheckCircle2, Compass } from 'lucide-react';
import type { UserRole } from '@/lib/database.types';

interface LoginWelcomeModalProps {
  open: boolean;
  role: UserRole;
  firstName?: string;
  onAction: (path: string) => void;
  onStartTour?: () => void;
  onDismiss: () => void;
}

function roleCopy(role: UserRole, firstName?: string) {
  if (role === 'student') {
    return {
      title: `Welcome to ZYR0${firstName ? `, ${firstName}` : ''}!`,
      headline: 'Build Your Profile Once — Apply Anywhere in 1-Click',
      body: 'Complete your candidate profile details once (resume, education, skills, bio) and instantly apply to top internship opportunities on ZYR0 with a single click. No repetitive form entries required.',
      highlights: [
        '⚡ Instant 1-Click applications to all companies',
        '🎯 Verified candidate status for recruiter lookups',
        '💼 Direct submission to hiring managers & mentors'
      ],
      primary: { label: 'Build Your Profile', path: '/student/profile' },
      secondary: { label: 'Browse Internships', path: '/student/internships' },
    };
  }
  if (role === 'company') {
    return {
      title: `Welcome to ZYR0${firstName ? `, ${firstName}` : ''}!`,
      headline: 'Your hiring hub is ready',
      body: 'Post an internship to start receiving applications, then complete your company profile to build trust with top student candidates.',
      highlights: [
        '📢 Post project-based internship roles',
        '👥 Review verified student profiles & portfolios',
        '📜 Issue official offer letters & task evaluations'
      ],
      primary: { label: 'Post an Internship', path: '/company/internships/new' },
      secondary: { label: 'Complete Company Profile', path: '/company/profile' },
    };
  }
  if (role === 'mentor') {
    return {
      title: `Welcome to ZYR0${firstName ? `, ${firstName}` : ''}!`,
      headline: 'Your mentorship workspace is ready',
      body: 'Review assigned interns and project submissions, then complete your mentor profile to showcase your domain expertise.',
      highlights: [
        '📁 Review student GitHub repositories & code',
        '💬 Provide structured task feedback & approvals',
        '🎓 Grade final internship achievements'
      ],
      primary: { label: 'View Assigned Interns', path: '/mentor/interns' },
      secondary: { label: 'Complete Mentor Profile', path: '/mentor/profile' },
    };
  }
  return {
    title: `Welcome to ZYR0${firstName ? `, ${firstName}` : ''}!`,
    headline: 'Your admin dashboard is ready',
    body: 'Explore the ZYR0 platform management portal to oversee users, companies, internships, and platform analytics.',
    highlights: [
      '📊 Platform-wide metrics & telemetry',
      '🏢 Company & user account verification',
      '✉️ Inbox & operational management'
    ],
    primary: { label: 'Open Admin Dashboard', path: '/admin/dashboard' },
    secondary: { label: 'Manage Platform Users', path: '/admin/users' },
  };
}

export default function LoginWelcomeModal({ open, role, firstName, onAction, onStartTour, onDismiss }: LoginWelcomeModalProps) {
  if (!open) return null;
  const copy = roleCopy(role, firstName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative w-full max-w-lg bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden z-10"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-accent via-accent/90 to-blue-600 px-6 sm:px-8 pt-8 pb-6 text-white relative">
          <button
            onClick={onDismiss}
            aria-label="Close welcome dialog"
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center mb-4 text-white shadow-inner">
            <Rocket className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">{copy.title}</h3>
          <p className="text-sm text-white/90 font-medium mt-1">{copy.headline}</p>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {copy.body}
          </p>

          {/* Value Highlights */}
          {copy.highlights && (
            <div className="bg-muted/40 border border-border/60 rounded-xl p-4 space-y-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Why Complete Your Profile First?
              </p>
              <ul className="space-y-2 text-xs text-foreground font-medium">
                {copy.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-1">
            {onStartTour && (
              <button
                onClick={onStartTour}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-blue-600 hover:from-accent/90 hover:to-blue-600/90 text-white px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-accent/20 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                Start Guided Tour
              </button>
            )}

            <button
              onClick={() => onAction(copy.primary.path)}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-accent/20 cursor-pointer"
            >
              {copy.primary.label}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onAction(copy.secondary.path)}
              className="w-full flex items-center justify-center gap-2 border border-border hover:bg-muted px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer text-foreground"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              {copy.secondary.label}
            </button>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onDismiss}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Skip to Dashboard for now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
