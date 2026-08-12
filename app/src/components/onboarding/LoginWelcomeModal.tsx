import { motion } from 'framer-motion';
import { ArrowRight, Award, Briefcase, CheckCircle2, Compass, FileCheck, Search, X } from 'lucide-react';
import type { UserRole } from '@/lib/database.types';

interface LoginWelcomeModalProps {
  open: boolean;
  role: UserRole;
  firstName?: string;
  onAction: (path: string) => void;
  onStartTour?: () => void;
  onDismiss: () => void;
}

/** Subtle Explore → Apply → Build → Complete strip for the student welcome. */
const JOURNEY_STEPS = [
  { label: 'Explore', icon: Search },
  { label: 'Apply', icon: FileCheck },
  { label: 'Build', icon: Briefcase },
  { label: 'Complete', icon: Award },
];

const stripEmoji = (text: string) => text.replace(/^\p{Extended_Pictographic}\s*/u, '');

function roleCopy(role: UserRole, firstName?: string) {
  if (role === 'student') {
    return {
      title: `Welcome to your ZYR0 workspace${firstName ? `, ${firstName}` : ''}.`,
      headline: 'Everything you need for your internship journey, from finding an opportunity to completing real work, is here.',
      highlights: [] as string[],
      primary: { label: 'Show me around', path: '' },
      secondary: { label: 'Skip for now', path: '' },
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
        '📜 Issue official offer letters & task evaluations',
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
        '🎓 Grade final internship achievements',
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
      '✉️ Inbox & operational management',
    ],
    primary: { label: 'Open Admin Dashboard', path: '/admin/dashboard' },
    secondary: { label: 'Manage Platform Users', path: '/admin/users' },
  };
}

export default function LoginWelcomeModal({ open, role, firstName, onAction, onStartTour, onDismiss }: LoginWelcomeModalProps) {
  if (!open) return null;
  const copy = roleCopy(role, firstName);
  const isStudent = role === 'student';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
        className="absolute inset-0 bg-black/35"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-10"
      >
        <button
          onClick={onDismiss}
          aria-label="Close welcome dialog"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5">
            {isStudent ? (
              <Compass className="w-5 h-5 text-accent" />
            ) : (
              <Award className="w-5 h-5 text-accent" />
            )}
          </div>

          <h3 className="text-xl font-bold tracking-tight text-foreground">{copy.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">
            {isStudent ? copy.headline : copy.body ?? copy.headline}
          </p>

          {/* Journey strip — students only */}
          {isStudent && (
            <div className="mt-6 flex items-center gap-2.5">
              {JOURNEY_STEPS.map((step, idx) => (
                <div key={step.label} className="flex items-center gap-2.5">
                  {idx > 0 && <span className="w-4 h-px bg-border" />}
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <step.icon className="w-3.5 h-3.5 text-accent/70" />
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Value highlights — non-students only */}
          {!isStudent && copy.highlights.length > 0 && (
            <div className="bg-muted/40 border border-border/60 rounded-xl p-4 mt-6 space-y-2.5">
              <ul className="space-y-2 text-xs text-foreground font-medium">
                {copy.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{stripEmoji(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5 mt-7">
            {isStudent && onStartTour && (
              <button
                onClick={onStartTour}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                {copy.primary.label}
              </button>
            )}
            {!isStudent && (
              <button
                onClick={() => onAction(copy.primary.path)}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                {copy.primary.label}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={isStudent && onStartTour ? onDismiss : () => onAction(copy.secondary.path)}
              className="w-full flex items-center justify-center gap-2 border border-border hover:bg-muted px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer text-foreground"
            >
              {isStudent ? 'Skip for now' : copy.secondary.label}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}