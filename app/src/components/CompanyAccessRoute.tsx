import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyAccess } from '@/contexts/CompanyAccessContext';
import { Loader } from '@/components/common/Loader';

const dashboardMap: Record<string, string> = {
  student: '/student/dashboard',
  company: '/company/dashboard',
  mentor: '/mentor/dashboard',
  admin: '/admin/dashboard',
};

/**
 * Gate for /company/*. Admits company owners (profile role "company")
 * AND any user with an accepted company_team_members row, regardless of
 * their profile role. Everyone else is redirected to their own dashboard.
 */
export function CompanyAccessRoute({ children }: { children: ReactNode }) {
  const { session, profile, loading, profileLoaded } = useAuth();
  const { company, loading: accessLoading } = useCompanyAccess();
  const location = useLocation();

  if (loading || accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader variant="page" label="Verifying access..." />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Session exists but profile still loading initially
  if (!profileLoaded && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader variant="page" label="Loading profile..." />
      </div>
    );
  }

  // Session exists and profile finished loading, but no profile record found
  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!company) {
    // A newly registered company owner needs to access /company/profile or /company/dashboard
    // to set up their company.
    if (profile.role === 'company') {
      const isSetupPath = location.pathname === '/company/profile' || location.pathname === '/company/dashboard';
      if (isSetupPath) {
        return <>{children}</>;
      }
      return <Navigate to="/company/profile" replace />;
    }

    // Unaffiliated users are redirected to their own dashboard
    return <Navigate to={dashboardMap[profile.role] || '/student/dashboard'} replace />;
  }

  return <>{children}</>;
}