import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import Header from '@/components/nav/Header';
import PlatformFooter from '@/components/nav/PlatformFooter';
import StudioPromptSimulator from '@/components/products/studio/StudioPromptSimulator';
import { submitProductLead } from '@/services/leadService';
import { toast } from 'sonner';
import {
  Code, Sparkles, Zap, Layers, Globe,
  Download, GitBranch, Shield, ArrowRight,
  CheckCircle2, Laptop, Terminal, Rocket
} from 'lucide-react';

export default function StudioLanding() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid work or personal email address.');
      return;
    }
    setIsSubmitting(true);
    const result = await submitProductLead({ email, product: 'studio' });
    setIsSubmitting(false);
    if (result.success) {
      setSubmitted(true);
      toast.success(result.message);
      setEmail('');
    }
  };

  const studioFeatures = [
    {
      title: 'Prompt-to-Fullstack',
      description: 'Describe any web app in plain English. The AI generates responsive React 19 UI, clean Tailwind styling, and working state handlers.',
      icon: Sparkles,
      color: 'text-sky-400'
    },
    {
      title: 'Zero Vendor Lock-In',
      description: 'Export 100% standard TypeScript, Vite, and Tailwind code. Push directly to your GitHub repository with zero proprietary runtime bloat.',
      icon: GitBranch,
      color: 'text-emerald-400'
    },
    {
      title: 'Built-in Backend & DB',
      description: 'Instant Supabase PostgreSQL integration with pre-configured authentication, tables, security policies, and edge storage.',
      icon: Layers,
      color: 'text-indigo-400'
    },
    {
      title: '1-Click Cloud Deployment',
      description: 'Deploy to Cloudflare Pages or Vercel Edge in under 3 seconds. Connect custom domains with automatic free SSL.',
      icon: Globe,
      color: 'text-purple-400'
    },
    {
      title: 'Visual + Code Dual Canvas',
      description: 'Toggle effortlessly between visual point-and-click editing and raw JSX code manipulation with real-time bidirectional synchronization.',
      icon: Laptop,
      color: 'text-rose-400'
    },
    {
      title: 'Multi-Agent Refactoring',
      description: 'Ask the agent to fix accessibility, optimize bundle sizes, or implement complex animations with automatic test verification.',
      icon: Zap,
      color: 'text-amber-400'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-sky-500 selection:text-black font-sans antialiased overflow-x-hidden">
      <SEO
        title="ZYR0 Studio — AI Website & Web App Builder"
        description="Build and deploy full-stack React web applications at the speed of thought with autonomous AI agents and zero vendor lock-in."
        path="/studio"
      />
      <Header />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-6 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            Introducing ZYR0 Studio
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-mono mb-6 leading-tight">
            Build Full-Stack Web Apps <br />
            <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              At the Speed of Thought.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The next-generation autonomous AI builder. From natural language prompt to production-ready React 19 web applications with live preview and instant deployment.
          </p>

          {/* Waitlist Call-to-action input */}
          <div className="max-w-md mx-auto mb-12">
            {!submitted ? (
              <form onSubmit={handleSubmitWaitlist} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for early access..."
                  className="w-full bg-neutral-900 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-sky-400 font-mono"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-sky-400 hover:bg-sky-300 disabled:opacity-50 text-black font-bold text-sm rounded-xl transition-all flex-shrink-0 shadow-lg shadow-sky-400/20"
                >
                  {isSubmitting ? 'Joining...' : 'Get VIP Access'}
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>You're on the priority waitlist!</span>
              </div>
            )}
            <p className="text-xs text-neutral-500 mt-2.5">
              Instant access rolling out weekly. No credit card required.
            </p>
          </div>
        </div>

        {/* Interactive Prompt Simulator */}
        <div className="mb-24">
          <StudioPromptSimulator />
        </div>

        {/* Feature Grid */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-mono mb-3">
              Engineered for Real Developers
            </h2>
            <p className="text-sm text-neutral-400">
              Not a toy prototype generator. Real code, real components, zero compromises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studioFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="p-6 rounded-3xl bg-neutral-900/60 border border-white/10 hover:border-sky-500/30 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 ${feat.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-mono mb-2">{feat.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-sky-950/60 via-neutral-900 to-indigo-950/60 border border-sky-500/30 p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mb-3">
              Ready to ship 10x faster with AI?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 mb-6">
              Join thousands of engineers and creators building next-gen web applications with ZYR0 Studio.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="#top"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-6 py-3 bg-sky-400 hover:bg-sky-300 text-black font-bold text-xs rounded-xl transition-all shadow-lg shadow-sky-400/20"
              >
                Join the VIP Waitlist
              </a>
              <Link
                to="/"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/10 transition-all"
              >
                Back to Ecosystem
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PlatformFooter />
    </div>
  );
}
