import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { PlanTier } from '@/lib/database.types';

export interface PlanEntitlement {
  label: string;
  value: string;
}

export interface PlanMeta {
  tier: PlanTier;
  name: string;
  badge: string;
  isPaid: boolean;
  color: string;
  badgeColor: string;
  description: string;
  isManualGrant: boolean;
  entitlements: PlanEntitlement[];
}

export const PLAN_DETAILS: Record<PlanTier, Omit<PlanMeta, 'tier' | 'isManualGrant'>> = {
  free: {
    name: 'Free Tier',
    badge: 'Standard',
    isPaid: false,
    color: 'text-foreground',
    badgeColor: 'bg-muted text-muted-foreground border-border',
    description: 'Essential platform access, verified candidate profiles, and standard AI research synthesis.',
    entitlements: [
      { label: 'Compute Lane', value: 'Standard Shared Queue' },
      { label: 'Context Horizon', value: 'Standard 32k window' },
      { label: 'Export Options', value: 'Web view & plain text' },
    ],
  },
  go: {
    name: 'ZYR0 GO',
    badge: 'Creator',
    isPaid: true,
    color: 'text-foreground',
    badgeColor: 'bg-muted/80 text-foreground border-border',
    description: '5× faster synthesis, priority candidate status, and one-click Markdown/PDF exports.',
    entitlements: [
      { label: 'Compute Lane', value: 'Priority Creator Lane (5×)' },
      { label: 'Context Horizon', value: 'Expanded 64k window' },
      { label: 'Export Options', value: 'Markdown & structured PDF' },
    ],
  },
  plus: {
    name: 'ZYR0 PLUS',
    badge: 'Pro',
    isPaid: true,
    color: 'text-foreground',
    badgeColor: 'bg-muted/80 text-foreground border-border',
    description: 'Deep multi-step reasoning models, zero queue delays, and VIP early access to ZYR0 Studio.',
    entitlements: [
      { label: 'Compute Lane', value: 'Dedicated Fast Lane (0 delay)' },
      { label: 'Reasoning Engine', value: 'Deep Multi-Step Models' },
      { label: 'Studio Access', value: 'Autonomous Code & UI Builder' },
    ],
  },
  enterprise: {
    name: 'Enterprise',
    badge: 'Institutional',
    isPaid: true,
    color: 'text-foreground',
    badgeColor: 'bg-muted/80 text-foreground border-border',
    description: 'Institutional deployment covering SchoolOS, custom SLAs, and multi-role academy portals.',
    entitlements: [
      { label: 'Deployment', value: 'SchoolOS & Custom SLAs' },
      { label: 'Compute Lane', value: 'Dedicated Compute Instance' },
      { label: 'Governance', value: 'SSO & Multi-Admin Audit Trail' },
    ],
  },
};

export function useActivePlan(): PlanMeta {
  const { profile } = useAuth();
  const [localPlan, setLocalPlan] = useState<PlanTier>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zyro_active_plan');
      if (stored && (stored === 'go' || stored === 'plus' || stored === 'enterprise' || stored === 'free')) {
        return stored as PlanTier;
      }
    }
    return 'free';
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem('zyro_active_plan');
        if (stored && (stored === 'go' || stored === 'plus' || stored === 'enterprise' || stored === 'free')) {
          setLocalPlan(stored as PlanTier);
        } else {
          setLocalPlan('free');
        }
      } catch {
        /* ignore */
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('zyro_plan_changed', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('zyro_plan_changed', handleSync);
    };
  }, []);

  // Server-side profile.plan_tier takes precedence if set, otherwise fallback to local/sandbox state
  const rawTier = profile?.plan_tier || localPlan || 'free';
  const tier: PlanTier = (rawTier in PLAN_DETAILS) ? (rawTier as PlanTier) : 'free';
  const meta = PLAN_DETAILS[tier] || PLAN_DETAILS.free;
  const isManualGrant = Boolean(profile?.plan_granted_by);

  return {
    tier,
    isManualGrant,
    ...meta,
  };
}
