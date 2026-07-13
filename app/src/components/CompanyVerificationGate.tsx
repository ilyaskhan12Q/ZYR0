import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyCompany } from '@/services/companies';
import type { Company } from '@/lib/database.types';
import { Loader2, ShieldAlert, ShieldX, Clock, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CompanyVerificationGateProps {
  children: React.ReactNode;
  mode?: 'block' | 'banner' | 'none';
}

export default function CompanyVerificationGate({ children, mode = 'block' }: CompanyVerificationGateProps) {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      async function load() {
        try {
          if (user) {
            const { data } = await getMyCompany();
            if (active && data) {
              setCompany(data as Company);
            }
          }
        } catch (err) {
          console.error('Error loading company for gate:', err);
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }
      load();
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // If no company exists yet, they should be prompted to create or join one (in Settings/Profile)
  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto min-h-[50vh] space-y-4 bg-card border border-border rounded-xl shadow-sm">
        <Building2 className="w-12 h-12 text-muted-foreground" />
        <h3 className="text-lg font-bold">No Company Profile Associated</h3>
        <p className="text-sm text-muted-foreground">
          You need to associate your profile with a company to access these partner features.
        </p>
        <Link to="/company/profile" className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/90 transition-all">
          Set Up Company Profile
        </Link>
      </div>
    );
  }

  const status = company.status || 'pending';

  if (status === 'approved') {
    return <>{children}</>;
  }

  if (mode === 'block') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto min-h-[60vh] space-y-6 bg-card border border-border rounded-xl shadow-sm">
        {status === 'pending' && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center border border-amber-200 dark:border-amber-900/30">
              <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Verification Pending</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Your company profile for <strong className="text-foreground">{company.name}</strong> is currently pending admin verification.
              </p>
              <p className="text-xs text-muted-foreground">
                You will receive full portal access once our team verifies and approves your company credentials.
              </p>
            </div>
          </>
        )}

        {status === 'rejected' && (
          <>
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center border border-rose-200 dark:border-rose-900/30">
              <ShieldX className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">Verification Rejected</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Your company verification request for <strong className="text-foreground">{company.name}</strong> has been rejected.
              </p>
              {company.verification_notes && (
                <div className="p-4 bg-muted/50 rounded-lg text-xs text-left border border-border font-medium space-y-1">
                  <span className="text-muted-foreground block font-bold uppercase tracking-wider text-[10px]">Reason:</span>
                  <p className="text-foreground italic">"{company.verification_notes}"</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Please update your company details in Profile or Settings to match credentials, and request review.
              </p>
            </div>
          </>
        )}

        {status === 'suspended' && (
          <>
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <ShieldAlert className="w-8 h-8 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Company Suspended</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Your company profile for <strong className="text-foreground">{company.name}</strong> has been suspended by an administrator.
              </p>
              {company.verification_notes && (
                <div className="p-4 bg-muted/50 rounded-lg text-xs text-left border border-border font-medium space-y-1">
                  <span className="text-muted-foreground block font-bold uppercase tracking-wider text-[10px]">Admin Notes:</span>
                  <p className="text-foreground italic">"{company.verification_notes}"</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                If you believe this is an error or wish to appeal, please contact support.
              </p>
            </div>
          </>
        )}

        <div className="flex gap-3 pt-2">
          <Link to="/company/profile" className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
            View Profile
          </Link>
          <Link to="/company/settings" className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  // mode === 'banner'
  return (
    <div className="space-y-6">
      {status === 'pending' && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl dark:bg-amber-950/20 dark:border-amber-900/30 text-amber-800 dark:text-amber-300">
          <Clock className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Verification Pending</h4>
            <p className="text-xs opacity-90 mt-0.5">
              Your company verification is currently pending review. Access to internships, applicants, and other core features is locked until approved.
            </p>
          </div>
        </div>
      )}
      {status === 'rejected' && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl dark:bg-rose-950/20 dark:border-rose-900/30 text-rose-800 dark:text-rose-300">
          <ShieldX className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Verification Rejected</h4>
            <p className="text-xs opacity-90 mt-0.5">
              Your company registration request was rejected.{' '}
              {company.verification_notes && (
                <span className="font-semibold">Reason: "{company.verification_notes}"</span>
              )}
            </p>
          </div>
        </div>
      )}
      {status === 'suspended' && (
        <div className="flex items-start gap-3 p-4 bg-slate-100 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Company Suspended</h4>
            <p className="text-xs opacity-90 mt-0.5">
              Your company profile has been suspended by an administrator.{' '}
              {company.verification_notes && (
                <span className="font-semibold">Notes: "{company.verification_notes}"</span>
              )}
            </p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
