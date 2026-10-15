import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { PlanTier } from '@/lib/database.types';

export interface PlanMeta {
  tier: PlanTier;
  name: string;
  badge: string;
  isPaid: boolean;
  color: string;
  badgeColor: string;
  description: string;
  isManualGrant: boolean;
}

export const PLAN_DETAILS: Record<PlanTier, Omit<PlanMeta, 'tier' | 'isManualGrant'>> = {
  free: {
    name: 'Free Plan',
    badge: 'Standard',
    isPaid: false,
    color: 'text-foreground',
    badgeColor: 'bg-muted text-muted-foreground border-border',
    description: 'Essential platform access, verified workspaces, and standard AI research synthesis.',
  },
  go: {
    name: 'ZYR0 GO',
    badge: 'Creator Boost',
    isPaid: true,
    color: 'text-cyan-600 dark:text-cyan-400',
    badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25',
    description: '5× faster synthesis, priority candidate status, and one-click Markdown/PDF exports.',
  },
  plus: {
    name: 'ZYR0 PLUS',
    badge: 'Flagship Tier',
    isPaid: true,
    color: 'text-amber-600 dark:text-amber-400',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
    description: 'Deep multi-step reasoning models, zero queue delays, and VIP early access to ZYR0 Studio.',
  },
  enterprise: {
    name: 'Enterprise / Custom',
    badge: 'Institutional',
    isPaid: true,
    color: 'text-emerald-600 dark:text-emerald-400',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    description: 'Full institutional deployment covering SchoolOS, custom SLAs, and multi-role academy portals.',
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
