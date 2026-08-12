import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { acceptTeamInvite } from '@/services/companyTeam';
import { SEO } from '@/components/SEO';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const token = searchParams.get('token');
  const [state, setState] = useState<'idle' | 'working' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (loading || started.current) return;
    started.current = true;

    if (!token) {
      setState('error');
      setErrorMsg('This invitation link is missing its token. Please use the link from the invitation email.');
      return;
    }

    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/accept-invite?token=${token}`)}`, { replace: true });
      return;
    }

    async function run() {
      setState('working');
      try {
        const ok = await acceptTeamInvite(token);
        if (ok) {
          setState('success');
        } else {
          setState('error');
          setErrorMsg('This invitation is invalid or has already been accepted.');
        }
      } catch (err: any) {
        setState('error');
        setErrorMsg(err.message || 'Something went wrong while accepting the invitation.');
      }
    }
    run();
  }, [loading, user, token, navigate]);

  if (loading || state === 'working') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4 py-16">
      <SEO title="Accept Team Invitation" description="Accept your ZYR0 company team invitation" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card rounded-2xl border border-border shadow-lg p-8 text-center"
      >
        {state === 'success' ? (
          <>
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h1 className="text-xl font-bold">Invitation Accepted!</h1>
            <p className="text-sm text-muted-foreground mt-2">
              You're now part of this company's team. Head to your company dashboard to get started.
            </p>
            <button
              onClick={() => navigate('/company/dashboard')}
              className="mt-6 w-full py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4" /> Go to Company Dashboard
            </button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>
            <h1 className="text-xl font-bold">Couldn't Accept Invitation</h1>
            <p className="text-sm text-muted-foreground mt-2">{errorMsg}</p>
            <Link
              to="/"
              className="mt-6 inline-block w-full py-2.5 text-center bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/70"
            >
              Back to Home
            </Link>
          </>
        )}
        {profile?.role === 'company' && (
          <p className="text-xs text-muted-foreground mt-4">
            Signed in as {profile.full_name || 'a company account'} — if you own a different company, sign in with the invited email instead.
          </p>
        )}
      </motion.div>
    </div>
  );
}