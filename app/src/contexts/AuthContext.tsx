import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { signOut as authSignOut } from '@/lib/auth';
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
          .single();
        if (ownerCompany) {
          data.company = ownerCompany;
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setProfileLoaded(true));
      } else {
        setProfileLoaded(true);
      }
    });

    // Listen for auth state changes (login, logout, token refresh, OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setProfileLoaded(false);
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
    await authSignOut();
    setSession(null);
    setUser(null);
    setProfile(null);
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
