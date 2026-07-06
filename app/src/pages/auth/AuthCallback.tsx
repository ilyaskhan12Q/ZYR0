import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/database.types';

/**
 * OAuth Callback Page
 * Supabase redirects here after Google/LinkedIn OAuth.
 * We wait for the session, then redirect to the correct dashboard.
 */
export default function AuthCallback() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (profile) {
        const dashboardMap: Record<UserRole, string> = {
          student: '/student/dashboard',
          company: '/company/dashboard',
          mentor: '/mentor/dashboard',
          admin: '/admin/dashboard',
        };
        navigate(dashboardMap[profile.role], { replace: true });
      } else {
        // Auth failed or session not established
        navigate('/login', { replace: true });
      }
    }
  }, [profile, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}
