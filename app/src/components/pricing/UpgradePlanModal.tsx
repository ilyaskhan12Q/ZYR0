import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Check,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Loader2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import type { BillingInterval } from './BillingToggle';

interface UpgradePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPlan: 'go' | 'plus';
  interval: BillingInterval;
  onIntervalChange: (interval: BillingInterval) => void;
}

const PLAN_DETAILS = {
  go: {
    id: 'go',
    name: 'ZYR0 GO',
    badge: 'Creator Boost',
    monthlyPrice: '$4.99',
    yearlyPrice: '$3.99',
    yearlyBilled: '$47.90/year (Save ~20%)',
    description: 'Faster research throughput, multi-source exports, and priority candidate status.',
    highlights: [
      '5× faster synthesis & expanded context capacity',
      'One-click Markdown & PDF research report downloads',
      'Direct citation exports (arXiv, PubMed, OpenAlex)',
      'Highlighted candidate status on active company listings',
      'Early preview of Studio architecture component presets',
    ],
  },
  plus: {
    id: 'plus',
    name: 'ZYR0 PLUS',
    badge: 'Most Popular',
    monthlyPrice: '$9.99',
    yearlyPrice: '$7.99',
    yearlyBilled: '$95.90/year (Save ~20%)',
    description: 'Deep multi-step reasoning, zero queue delays, and VIP Studio code builder access.',
    highlights: [
      'Deep reasoning AI models for complex multi-step queries',
      'Zero queue delays: dedicated priority compute lane',
      'Persistent research vault with cross-session memory',
      'VIP Studio builder: autonomous prompt-to-app generator',
      'Full React 19 + TypeScript + Tailwind code exports',
      'Unified ecosystem pass: covers all current & upcoming tools',
    ],
  },
};

export default function UpgradePlanModal({
  open,
  onOpenChange,
  initialPlan,
  interval,
  onIntervalChange,
}: UpgradePlanModalProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'go' | 'plus'>(initialPlan);
  const [loading, setLoading] = useState(false);

  // Sync initialPlan when modal opens
  React.useEffect(() => {
    if (open) {
      setSelectedPlan(initialPlan);
    }
  }, [open, initialPlan]);

  const activePlanInfo = PLAN_DETAILS[selectedPlan];
  const isYearly = interval === 'yearly';
  const priceDisplay = isYearly ? activePlanInfo.yearlyPrice : activePlanInfo.monthlyPrice;
  const billingSubtext = isYearly ? activePlanInfo.yearlyBilled : 'Billed monthly. Cancel anytime.';

  const handleCheckout = async () => {
    setLoading(true);

    // Check for optional Stripe Payment Link in environment variables
    const envKey = `VITE_STRIPE_PAYMENT_LINK_${selectedPlan.toUpperCase()}_${interval.toUpperCase()}`;
    const stripePaymentLink = (import.meta as any).env?.[envKey];

    if (stripePaymentLink) {
      const emailParam = user?.email ? `?prefilled_email=${encodeURIComponent(user.email)}` : '';
      window.location.href = `${stripePaymentLink}${emailParam}`;
      return;
    }

    // Default: Simulate instant sandbox upgrade & persist locally
    setTimeout(() => {
      try {
        localStorage.setItem('zyro_active_plan', selectedPlan);
        localStorage.setItem('zyro_active_interval', interval);
      } catch {
        /* ignore */
      }
      setLoading(false);
      onOpenChange(false);
      toast.success(
        `Upgraded to ${activePlanInfo.name}! Your enhanced capabilities and compute priority are now active.`,
        {
          duration: 5000,
          description: `Account: ${user?.email || 'Logged in user'} (${isYearly ? 'Annual' : 'Monthly'} billing)`,
        }
      );
    }, 700);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border border-border bg-card text-foreground rounded-3xl shadow-2xl">
        {/* Top Decorative Header */}
        <div className="p-6 sm:p-7 border-b border-border bg-muted/40">
          <DialogHeader className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-accent/10 border border-accent/25 text-accent font-semibold">
                <Sparkles className="w-3 h-3" />
                {activePlanInfo.badge}
              </div>

              {/* Quick Plan Switcher Pills inside Modal */}
              <div className="inline-flex items-center p-0.5 rounded-xl border border-border bg-card shadow-xs">
                <button
                  type="button"
                  onClick={() => setSelectedPlan('go')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    selectedPlan === 'go'
                      ? 'bg-foreground text-background shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  GO
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlan('plus')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    selectedPlan === 'plus'
                      ? 'bg-accent text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  PLUS
                </button>
              </div>
            </div>

            <div>
              <DialogTitle className="text-2xl font-serif font-normal text-foreground">
                Upgrade to {activePlanInfo.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {activePlanInfo.description}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* Price & Interval Selector */}
          <div className="p-4 rounded-2xl border border-border bg-muted/30 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {priceDisplay}
                </span>
                <span className="text-xs text-muted-foreground font-medium">/month</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{billingSubtext}</p>
            </div>

            {/* Monthly / Yearly Switch */}
            <div className="flex items-center p-1 rounded-xl border border-border bg-card">
              <button
                type="button"
                onClick={() => onIntervalChange('monthly')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  !isYearly
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => onIntervalChange('yearly')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  isYearly
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>Yearly</span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/20 text-white">
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* Account Confirmation */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-muted-foreground">Upgrading account:</span>
            <span className="font-mono font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border">
              {user?.email || 'Logged In Account'}
            </span>
          </div>

          {/* Included Superpowers Checklist */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold block">
              What gets unlocked immediately:
            </span>
            <ul className="space-y-2">
              {activePlanInfo.highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-foreground/90">
                  <Check className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Defensible Terms & Security Notice */}
          <div className="pt-2 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2 border-t border-border/70">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              Secured with 256-bit encryption. Cancel anytime with 1-click in account settings. Review our{' '}
              <Link
                to="/billing-help"
                target="_blank"
                className="text-accent hover:underline inline-flex items-center gap-0.5 font-medium"
              >
                Billing Help & Refund Policy
                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </Link>
              .
            </p>
          </div>

          {/* Action Button */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent/90 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Checkout...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>
                    Confirm & Upgrade to {activePlanInfo.name} ({priceDisplay}/mo)
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-center"
            >
              Keep current plan for now
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
