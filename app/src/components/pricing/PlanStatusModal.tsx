import React from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import type { PlanTier } from '@/lib/database.types';
import { PLAN_DETAILS } from '@/hooks/useActivePlan';

interface PlanStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenUpgrade: () => void;
  plan: PlanTier | string;
  isManualGrant?: boolean;
}

export default function PlanStatusModal({
  open,
  onOpenChange,
  onOpenUpgrade,
  plan,
  isManualGrant,
}: PlanStatusModalProps) {
  const normalizedPlan = ((plan || 'free').toLowerCase() in PLAN_DETAILS ? plan.toLowerCase() : 'free') as PlanTier;
  const info = PLAN_DETAILS[normalizedPlan] || PLAN_DETAILS.free;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 border border-border bg-card text-foreground rounded-3xl shadow-2xl space-y-5">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${info.badgeColor}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {info.badge}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active
            </span>
          </div>

          <DialogTitle className={`text-2xl font-bold tracking-tight ${info.color}`}>
            {info.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {info.description}
          </DialogDescription>
        </DialogHeader>

        {isManualGrant && (
          <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 flex items-center gap-2.5 text-xs text-accent">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Complimentary platform grant assigned by administration.</span>
          </div>
        )}

        <div className="pt-2 border-t border-border space-y-3">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onOpenUpgrade();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-accent text-accent-foreground font-semibold text-xs transition-opacity hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <span>{normalizedPlan === 'free' ? 'Upgrade Plan' : 'Change Plan'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center justify-between text-xs px-1 text-muted-foreground">
            <Link
              to="/pricing"
              onClick={() => onOpenChange(false)}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span>Compare all features</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              to="/billing-help"
              onClick={() => onOpenChange(false)}
              className="hover:text-foreground transition-colors"
            >
              Billing help
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
