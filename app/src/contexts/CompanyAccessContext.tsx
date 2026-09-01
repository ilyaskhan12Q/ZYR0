import { createContext, useContext, useEffect, useMemo, useCallback, useState, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyCompanyMembership } from '@/services/companyTeam';
import { canAccessCompanyTab, type CompanyTabKey } from '@/services/companyTeam';
import { withTimeout } from '@/lib/timeout';
import type { Company, CompanyTeamMember, CompanyTeamRole } from '@/lib/database.types';

export interface CompanyAccessValue {
  company: Company | null;
  member: CompanyTeamMember | null;
  /** Team role for non-owner members; null for owners and non-members. */
  memberRole: CompanyTeamRole | null;
  isOwner: boolean;
  hasAccess: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  canAccessTab: (tab: CompanyTabKey) => boolean;
}

const CompanyAccessContext = createContext<CompanyAccessValue | undefined>(undefined);

export function CompanyAccessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [member, setMember] = useState<CompanyTeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (useCache = true) => {
    if (!user) {
      setCompany(null);
      setMember(null);
      setLoading(false);
      return;
    }
    try {
      const res = await withTimeout(
        getMyCompanyMembership(useCache),
        8000,
        null,
        'CompanyAccess.membership',
      );
      const comp = res?.company ?? res?.data?.company ?? null;
      const mem = res?.member ?? res?.data?.member ?? null;
      setCompany(comp);
      setMember(mem);
    } catch {
      setCompany(null);
      setMember(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Re-resolve membership when the tab regains focus so role changes,
  // removals, or new acceptances made elsewhere take effect instead of
  // rendering a stale sidebar/access state until reload. Uses cache first
  // for instant response, then refreshes in background.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        load(true);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  const value = useMemo<CompanyAccessValue>(() => {
    const isOwner = !!company && !member;
    const memberRole = member?.role ?? null;
    return {
      company,
      member,
      memberRole,
      isOwner,
      hasAccess: !!company,
      loading,
      refresh: load,
      canAccessTab: (tab: CompanyTabKey) => {
        if (loading) return true;
        if (isOwner) return true;
        if (!memberRole) return true;
        return canAccessCompanyTab(memberRole, isOwner, tab);
      },
    };
  }, [company, member, loading, load]);

  return <CompanyAccessContext.Provider value={value}>{children}</CompanyAccessContext.Provider>;
}

export function useCompanyAccess(): CompanyAccessValue {
  const ctx = useContext(CompanyAccessContext);
  if (!ctx) throw new Error('useCompanyAccess must be used within CompanyAccessProvider');
  return ctx;
}

/** Safe variant for components rendered across all portals (e.g. the layout). */
export function useOptionalCompanyAccess(): CompanyAccessValue | undefined {
  return useContext(CompanyAccessContext);
}