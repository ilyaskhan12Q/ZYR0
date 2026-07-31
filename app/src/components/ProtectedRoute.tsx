import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/database.types';

import { Loader } from '@/components/common/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If provided, user must have this role */
  role?: UserRole;
}

/**
 * Wraps a route to require authentication.
 * Optionally enforces a specific role.
 * Unauthenticated users are redirected to /login.
 * Wrong-role users are redirected to their dashboard.
 */
export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  // Still loading session — show unified Loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader variant="page" label="Verifying session..." />
      </div>
    );
  }

  // Not logged in
  if (!session || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wrong role
  if (role && profile.role !== role) {
    const dashboardMap: Record<UserRole, string> = {
      student: '/student/dashboard',
      company: '/company/dashboard',
      mentor: '/mentor/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={dashboardMap[profile.role]} replace />;
  }

  return <>{children}</>;
}

/**
 * Redirects already-logged-in users away from auth pages (login/register)
 */
export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth();

  if (loading) return null;

  if (session && profile) {
    const dashboardMap: Record<UserRole, string> = {
      student: '/student/dashboard',
      company: '/company/dashboard',
      mentor: '/mentor/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={dashboardMap[profile.role]} replace />;
  }

  return <>{children}</>;
}
