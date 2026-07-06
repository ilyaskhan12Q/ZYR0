import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, GraduationCap, Building2, Users, ArrowRight, ArrowLeft, CheckCircle2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

import { signUp } from '../../lib/auth';
import type { UserRole } from '../../lib/database.types';

type Role = UserRole | null;
type Step = 'role' | 'form' | 'success';

export default function Register() {
  const [step, setStep] = useState<Step>('role');
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

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
      setLocalError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setStep('success');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
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
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="bg-card rounded-xl border border-border shadow-lg p-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                </motion.div>
                <h2 className="mt-6 text-2xl font-bold">Account Created!</h2>
                <p className="mt-2 text-muted-foreground">Welcome to Zyro! Your account has been successfully created.</p>
                <Link to="/login" className="mt-6 inline-flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors">
                  Go to Login <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
