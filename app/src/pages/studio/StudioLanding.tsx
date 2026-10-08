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
    <div
      className="min-h-screen transition-colors duration-200 overflow-x-hidden"
      style={{
        background: 'var(--zyro-bg)',
        color: 'var(--zyro-text)',
      }}
    >
      <SEO
        title="ZYR0 Studio — AI Website & Web App Builder"
        description="Build and deploy full-stack React web applications at the speed of thought with autonomous AI agents and zero vendor lock-in."
        path="/studio"
      />
      <Header />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono text-[11px] tracking-[0.2em] uppercase border mb-6"
            style={{
              background: 'var(--zyro-surface)',
              borderColor: 'var(--zyro-border)',
              color: '#38BDF8',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Introducing ZYR0 Studio
          </div>

          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal tracking-tight mb-6 leading-[1.08] text-balance"
            style={{ color: 'var(--zyro-text)' }}
          >
            Build Full-Stack Web Apps <br />
            <span className="italic" style={{ color: '#38BDF8' }}>
              at the speed of thought.
            </span>
          </h1>

          <p
            className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--zyro-text-secondary)' }}
          >
            The next-generation autonomous AI builder. From natural language prompt to production-ready React 19 web applications with live preview and instant deployment.
          </p>

          {/* Waitlist Call-to-action input */}
          <div className="max-w-md mx-auto mb-12">
            {!submitted ? (
              <form onSubmit={handleSubmitWaitlist} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email for priority access..."
                  className="w-full border rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/40 transition-all font-mono"
                  style={{
                    background: 'var(--zyro-surface)',
                    borderColor: 'var(--zyro-border)',
                    color: 'var(--zyro-text)',
                  }}
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-full font-medium text-sm transition-all flex-shrink-0 shadow-sm hover:opacity-90 disabled:opacity-50"
                  style={{
                    background: 'var(--zyro-text)',
                    color: 'var(--zyro-bg)',
                  }}
                >
                  {isSubmitting ? 'Joining...' : 'Get VIP Access'}
                </button>
              </form>
            ) : (
              <div
                className="p-4 rounded-2xl border text-sm flex items-center justify-center gap-2 font-mono"
                style={{
                  background: 'var(--zyro-surface)',
                  borderColor: 'var(--zyro-border)',
                  color: '#38BDF8',
                }}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>You're on the priority waitlist!</span>
              </div>
            )}
            <p
              className="text-xs mt-2.5"
              style={{ color: 'var(--zyro-text-secondary)' }}
            >
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
            <span
              className="font-mono text-[11px] tracking-[0.25em] uppercase"
              style={{ color: '#38BDF8' }}
            >
              Architecture & Performance
            </span>
            <h2
              className="mt-3 text-3xl sm:text-5xl font-serif font-normal tracking-tight mb-3"
              style={{ color: 'var(--zyro-text)' }}
            >
              Engineered for <span className="italic" style={{ color: '#38BDF8' }}>real developers</span>
            </h2>
            <p
              className="text-sm sm:text-base max-w-xl mx-auto"
              style={{ color: 'var(--zyro-text-secondary)' }}
            >
              Not a toy prototype generator. Real code, real components, zero compromises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studioFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="p-6 rounded-3xl border transition-all duration-300 hover:shadow-md hover:-translate-y-1 group"
                  style={{
                    background: 'var(--zyro-surface)',
                    borderColor: 'var(--zyro-border)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-2xl border flex items-center justify-center mb-4 transition-transform group-hover:scale-105"
                    style={{
                      background: 'var(--zyro-bg)',
                      borderColor: 'var(--zyro-border)',
                      color: '#38BDF8',
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: 'var(--zyro-text)' }}
                  >
                    {feat.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--zyro-text-secondary)' }}
                  >
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Banner */}
        <div
          className="rounded-3xl border p-8 sm:p-14 text-center relative overflow-hidden shadow-xl"
          style={{
            background: 'var(--zyro-surface)',
            borderColor: 'var(--zyro-border)',
          }}
        >
          {/* Subtle Sky Blue ambient glow */}
          <div
            className="absolute top-0 right-1/4 -mt-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 dark:opacity-30"
            style={{ background: '#38BDF8' }}
          />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span
              className="inline-block px-3.5 py-1.5 rounded-full font-mono text-[11px] tracking-[0.2em] uppercase border"
              style={{
                background: 'var(--zyro-bg)',
                borderColor: 'var(--zyro-border)',
                color: '#38BDF8',
              }}
            >
              Early Access
            </span>
            <h3
              className="text-3xl sm:text-5xl font-serif font-normal tracking-tight"
              style={{ color: 'var(--zyro-text)' }}
            >
              Ready to ship 10x faster <span className="italic" style={{ color: '#38BDF8' }}>with AI?</span>
            </h3>
            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{ color: 'var(--zyro-text-secondary)' }}
            >
              Join thousands of engineers and creators building next-gen web applications with ZYR0 Studio.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <a
                href="#top"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-8 py-3.5 rounded-full font-medium text-sm transition-all shadow-sm hover:opacity-90"
                style={{
                  background: 'var(--zyro-text)',
                  color: 'var(--zyro-bg)',
                }}
              >
                Join the VIP Waitlist
              </a>
              <Link
                to="/"
                className="px-8 py-3.5 rounded-full font-medium text-sm border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                style={{
                  borderColor: 'var(--zyro-border)',
                  color: 'var(--zyro-text)',
                }}
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
