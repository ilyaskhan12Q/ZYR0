import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/lib/database.types';
import { SEO } from '@/components/SEO';

/**
 * OAuth Callback Page
 * Supabase redirects here after Google/LinkedIn OAuth.
 * We wait for the session, then redirect to the correct dashboard.
 */
export default function AuthCallback() {
  const { profile, loading, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let active = true;

    async function handleAuth() {
      // Directly check for session to parse token from URL hash immediately
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!active) return;

      if (session?.user) {
        const user = session.user;
        const typeParam = searchParams.get('type');

        if (typeParam === 'recovery') {
          navigate('/reset-password', { replace: true });
          return;
        }

        const roleParam = searchParams.get('role') as UserRole | null;

        // Fetch user profile
        let { data: currentProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (roleParam && (!currentProfile || currentProfile.role !== roleParam)) {
          // If profile is missing or role doesn't match register choice, upsert it
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              role: roleParam,
              full_name: user.user_metadata.full_name || user.email,
              avatar_url: user.user_metadata.avatar_url || null,
            })
            .select()
            .single();
          
          if (updatedProfile) {
            currentProfile = updatedProfile;
          }
        }

        await refreshProfile();

        if (currentProfile) {
          const dashboardMap: Record<UserRole, string> = {
            student: '/student/dashboard',
            company: '/company/dashboard',
            mentor: '/mentor/dashboard',
            admin: '/admin/dashboard',
          };
          navigate(dashboardMap[currentProfile.role as UserRole], { replace: true });
          return;
        }
      }

      // If session is still loading/processing, wait up to 3 seconds before redirecting to login
      const timeout = setTimeout(() => {
        if (active) {
          navigate('/login', { replace: true });
        }
      }, 3000);

      return () => {
        clearTimeout(timeout);
      };
    }

    handleAuth();

    return () => {
      active = false;
    };
  }, [searchParams, navigate, refreshProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SEO
        title="Authenticating..."
        description="Please wait while we authenticate your account."
        path="/auth/callback"
        noIndex={true}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}
