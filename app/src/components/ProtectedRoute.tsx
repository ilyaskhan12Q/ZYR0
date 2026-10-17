import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
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
  const { session, profile, loading, profileLoaded, signOut } = useAuth();
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

  // Enforce account suspension & deactivation
  if (profile.status === 'suspended' || profile.status === 'inactive') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full p-8 rounded-3xl border border-destructive/30 bg-card text-foreground shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Account {profile.status === 'suspended' ? 'Suspended' : 'Deactivated'}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.status_reason
                ? profile.status_reason
                : 'Your platform access has been restricted by an administrator. If you believe this is an error, please reach out for assistance.'}
            </p>
          </div>
          <div className="pt-2 border-t border-border flex flex-col gap-3">
            <a
              href="mailto:support@zyroo.org"
              className="text-xs text-accent hover:underline font-medium"
            >
              Contact Support (support@zyroo.org)
            </a>
            <button
              type="button"
              onClick={() => signOut()}
              className="w-full py-2.5 px-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium text-sm transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
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
