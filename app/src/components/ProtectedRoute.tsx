import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/database.types';

import { Loader } from '@/components/common/Loader';

/**
 * Builds the post-auth redirect target from `?redirect=` (+ optional `?apply=`).
 * Only relative paths starting with a single "/" are accepted, preventing
 * open-redirects (e.g. "//evil.com" or "javascript:...").
 */
export function postAuthRedirect(searchParams: URLSearchParams): string | null {
  const redirect = searchParams.get('redirect');
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) return null;
  const apply = searchParams.get('apply');
  if (!apply) return redirect;
  const separator = redirect.includes('?') ? '&' : '?';
  return `${redirect}${separator}apply=${encodeURIComponent(apply)}`;
}

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
  const { session, profile, loading, profileLoaded } = useAuth();
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
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Session exists but profile still loading initially — brief loader, not a redirect
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
  const { session, profile, loading, profileLoaded } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (session) {
    const redirect = postAuthRedirect(new URLSearchParams(location.search));
    if (redirect) {
      return <Navigate to={redirect} replace />;
    }

    // Wait for profile to load — never guess the role
    if (!profileLoaded && !profile) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader variant="page" label="Loading profile..." />
        </div>
      );
    }

    if (!profile) {
      return <>{children}</>;
    }

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
