import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Building2, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyAccess } from '@/contexts/CompanyAccessContext';
import { acceptTeamInvite, lookupInviteByToken, isAlreadyTeamMember } from '@/services/companyTeam';
import { SEO } from '@/components/SEO';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { refresh } = useCompanyAccess();
  const token = searchParams.get('token');
  const [state, setState] = useState<'idle' | 'confirm' | 'working' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
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

    async function loadInvite() {
      const lookup = await lookupInviteByToken(token ?? '');
      const email = lookup?.email ?? '';
      const company = lookup?.company_name ?? '';
      setInviteEmail(email);
      setCompanyName(company);

      const alreadyMember = await isAlreadyTeamMember();
      if (alreadyMember) {
        setState('success');
        return;
      }

      setState('confirm');
    }
    loadInvite();
  }, [loading, user, token, navigate]);

  async function handleAccept() {
    setState('working');
    try {
      const ok = await acceptTeamInvite(token ?? '');
      if (ok) {
        await refresh();
        setState('success');
      } else if (profile?.role === 'company') {
        await refresh();
        setState('success');
      } else {
        if (inviteEmail) {
          setErrorMsg(
            `This invitation is for ${inviteEmail}${companyName ? ` (${companyName})` : ''}. ` +
            `Sign in with that email to accept it.`
          );
        } else {
          setErrorMsg('This invitation is invalid or has already been accepted.');
        }
        setState('error');
      }
    } catch (err: any) {
      setState('error');
      setErrorMsg(err.message || 'Something went wrong while accepting the invitation.');
    }
  }

  if (loading || state === 'working' || state === 'idle') {
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
        {state === 'confirm' && (
          <>
            <div className="w-14 h-14 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <Mail className="w-7 h-7 text-accent" />
            </div>
            <h1 className="text-xl font-bold">You're Invited!</h1>
            <p className="text-sm text-muted-foreground mt-2">
              You've been invited to join{companyName ? ` ${companyName}` : ' a company'} on ZYR0 as a team member.
            </p>
            {inviteEmail && (
              <p className="text-xs text-muted-foreground mt-1">
                Invitation sent to <span className="font-medium text-foreground">{inviteEmail}</span>
              </p>
            )}
            <button
              onClick={handleAccept}
              className="mt-6 w-full py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Accept Invitation
            </button>
            <Link
              to="/"
              className="mt-3 inline-block w-full py-2.5 text-center bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/70"
            >
              Decline
            </Link>
          </>
        )}

        {state === 'success' && (
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
        )}

        {state === 'error' && (
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
      </motion.div>
    </div>
  );
}
