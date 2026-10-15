import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { useActivePlan } from '@/hooks/useActivePlan';
import UpgradePlanModal from './UpgradePlanModal';
import PlanStatusModal from './PlanStatusModal';
import type { BillingInterval } from './BillingToggle';

export default function SubscriptionPlanCard() {
  const planMeta = useActivePlan();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('yearly');
  const [initialPlan, setInitialPlan] = useState<'go' | 'plus'>('plus');

  return (
    <div className="bg-card rounded-xl border border-border shadow-xs p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div>
          <h3 className="font-semibold text-foreground text-base">Subscription & Plan</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your current platform tier, reasoning compute priority, and feature entitlements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${planMeta.badgeColor}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {planMeta.badge}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border/60">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h4 className={`text-xl font-bold tracking-tight ${planMeta.color}`}>
              {planMeta.name}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
            {planMeta.description}
          </p>
          {planMeta.isManualGrant && (
            <div className="inline-flex items-center gap-2 mt-1 px-2.5 py-1 rounded-lg bg-accent/10 text-accent text-xs border border-accent/20">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Complimentary platform grant assigned by administration.</span>
            </div>
          )}
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setInitialPlan(planMeta.tier === 'go' ? 'plus' : 'go');
              setUpgradeOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-accent text-accent-foreground font-semibold text-xs transition-opacity hover:opacity-90 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>{planMeta.isPaid ? 'Change Plan' : 'Upgrade Plan'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <Link
            to="/pricing"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <span>Compare all features</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <PlanStatusModal
        open={statusOpen}
        onOpenChange={setStatusOpen}
        onOpenUpgrade={() => {
          setInitialPlan('plus');
          setUpgradeOpen(true);
        }}
        plan={planMeta.tier}
        isManualGrant={planMeta.isManualGrant}
      />

      <UpgradePlanModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        initialPlan={initialPlan}
        interval={billingInterval}
        onIntervalChange={setBillingInterval}
      />
    </div>
  );
}
