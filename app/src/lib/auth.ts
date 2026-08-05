import { supabase } from './supabase';
import type { UserRole } from './database.types';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface SignInData {
  email: string;
  password: string;
}

/** Email + password sign up */
export async function signUp({ email, password, fullName, role }: SignUpData) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });
}

/** Email + password sign in */
export async function signIn({ email, password }: SignInData) {
  return supabase.auth.signInWithPassword({ email, password });
}

/** Google OAuth — redirects to Google, then back to /auth/callback */
export async function signInWithGoogle(role?: UserRole, redirectOptions?: { redirect?: string; apply?: string }) {
  const redirectTo = buildCallbackUrl(role, redirectOptions);
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  });
}

/** LinkedIn OAuth — redirects to LinkedIn, then back to /auth/callback */
export async function signInWithLinkedIn(role?: UserRole, redirectOptions?: { redirect?: string; apply?: string }) {
  const redirectTo = buildCallbackUrl(role, redirectOptions);
  return supabase.auth.signInWithOAuth({
    provider: 'linkedin_oidc',
    options: {
      redirectTo,
    },
  });
}

/** Build the OAuth callback URL with optional role + post-auth redirect params. */
function buildCallbackUrl(role?: UserRole, opts?: { redirect?: string; apply?: string }) {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  if (opts?.redirect) params.set('redirect', opts.redirect);
  if (opts?.apply) params.set('apply', opts.apply);
  const query = params.toString();
  return `${window.location.origin}/auth/callback${query ? `?${query}` : ''}`;
}

/** Password reset email */
export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

/** Update password (after reset redirect) */
export async function updatePassword(newPassword: string) {
  return supabase.auth.updateUser({ password: newPassword });
}

/** Sign out */
export async function signOut() {
  return supabase.auth.signOut();
}

/** Get current session */
export async function getSession() {
  return supabase.auth.getSession();
}

/** Get current user profile from DB */
export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
}
