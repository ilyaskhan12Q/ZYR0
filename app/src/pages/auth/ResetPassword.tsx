import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as motionFramer } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { updatePassword } from '@/lib/auth';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setLocalError(null);

    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      setLocalError(error.message);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motionFramer.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/zyro-logo.png" alt="Zyro Logo" className="w-10 h-10 object-contain rounded-xl" />
            </div>
            <span className="text-xl font-bold">Zyro</span>
          </Link>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-lg p-8">
          {!submitted ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Create New Password</h2>
                <p className="text-sm text-muted-foreground mt-1">Please enter your new password below.</p>
              </div>
              {localError && (
                <div role="alert" className="p-3 mb-4 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{localError}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="text-sm font-medium mb-1.5 block">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <input
                      id="new-password"
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent focus-visible-ring"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible-ring rounded-md p-1"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-new-password" className="text-sm font-medium mb-1.5 block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <input
                      id="confirm-new-password"
                      type={showConfirmPass ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent focus-visible-ring"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible-ring rounded-md p-1"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-accent text-white py-2.5 rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 focus-visible-ring">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <motionFramer.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              </motionFramer.div>
              <h3 className="mt-4 text-xl font-bold">Password Reset Successful</h3>
              <p className="mt-2 text-sm text-muted-foreground">Your password has been changed successfully. You can now log in with your new credentials.</p>
              <div className="mt-6 pt-4 border-t border-border">
                <Link to="/login" className="inline-flex items-center gap-1.5 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors focus-visible-ring">
                  Go to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </motionFramer.div>
    </div>
  );
}
