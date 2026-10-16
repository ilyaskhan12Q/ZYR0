import React from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
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
      <DialogContent className="max-w-md p-6 border border-border bg-card text-foreground rounded-2xl shadow-xl space-y-5">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-muted border border-border px-2.5 py-0.5 rounded-md">
              <span className={`w-1.5 h-1.5 rounded-full ${info.isPaid ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
              <span>Active Status</span>
            </span>
            <span className="text-xs font-mono font-medium text-muted-foreground px-2 py-0.5 rounded border border-border bg-card">
              {info.badge}
            </span>
          </div>

          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {info.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {info.description}
          </DialogDescription>
        </DialogHeader>

        {isManualGrant && (
          <div className="p-2.5 rounded-lg bg-muted/50 border border-border flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-foreground shrink-0" />
            <span>Complimentary platform grant assigned by administration.</span>
          </div>
        )}

        {/* Structured Entitlements List */}
        <div className="space-y-2 pt-1">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Active Entitlements
          </p>
          <div className="divide-y divide-border rounded-lg border border-border bg-muted/20">
            {info.entitlements.map((spec, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 text-xs">
                <span className="text-muted-foreground">{spec.label}</span>
                <span className="font-medium text-foreground">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border space-y-3">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onOpenUpgrade();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-foreground text-background font-medium text-xs transition-opacity hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
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
