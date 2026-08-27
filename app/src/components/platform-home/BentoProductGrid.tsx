import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code, School, BrainCircuit, Briefcase,
  ArrowRight, Sparkles, CheckCircle2, Play,
  Copy, ExternalLink, ShieldCheck, Terminal,
  TrendingUp, Users, Award, ChevronRight, Check
} from 'lucide-react';
import { productsList } from './data';

export default function BentoProductGrid() {
  // Studio interactive prompt simulation
  const [studioPrompt, setStudioPrompt] = useState('Create a modern dark-mode AI Analytics Dashboard with charts');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(3);

  // Edu perspective preview
  const [eduRole, setEduRole] = useState<'admin' | 'teacher' | 'parent'>('admin');

  // Simulated studio generation trigger
  const handleSimulateStudio = (sample: string) => {
    setStudioPrompt(sample);
    setIsGenerating(true);
    setGenerationStep(1);
    setTimeout(() => setGenerationStep(2), 600);
    setTimeout(() => {
      setGenerationStep(3);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <section id="products-suite" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          The ZYR0 Ecosystem
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-mono mb-4">
          Four Flagship Platforms. <br />
          <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
            One Unified Architecture.
          </span>
        </h2>
        <p className="text-base sm:text-lg text-neutral-400 leading-relaxed">
          Whether you are building next-gen web apps, managing an educational institution, running deep research, or completing verified internships — ZYR0 delivers the dedicated operating system.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* CARD 1: ZYR0 Studio (AI Builder) - 7 cols */}
        <div className="md:col-span-7 rounded-3xl bg-neutral-900/70 border border-white/10 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-sky-500/30 transition-all shadow-xl shadow-black/40">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top meta */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                    ZYR0 Studio
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      AI Web Builder
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400">Prompt-to-production web applications</p>
                </div>
              </div>
              <Link
                to="/studio"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
              >
                Launch Studio <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="text-sm text-neutral-300 mb-6 leading-relaxed">
              Generate responsive full-stack applications with React 19, Tailwind CSS, and Supabase backend with natural language prompts.
            </p>

            {/* Interactive Prompt Mini Simulator */}
            <div className="rounded-2xl bg-black/80 border border-white/10 p-4 mb-6">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span className="flex items-center gap-1.5 font-mono">
                  <Terminal className="w-3.5 h-3.5 text-sky-400" />
                  Try prompt preview:
                </span>
                <span className="text-[10px] text-neutral-500">Live Simulator</span>
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[
                  'AI SaaS Landing Page',
                  'Crypto Portfolio Tracker',
                  'EdTech Course Portal'
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => handleSimulateStudio(sample)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-all"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              {/* Simulated Editor Window */}
              <div className="rounded-xl bg-neutral-950 border border-white/5 p-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 text-[11px] text-neutral-500">
                  <span className="text-sky-400 truncate max-w-[220px]">
                    &gt; "{studioPrompt}"
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    {generationStep === 3 ? 'Ready to Deploy' : 'Generating...'}
                  </span>
                </div>
                <div className="space-y-1 text-neutral-400 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-600">1</span>
                    <span className="text-purple-400">export default function</span>{' '}
                    <span className="text-yellow-300">App()</span> {'{'}
                  </div>
                  <div className="flex items-center gap-2 pl-4">
                    <span className="text-neutral-600">2</span>
                    <span className="text-neutral-400">return &lt;<span className="text-sky-300">DashboardLayout</span> theme="dark"&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 pl-4">
                    <span className="text-neutral-600">3</span>
                    <span className="text-neutral-400">&nbsp;&nbsp;&lt;<span className="text-sky-300">LiveAnalytics</span> realtime={'{true}'} /&gt;</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-600">4</span>
                    <span>{'}'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4 text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-sky-400" /> React 19 + Tailwind
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-sky-400" /> Git Sync
              </span>
            </div>
            <Link
              to="/studio"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-semibold text-xs transition-all shadow-md shadow-sky-500/20"
            >
              Open Studio <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* CARD 2: ZYR0 Edu / School OS - 5 cols */}
        <div className="md:col-span-5 rounded-3xl bg-neutral-900/70 border border-white/10 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/30 transition-all shadow-xl shadow-black/40">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                    ZYR0 Edu
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      School OS
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400">Institution Management SaaS</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-neutral-300 mb-5 leading-relaxed">
              Complete school administration with automated fee collection, biometric attendance, and multi-role dashboards.
            </p>

            {/* Interactive Role Toggle */}
            <div className="rounded-2xl bg-black/80 border border-white/10 p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-neutral-400">Role View:</span>
                <div className="flex bg-neutral-950 p-0.5 rounded-lg border border-white/10 text-[11px]">
                  {(['admin', 'teacher', 'parent'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setEduRole(role)}
                      className={`px-2 py-1 rounded capitalize transition-all ${
                        eduRole === role
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Role Widget Preview */}
              <div className="rounded-xl bg-neutral-950 border border-white/5 p-3 text-xs">
                {eduRole === 'admin' && (
                  <div className="grid grid-cols-2 gap-2 text-neutral-300">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <div className="text-[10px] text-neutral-400">Attendance Rate</div>
                      <div className="text-base font-bold text-emerald-400 font-mono">96.8%</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <div className="text-[10px] text-neutral-400">Fee Invoices Paid</div>
                      <div className="text-base font-bold text-indigo-400 font-mono">89.2%</div>
                    </div>
                  </div>
                )}
                {eduRole === 'teacher' && (
                  <div className="space-y-1.5 text-[11px] text-neutral-300">
                    <div className="flex justify-between items-center bg-white/5 p-1.5 rounded">
                      <span>Grade 10 Math Exam</span>
                      <span className="text-emerald-400 font-mono">Graded (34/34)</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-1.5 rounded">
                      <span>Next Period: Physics</span>
                      <span className="text-sky-400 font-mono">Room 204</span>
                    </div>
                  </div>
                )}
                {eduRole === 'parent' && (
                  <div className="space-y-1.5 text-[11px] text-neutral-300">
                    <div className="flex justify-between items-center bg-white/5 p-1.5 rounded">
                      <span>Student: Rayan Khan</span>
                      <span className="text-emerald-400 font-mono">Present Today</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-1.5 rounded">
                      <span>Term 2 Report Card</span>
                      <span className="text-indigo-400 font-mono">Available</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/school"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Tour School OS <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/school"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20"
            >
              Book Demo
            </Link>
          </div>
        </div>

        {/* CARD 3: ZYR0 Research (0-AI Agent) - 5 cols */}
        <div className="md:col-span-5 rounded-3xl bg-neutral-900/70 border border-white/10 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-rose-500/30 transition-all shadow-xl shadow-black/40">
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                    0-AI Research
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      AI Agent
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400">Autonomous Deep Research</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-neutral-300 mb-5 leading-relaxed">
              Iterative recursive reasoning engine that executes literature reviews, competitive audits, and synthesizes cited reports.
            </p>

            <div className="rounded-2xl bg-black/80 border border-white/10 p-4 mb-6">
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono mb-2">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                Live Agent Reasoning Stream:
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-white/5 text-[11px] font-mono space-y-1.5">
                <div className="text-neutral-400 flex items-center justify-between">
                  <span>&gt; Sub-query 1: Extract arxiv papers</span>
                  <span className="text-emerald-400">100% Verified</span>
                </div>
                <div className="text-neutral-400 flex items-center justify-between">
                  <span>&gt; Cross-verifying citations & formulas</span>
                  <span className="text-rose-400">Synthesizing...</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/research"
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              Explore 0-AI <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/research"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-md shadow-rose-600/20"
            >
              Run Agent
            </Link>
          </div>
        </div>

        {/* CARD 4: ZYR0 Work (Internships) - 7 cols */}
        <div className="md:col-span-7 rounded-3xl bg-neutral-900/70 border border-white/10 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all shadow-xl shadow-black/40">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                    ZYR0 Work
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Internships
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400">Verified Proof-of-Work Platform</p>
                </div>
              </div>
              <Link
                to="/internships/browse"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Browse Internships <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="text-sm text-neutral-300 mb-6 leading-relaxed">
              Students build real public GitHub projects, receive rubric-based code reviews from industry mentors, and earn tamper-proof digital certificates.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-black/80 border border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Cryptographic Verification</div>
                  <div className="text-[11px] text-neutral-400">Tamper-proof digital credentials</div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/80 border border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">PR-Style Code Reviews</div>
                  <div className="text-[11px] text-neutral-400">Rubric scoring & mentor feedback</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/internships/browse"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Explore 500+ Roles <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/internships"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all shadow-md shadow-emerald-500/20"
            >
              Open Work Platform
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
