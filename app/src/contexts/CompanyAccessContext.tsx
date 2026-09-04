import { createContext, useContext, useEffect, useMemo, useCallback, useState, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyCompanyMembership, switchActiveCompany, type CompanyWorkspaceItem } from '@/services/companyTeam';
import { canAccessCompanyTab, type CompanyTabKey } from '@/services/companyTeam';
import { withTimeout } from '@/lib/timeout';
import type { Company, CompanyTeamMember, CompanyTeamRole } from '@/lib/database.types';

export interface CompanyAccessValue {
  company: Company | null;
  member: CompanyTeamMember | null;
  /** Team role for non-owner members; null for owners and non-members. */
  memberRole: CompanyTeamRole | null;
  companies: CompanyWorkspaceItem[];
  isOwner: boolean;
  hasAccess: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  switchCompany: (companyId: string) => Promise<void>;
  canAccessTab: (tab: CompanyTabKey) => boolean;
}

const CompanyAccessContext = createContext<CompanyAccessValue | undefined>(undefined);

export function CompanyAccessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [member, setMember] = useState<CompanyTeamMember | null>(null);
  const [companies, setCompanies] = useState<CompanyWorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (useCache = true) => {
    if (!user) {
      setCompany(null);
      setMember(null);
      setCompanies([]);
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
      const comps = res?.companies ?? [];
      setCompany(comp);
      setMember(mem);
      setCompanies(comps);
    } catch {
      setCompany(null);
      setMember(null);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const switchCompany = useCallback(async (companyId: string) => {
    switchActiveCompany(companyId);
    await load(false);
  }, [load]);

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
      companies,
      isOwner,
      hasAccess: !!company,
      loading,
      refresh: load,
      switchCompany,
      canAccessTab: (tab: CompanyTabKey) => {
        if (loading) return true;
        if (isOwner) return true;
        if (!memberRole) return false;
        return canAccessCompanyTab(memberRole, isOwner, tab);
      },
    };
  }, [company, member, companies, loading, load, switchCompany]);

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