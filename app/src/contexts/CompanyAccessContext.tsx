import { createContext, useContext, useEffect, useMemo, useCallback, useState, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyCompanyMembership } from '@/services/companyTeam';
import { canAccessCompanyTab, type CompanyTabKey } from '@/services/companyTeam';
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

  const load = useCallback(async () => {
    if (!user) {
      setCompany(null);
      setMember(null);
      setLoading(false);
      return;
    }
    const { data } = await getMyCompanyMembership();
    setCompany(data?.company ?? null);
    setMember(data?.member ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
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
      canAccessTab: (tab: CompanyTabKey) => canAccessCompanyTab(memberRole, isOwner, tab),
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