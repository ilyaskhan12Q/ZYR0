import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
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
    <div className="bg-card rounded-xl border border-border shadow-2xs p-6 space-y-5">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="font-semibold text-foreground text-sm tracking-tight">Subscription & Plan</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active workspace tier, compute priority lane, and platform entitlements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-muted border border-border px-2.5 py-0.5 rounded-md">
            <span className={`w-1.5 h-1.5 rounded-full ${planMeta.isPaid ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
            <span>Active</span>
          </span>
          <span className="text-xs font-mono font-medium text-muted-foreground px-2 py-0.5 rounded border border-border bg-card">
            {planMeta.badge}
          </span>
        </div>
      </div>

      {/* Main Spec Block */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h4 className="text-xl font-bold tracking-tight text-foreground">
              {planMeta.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
              {planMeta.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
            <button
              type="button"
              onClick={() => {
                setInitialPlan(planMeta.tier === 'go' ? 'plus' : 'go');
                setUpgradeOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>{planMeta.isPaid ? 'Change Plan' : 'Upgrade Plan'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setStatusOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted font-medium text-xs text-foreground transition-colors cursor-pointer"
            >
              Details
            </button>
          </div>
        </div>

        {planMeta.isManualGrant && (
          <div className="p-2.5 rounded-lg bg-muted/50 border border-border flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-foreground shrink-0" />
            <span>Complimentary platform grant assigned by administration.</span>
          </div>
        )}

        {/* Structured Entitlements Specification Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          {planMeta.entitlements.map((spec, i) => (
            <div key={i} className="p-3 rounded-lg border border-border bg-muted/20">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {spec.label}
              </p>
              <p className="text-xs font-semibold text-foreground mt-1">
                {spec.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer link */}
      <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>Need higher compute allocations or institutional seats?</span>
        <Link
          to="/pricing"
          className="text-foreground hover:underline font-medium inline-flex items-center gap-1"
        >
          <span>Compare all tiers</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
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
