import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { resetPassword } from '@/lib/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setLocalError(error.message);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
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
                <h2 className="text-2xl font-bold">Reset Password</h2>
                <p className="text-sm text-muted-foreground mt-1">Enter your email and we&apos;ll send you a reset link.</p>
              </div>
              {localError && (
                <div role="alert" className="p-3 mb-4 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{localError}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="text-sm font-medium mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent focus-visible-ring"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-accent text-white py-2.5 rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 focus-visible-ring">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              </motion.div>
              <h3 className="mt-4 text-xl font-bold">Check Your Email</h3>
              <p className="mt-2 text-sm text-muted-foreground">We&apos;ve sent a password reset link to {email}</p>
            </div>
          )}
          <div className="mt-6 pt-4 border-t border-border">
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-accent hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
