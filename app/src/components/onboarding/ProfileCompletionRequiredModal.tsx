import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ArrowRight, X, Zap, CheckCircle2, UserCheck } from 'lucide-react';

interface ProfileCompletionRequiredModalProps {
  open: boolean;
  onClose: () => void;
  onCompleteProfile: () => void;
  requirements: string[];
  percentage: number;
  actionTitle?: string;
}

export default function ProfileCompletionRequiredModal({
  open,
  onClose,
  onCompleteProfile,
  requirements,
  percentage,
  actionTitle = 'Apply for Internships'
}: ProfileCompletionRequiredModalProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-lg bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-amber-500/10 via-accent/10 to-accent/5 px-6 sm:px-8 pt-8 pb-6 border-b border-border/60 relative">
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300/40">
                  Profile Completion Required
                </span>
                <h3 className="text-xl font-bold text-foreground mt-1">Unlock 1-Click Applications</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To <span className="font-semibold text-foreground">{actionTitle}</span>, you must complete your profile. Build your profile once and seamlessly apply to any company on ZYR0 instantly.
            </p>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Progress Bar */}
            <div className="bg-muted/40 border border-border/60 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-accent" /> Profile Verification Status
                </span>
                <span className="text-accent">{percentage}% Completed</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Remaining Requirements List */}
            {requirements.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Remaining Items Needed Before Applying:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {requirements.map((req, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/15 text-xs font-medium text-foreground"
                    >
                      <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      <span className="truncate">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Benefit Box */}
            <div className="flex items-start gap-3 p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs text-muted-foreground">
              <Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong className="text-foreground">Why this matters:</strong> Complete profiles build recruiter trust and bypass manual application screening, giving you priority placement.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onClose}
                className="order-2 sm:order-1 flex-1 px-4 py-3 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors cursor-pointer text-center"
              >
                Maybe Later
              </button>
              <button
                onClick={onCompleteProfile}
                className="order-1 sm:order-2 flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-lg shadow-accent/20"
              >
                Complete Profile Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
