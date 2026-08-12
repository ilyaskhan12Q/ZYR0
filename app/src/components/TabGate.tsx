import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useCompanyAccess } from '@/contexts/CompanyAccessContext';
import type { CompanyTabKey } from '@/services/companyTeam';

/**
 * Route-level enforcement of the role/tab permission matrix: if the
 * current member's role does not include this tab, they are sent back
 * to the company dashboard. (Nav hiding is presentation; this is the
 * hard gate so tabs are "not less, not more".)
 */
export default function TabGate({ tab, children }: { tab: CompanyTabKey; children: ReactNode }) {
  const { canAccessTab, loading } = useCompanyAccess();

  if (loading) return null;
  if (!canAccessTab(tab)) return <Navigate to="/company/dashboard" replace />;

  return <>{children}</>;
}