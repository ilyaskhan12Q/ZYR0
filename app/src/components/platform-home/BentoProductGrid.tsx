import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Terminal, ShieldCheck, CheckCircle2, GitPullRequest, School, BrainCircuit, Code, Briefcase, Cpu } from 'lucide-react';
import Reveal from './Reveal';

export default function BentoProductGrid() {
  return (
    <section id="products" className="py-20 md:py-28 relative">
      <div className="max-w-[1264px] mx-auto px-6 md:px-16">
        <Reveal>
          <div className="max-w-2xl mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 border"
              style={{
                color: 'var(--zyro-accent)',
                borderColor: 'var(--zyro-border)',
                background: 'var(--zyro-accent-muted)',
              }}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Core Ecosystem</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold mb-4 text-white tracking-tight"
            >
              Four interconnected products. One vision.
            </h2>
            <p
              className="text-base sm:text-lg leading-relaxed"
              style={{ color: 'var(--zyro-text-secondary)' }}
            >
              Every product is an autonomous powerhouse on its own, designed to scale seamlessly
              whether you are building software, managing institutions, synthesizing research, or launching careers.
            </p>
          </div>
        </Reveal>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {/* Card 1: ZYR0 Studio (Hero card - 8 cols) */}
          <Reveal delay={0.05} className="md:col-span-12 lg:col-span-8">
            <Link
              to="/studio"
              className="group relative rounded-2xl border overflow-hidden transition-all duration-300 block h-full flex flex-col justify-between hover:border-sky-500/40 hover:shadow-[0_0_30px_rgba(56,189,248,0.12)]"
              style={{
                background: 'linear-gradient(180deg, rgba(26,26,46,0.85) 0%, rgba(18,1,89,0.3) 100%)',
                borderColor: 'var(--zyro-border)',
              }}
            >
              {/* Top product preview canvas */}
              <div className="p-6 sm:p-8 pb-4 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                      <Code className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-white">ZYR0 Studio</h3>
                        <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                          AI Web & App Builder
                        </span>
                      </div>
                      <p className="text-xs text-white/50">Prompt-to-production full-stack apps in seconds</p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-sky-400 font-medium group-hover:translate-x-1 transition-transform">
                    <span>Open Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Studio Mockup Interface */}
                <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/40 p-4 shadow-inner">
                  {/* Prompt bar mockup */}
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] mb-3">
                    <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="text-xs text-white/70 font-mono truncate">
                      Build an analytics dashboard with real-time telemetry and dark mode...
                    </span>
                    <span className="ml-auto hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 shrink-0">
                      ⌘K Generate
                    </span>
                  </div>

                  {/* Code & Preview Split Mockup */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-black/60 p-3 border border-white/[0.04] font-mono text-[11px] text-white/60">
                      <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-white/[0.06] text-white/40">
                        <Terminal className="w-3 h-3 text-sky-400" />
                        <span>App.tsx</span>
                      </div>
                      <p className="text-sky-300">import <span className="text-white">{"{ ZYRO }"}</span> from <span className="text-emerald-300">&apos;@zyro/core&apos;</span>;</p>
                      <p className="text-white/40 mt-1">export default function Dashboard() &#123;</p>
                      <p className="text-white/60 pl-3">return &lt;ZYRO.Telemetry live /&gt;;</p>
                      <p className="text-white/40">&#125;</p>
                    </div>

                    <div className="rounded-lg bg-sky-950/20 border border-sky-500/10 p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] text-white/50 mb-2">
                        <span className="flex items-center gap-1 text-sky-300 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Preview
                        </span>
                        <span>0.4s Build</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-white/70 font-mono">React 19</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-white/70 font-mono">Tailwind CSS</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">Cloudflare Edge</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Feature Tags */}
              <div className="p-6 sm:p-8 pt-3 flex flex-wrap gap-2 border-t border-white/[0.04]">
                {['Natural Language to App', 'Live Canvas Preview', 'One-Click Cloud Hosting', 'Full Git Sync'].map((feat) => (
                  <span key={feat} className="text-xs px-2.5 py-1 rounded-md bg-white/[0.03] text-white/70 border border-white/[0.06]">
                    {feat}
                  </span>
                ))}
              </div>
            </Link>
          </Reveal>

          {/* Card 2: ZYR0 Edu (School OS) - 4 cols */}
          <Reveal delay={0.1} className="md:col-span-12 lg:col-span-4">
            <Link
              to="/school"
              className="group relative rounded-2xl border overflow-hidden transition-all duration-300 block h-full flex flex-col justify-between hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(129,140,248,0.12)]"
              style={{
                background: 'linear-gradient(180deg, rgba(26,26,46,0.85) 0%, rgba(18,1,89,0.3) 100%)',
                borderColor: 'var(--zyro-border)',
              }}
            >
              <div className="p-6 sm:p-8 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <School className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    School OS
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">ZYR0 Edu</h3>
                <p className="text-xs text-white/50 mb-5">Modern operating system for schools & academies</p>

                {/* Edu Mockup Widget */}
                <div className="rounded-xl border border-white/[0.08] bg-black/40 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
                    <span className="text-white/60 font-medium">Daily Attendance</span>
                    <span className="text-emerald-400 font-mono font-semibold">98.4% Present</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
                    <span className="text-white/60 font-medium">Smart Fee Invoicing</span>
                    <span className="text-indigo-300 font-mono">Automated Receipt</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60 font-medium">Timetable Engine</span>
                    <span className="text-white/80 text-[11px] font-mono">AI Substitution Active</span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-3 flex flex-wrap gap-1.5 border-t border-white/[0.04]">
                {['Multi-Role Portals', 'Biometrics', 'Smart Invoicing'].map((feat) => (
                  <span key={feat} className="text-xs px-2 py-0.5 rounded-md bg-white/[0.03] text-white/70 border border-white/[0.06]">
                    {feat}
                  </span>
                ))}
              </div>
            </Link>
          </Reveal>

          {/* Card 3: ZYR0 Research (4 cols) */}
          <Reveal delay={0.15} className="md:col-span-12 lg:col-span-4">
            <Link
              to="/research"
              className="group relative rounded-2xl border overflow-hidden transition-all duration-300 block h-full flex flex-col justify-between hover:border-rose-500/40 hover:shadow-[0_0_30px_rgba(244,63,94,0.12)]"
              style={{
                background: 'linear-gradient(180deg, rgba(26,26,46,0.85) 0%, rgba(18,1,89,0.3) 100%)',
                borderColor: 'var(--zyro-border)',
              }}
            >
              <div className="p-6 sm:p-8 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    Autonomous Agent
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">ZYR0 Research</h3>
                <p className="text-xs text-white/50 mb-5">Autonomous deep research engine with verified citations</p>

                {/* Research Mockup Widget */}
                <div className="rounded-xl border border-white/[0.08] bg-black/40 p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-rose-300">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                    <span>Recursive Search Loop · Step 3/4</span>
                  </div>
                  <p className="text-[11px] text-white/70 font-mono bg-white/[0.03] p-2 rounded border border-white/[0.04]">
                    Synthesized 38 arXiv papers on quantum algorithms & LaTeX models.
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-white/40 pt-1">
                    <span>100% Citation Backed</span>
                    <span className="text-rose-300">PDF / Markdown</span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-3 flex flex-wrap gap-1.5 border-t border-white/[0.04]">
                {['Multi-Step Agent', 'Verified Sources', 'LaTeX Reports'].map((feat) => (
                  <span key={feat} className="text-xs px-2 py-0.5 rounded-md bg-white/[0.03] text-white/70 border border-white/[0.06]">
                    {feat}
                  </span>
                ))}
              </div>
            </Link>
          </Reveal>

          {/* Card 4: ZYR0 Work (8 cols) */}
          <Reveal delay={0.2} className="md:col-span-12 lg:col-span-8">
            <Link
              to="/internships"
              className="group relative rounded-2xl border overflow-hidden transition-all duration-300 block h-full flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(52,211,153,0.12)]"
              style={{
                background: 'linear-gradient(180deg, rgba(26,26,46,0.85) 0%, rgba(18,1,89,0.3) 100%)',
                borderColor: 'var(--zyro-border)',
              }}
            >
              <div className="p-6 sm:p-8 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-white">ZYR0 Work</h3>
                        <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Proof-of-Work Internships
                        </span>
                      </div>
                      <p className="text-xs text-white/50">Project-driven engineering internships with verifiable credentials</p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-medium group-hover:translate-x-1 transition-transform">
                    <span>Explore Internships</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Work Mockup Card */}
                <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/40 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-black/60 p-3 border border-white/[0.04]">
                      <div className="flex items-center gap-2 mb-2 text-emerald-400 font-mono text-[11px]">
                        <GitPullRequest className="w-3.5 h-3.5" />
                        <span>Pull Request #89 Reviewed & Merged</span>
                      </div>
                      <p className="text-white/70 text-[11px]">
                        Production task: Implement JWT token rotation with Redis cache. Approved by Senior Tech Lead.
                      </p>
                    </div>

                    <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/10 p-3 flex flex-col justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Cryptographic Certificate</span>
                      </div>
                      <div className="text-[10px] font-mono text-white/60 mt-2 space-y-0.5">
                        <p>ID: <span className="text-white/90">ZYR0-2026-ENG-8492</span></p>
                        <p className="text-emerald-400/80">SHA-256 Tamper-Proof Verified</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-3 flex flex-wrap gap-2 border-t border-white/[0.04]">
                {['Real GitHub Repos', 'Split-Pane Code Reviews', 'Publicly Verifiable Credentials', 'Fast-Track Hiring'].map((feat) => (
                  <span key={feat} className="text-xs px-2.5 py-1 rounded-md bg-white/[0.03] text-white/70 border border-white/[0.06]">
                    {feat}
                  </span>
                ))}
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
