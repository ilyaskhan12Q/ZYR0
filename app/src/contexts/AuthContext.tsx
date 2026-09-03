import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { signOut as authSignOut } from '@/lib/auth';
import { withTimeout } from '@/lib/timeout';
import type { Profile } from '@/lib/database.types';
import { checkProfileCompletion } from '@/services/users';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoaded: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  profileCompleted: boolean;
  profileCompletionPercentage: number;
  profileCompletionRequirements: string[];
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const currentUserIdRef = useRef<string | null>(null);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*, company:companies!profiles_company_id_fkey(*)')
      .eq('id', userId)
      .single();

    if (data) {
      if (data.role === 'company' && !data.company) {
        const { data: ownerCompany } = await supabase
          .from('companies')
          .select('*')
          .eq('owner_id', userId)
          .maybeSingle();
        if (ownerCompany) {
          data.company = ownerCompany;
        } else {
          const { data: teamMember } = await supabase
            .from('company_team_members')
            .select('company:companies(*)')
            .eq('user_id', userId)
            .eq('status', 'accepted')
            .order('accepted_at', { ascending: true })
            .limit(1)
            .maybeSingle();
          if (teamMember?.company) {
            data.company = teamMember.company as any;
          }
        }
      }
      setProfile(data);
    } else {
      setProfile(null);
    }
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id);
  }

  useEffect(() => {
    // Get initial session — resolve loading as soon as session is known,
    // then fetch profile in background so the UI isn't blocked.
    withTimeout(
      supabase.auth.getSession(),
      5000,
      { data: { session: null } },
      'AuthContext.getSession',
    )
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        currentUserIdRef.current = session?.user?.id ?? null;
        if (session?.user) {
          fetchProfile(session.user.id).finally(() => setProfileLoaded(true));
        } else {
          setProfileLoaded(true);
        }
      })
      .catch(() => {
        setProfileLoaded(true);
      })
      .finally(() => {
        setLoading(false);
      });

    // Listen for auth state changes (login, logout, token refresh, OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        const nextUserId = session?.user?.id ?? null;
        const isSameUser = !!nextUserId && nextUserId === currentUserIdRef.current;
        currentUserIdRef.current = nextUserId;

        if (session?.user) {
          // Only drop profileLoaded to false if switching accounts or if profile not yet loaded.
          // For background token refresh or focus return of the same user, keep profileLoaded
          // true so route guards do not unmount the active application and destroy form states.
          if (!isSameUser) {
            setProfileLoaded(false);
          }
          await fetchProfile(session.user.id);
          setProfileLoaded(true);
        } else {
          setProfile(null);
          setProfileLoaded(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    currentUserIdRef.current = null;
    await authSignOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setProfileLoaded(true);
  }

  const completion = checkProfileCompletion(profile);
  const profileCompleted = completion.completed;
  const profileCompletionPercentage = completion.percentage;
  const profileCompletionRequirements = completion.requirements;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        profileLoaded,
        signOut,
        refreshProfile,
        profileCompleted,
        profileCompletionPercentage,
        profileCompletionRequirements,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
