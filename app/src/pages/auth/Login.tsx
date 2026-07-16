import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, Building2, Users } from 'lucide-react';
import { signIn, signInWithGoogle, signInWithLinkedIn } from '../../lib/auth';
import { SEO } from '@/components/SEO';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Prefetch dashboard portals in the background once the login page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      import('@/pages/student/StudentPortal').catch(() => {});
      import('@/pages/company/CompanyPortal').catch(() => {});
      import('@/pages/mentor/MentorPortal').catch(() => {});
      import('@/pages/admin/AdminPortal').catch(() => {});
    }, 800);
    return () => clearTimeout(timer);
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    const { error } = await signIn({ email, password });
    
    if (error) {
      let msg = error.message;
      if (error.status === 500 || !msg || msg === '{}') {
        msg = "Authentication server responded with an error (500). Please check your Supabase server connection and database status.";
      }
      setLocalError(msg);
      setLoading(false);
    } else {
      // The AuthContext will automatically redirect based on role when session updates
    }
  };

  const handleOAuth = async (provider: 'google' | 'linkedin_oidc') => {
    const { error } = provider === 'google' ? await signInWithGoogle() : await signInWithLinkedIn();
    if (error) {
      setLocalError(error.message);
    }
  };

  const displayError = localError;

  return (
    <div className="min-h-screen flex">
      <SEO
        title="Sign In — Access Your Dashboard"
        description="Log in to your ZYR0 portal to manage your internships, mentor assignments, certificates, and student applications."
        path="/login"
        noIndex={true}
      />
      {/* Left Side - Branding */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-1/2 bg-primary dark:bg-slate-950 items-center justify-center relative overflow-hidden border-r border-border/10"
      >
        {/* Subtle decorative grid/mesh background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 dark:from-accent/5 dark:to-transparent" />
          <div 
            className="absolute inset-0 opacity-20 dark:opacity-10" 
            style={{ 
              backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59,130,246,0.2) 0%, transparent 60%), radial-gradient(circle at 75% 75%, rgba(147,51,234,0.15) 0%, transparent 60%)' 
            }} 
          />
        </div>

        <div className="relative z-10 max-w-md px-8 text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <img src="/zyro-logo.png" alt="ZYR0 Logo" className="w-16 h-16 object-contain rounded-2xl shadow-xl" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Welcome Back to ZYR0</h2>
          <p className="text-white/80 dark:text-slate-300 mb-8 max-w-sm mx-auto">Your gateway to professional growth and meaningful internship experiences.</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: GraduationCap, label: 'Students', count: '10K+' },
              { icon: Building2, label: 'Companies', count: '500+' },
              { icon: Users, label: 'Mentors', count: '200+' },
            ].map((item, i) => (
              <div 
                key={i} 
                className="bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/5 backdrop-blur-md rounded-2xl p-5 hover:border-accent/30 hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 dark:bg-white/5 flex items-center justify-center mx-auto mb-3 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <p className="text-2xl font-bold text-white tracking-tight">{item.count}</p>
                <p className="text-xs text-white/60 dark:text-slate-400 font-medium mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <img src="/zyro-logo.png" alt="ZYR0 Logo" className="w-12 h-12 object-contain rounded-xl" />
            </div>
            <h1 className="text-2xl font-bold">ZYR0</h1>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-sm text-muted-foreground mt-1">Sign in to your ZYR0 account</p>
            </div>

            {displayError && (
              <div role="alert" className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm flex items-start gap-2">
                <span className="mt-0.5" aria-hidden="true">⚠️</span>
                <span>{displayError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="text-sm font-medium mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent focus-visible-ring"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="login-password" className="text-sm font-medium mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent focus-visible-ring"
                    placeholder="Enter your password"
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
              <div className="flex items-center justify-between">
                <label htmlFor="remember-me" className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="rounded border-border focus-visible-ring"
                  /> Remember me
                </label>
                <Link to="/forgot-password" className="text-sm text-accent hover:underline focus-visible-ring rounded-sm">Forgot Password?</Link>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-accent text-white py-2.5 rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 focus-visible-ring"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuth('google')}
                className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors text-sm focus-visible-ring"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
              <button
                onClick={() => handleOAuth('linkedin_oidc')}
                className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors text-sm focus-visible-ring"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </button>
            </div>
          </div>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Don&apos;t have an account? <Link to="/register" className="text-accent font-medium hover:underline focus-visible-ring rounded-sm">Register</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
