import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, GraduationCap, Building2, Users, ArrowRight, ArrowLeft, CheckCircle2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

import { signUp, signInWithGoogle, signInWithLinkedIn } from '../../lib/auth';
import type { UserRole } from '../../lib/database.types';
import { supabase } from '../../lib/supabase';

type Role = UserRole | null;
type Step = 'role' | 'form' | 'otp' | 'success';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('role');
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');

  // Prefetch dashboard portals in the background once the registration page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      import('@/pages/student/StudentPortal').catch(() => {});
      import('@/pages/company/CompanyPortal').catch(() => {});
      import('@/pages/mentor/MentorPortal').catch(() => {});
      import('@/pages/admin/AdminPortal').catch(() => {});
    }, 800);
    return () => clearTimeout(timer);
  }, []);


  const roles = [
    { id: 'student' as Role, icon: GraduationCap, title: "I'm a Student", desc: 'Find internships, complete tasks, and earn verified certificates.', features: ['Browse 500+ internships', 'Track applications & tasks', 'Earn certificates'] },
    { id: 'company' as Role, icon: Building2, title: "I'm a Company", desc: 'Post internships, manage applicants, and issue certificates.', features: ['Post unlimited internships', 'Review applicants', 'Issue certificates'] },
    { id: 'mentor' as Role, icon: Users, title: "I'm a Mentor", desc: 'Guide interns, review work, and provide feedback.', features: ['Manage assigned interns', 'Review submissions', 'Provide evaluations'] },
  ];

  const handleContinue = () => {
    if (selectedRole) setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    setLoading(true);
    setLocalError(null);

    const { error } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.name,
      role: selectedRole as UserRole
    });

    if (error) {
      let msg = error.message;
      if (error.status === 500 || !msg || msg === '{}') {
        msg = "Registration failed (500: Error sending confirmation email). The Supabase built-in email provider limit has been reached. Please log in to your Supabase Dashboard, go to Authentication -> Providers -> Email, and toggle OFF 'Confirm email'.";
      }
      setLocalError(msg);
      setLoading(false);
    } else {
      setLoading(false);
      setStep('otp');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setLocalError("Please enter a valid 6-digit verification code.");
      return;
    }
    setLoading(true);
    setLocalError(null);

    const { error } = await supabase.auth.verifyOtp({
      email: form.email,
      token: otp,
      type: 'signup'
    });

    if (error) {
      setLocalError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setStep('success');
    }
  };

  const handleOAuth = async (provider: 'google' | 'linkedin_oidc') => {
    if (!selectedRole) return;
    setLoading(true);
    setLocalError(null);
    const { error } = provider === 'google' 
      ? await signInWithGoogle(selectedRole) 
      : await signInWithLinkedIn(selectedRole);
    if (error) {
      setLocalError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/zyro-logo.png" alt="Zyro Logo" className="w-10 h-10 object-contain rounded-xl" />
            </div>
            <span className="text-xl font-bold">Zyro</span>
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Role Selection */}
          {step === 'role' && (
            <motion.div key="role" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Join Zyro</h1>
                <p className="text-muted-foreground mt-2">Select your role to get started</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`text-left p-6 rounded-xl border-2 transition-all duration-300 ${
                      selectedRole === role.id
                        ? 'border-accent bg-accent/5 ring-2 ring-accent/20'
                        : 'border-border hover:border-accent/50 hover:shadow-lg'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${selectedRole === role.id ? 'bg-accent' : 'bg-accent/10'}`}>
                      <role.icon className={`w-6 h-6 ${selectedRole === role.id ? 'text-white' : 'text-accent'}`} />
                    </div>
                    <h3 className="font-semibold">{role.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{role.desc}</p>
                    <ul className="mt-3 space-y-1">
                      {role.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
              <button
                onClick={handleContinue}
                disabled={!selectedRole}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-accent text-white py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center mt-4 text-sm text-muted-foreground">
                Already have an account? <Link to="/login" className="text-accent font-medium hover:underline">Sign In</Link>
              </p>
            </motion.div>
          )}

          {/* Step 2: Form */}
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-card rounded-xl border border-border shadow-lg p-8">
                <button onClick={() => setStep('role')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-accent mb-4">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">
                    Create {selectedRole === 'student' ? 'Student' : selectedRole === 'company' ? 'Company' : 'Mentor'} Account
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Fill in your details to get started</p>
                </div>

                {localError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm flex items-start gap-2">
                    <span className="mt-0.5">⚠️</span>
                    <span>{localError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" placeholder="John Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" placeholder="you@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" placeholder="Min. 6 characters" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type={showPass ? 'text' : 'password'} required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" placeholder="Confirm your password" />
                    </div>
                  </div>
                  <label className="flex items-start gap-2 text-sm">
                    <input type="checkbox" required className="mt-0.5 rounded border-border" />
                    <span className="text-muted-foreground">I agree to the <Link to="#" className="text-accent hover:underline">Terms of Service</Link> and <Link to="#" className="text-accent hover:underline">Privacy Policy</Link></span>
                  </label>
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-accent text-white py-2.5 rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50">
                    {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
                  </button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or register with</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => handleOAuth('google')} className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium">
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google
                  </button>
                  <button type="button" onClick={() => handleOAuth('linkedin_oidc')} className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: OTP Verification */}
          {step === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-card rounded-xl border border-border shadow-lg p-8">
                <button onClick={() => setStep('form')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-accent mb-4">
                  <ArrowLeft className="w-4 h-4" /> Back to Signup
                </button>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">Verify Your Email</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    We sent a 6-digit confirmation code to <span className="font-semibold text-foreground">{form.email}</span>. Please enter it below to complete your registration.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label htmlFor="otp-code" className="block text-sm font-medium text-muted-foreground mb-1.5">
                      Verification Code
                    </label>
                    <input
                      id="otp-code"
                      type="text"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      inputMode="numeric"
                      required
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-center font-mono text-2xl tracking-widest placeholder:text-muted-foreground/30 placeholder:tracking-normal placeholder:font-sans"
                    />
                  </div>

                  {localError && (
                    <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
                      <span className="shrink-0 mt-0.5">⚠️</span>
                      <span>{localError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Verify Account'
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try registering again.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="bg-card rounded-xl border border-border shadow-lg p-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                </motion.div>
                <h2 className="mt-6 text-2xl font-bold">Email Verified! 🎉</h2>
                <p className="mt-2 text-muted-foreground">Your email has been successfully verified, and your account is active. You can now access your dashboard.</p>
                <button onClick={() => navigate('/')} className="mt-6 inline-flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
