import type { ReactNode } from 'react';
import { useReducedMotion, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Users, Layers, CalendarClock } from 'lucide-react';
import { TEAM_ROLES, STATUS_META } from './team-data';
import { CanvasParticles } from '@/components/CanvasParticles';
import { cn } from '@/lib/utils';

const OPEN_ROLES = TEAM_ROLES.length;
const DEPARTMENTS = new Set(TEAM_ROLES.map((r) => r.department)).size;
const OPEN_POSITIONS = TEAM_ROLES.reduce((sum, r) => sum + r.positions, 0);

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function Float({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5.5, delay, repeat: Infinity, ease: 'easeInOut' }}
      className={cn('will-change-transform', className)}
    >
      {children}
    </motion.div>
  );
}

/* ── Git contribution graph square (deterministic pattern) ── */
function ContributionCell({ level }: { level: 0 | 1 | 2 | 3 }) {
  const intensity = [
    'bg-slate-200/70 dark:bg-slate-800/60',
    'bg-emerald-300/50 dark:bg-emerald-500/20',
    'bg-emerald-400/60 dark:bg-emerald-500/40',
    'bg-emerald-500 dark:bg-emerald-400',
  ][level];
  return <div className={cn('w-2.5 h-2.5 rounded-[3px]', intensity)} />;
}

const CONTRIBUTION_PATTERN: (0 | 1 | 2 | 3)[][] = [
  [0, 1, 0, 2, 1, 3, 2, 1, 0, 2, 1, 3],
  [2, 0, 1, 3, 0, 1, 0, 2, 3, 0, 2, 0],
  [1, 3, 2, 0, 2, 0, 2, 1, 0, 2, 0, 1],
  [0, 1, 0, 2, 3, 2, 0, 3, 1, 0, 3, 2],
  [3, 2, 1, 0, 1, 0, 3, 0, 2, 1, 0, 1],
  [1, 0, 3, 2, 0, 3, 1, 2, 0, 3, 2, 0],
  [0, 2, 0, 1, 3, 0, 2, 0, 1, 0, 1, 3],
];

function RoleFloater({
  role,
  compact = false,
}: {
  role: (typeof TEAM_ROLES)[number];
  compact?: boolean;
}) {
  const Icon = role.icon;
  const status = STATUS_META[role.status];
  return (
    <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-xl px-3.5 py-2.5 flex items-center gap-3 max-w-[260px]">
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', role.accent)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
          {role.title}
        </p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              role.status === 'open' ? 'bg-emerald-500' : 'bg-amber-500'
            )}
          />
          {role.department} · {status.label}
        </p>
      </div>
      {!compact && (
        <span className="ml-1 shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-sky-400">
          {role.positions} spots
        </span>
      )}
    </div>
  );
}

export function FoundingHero() {
  const reduce = useReducedMotion();
  const featuredRoles = [TEAM_ROLES[1], TEAM_ROLES[0], TEAM_ROLES[2]];

  return (
    <section
      aria-label="Founding Development Team"
      className="relative flex items-center justify-center overflow-hidden hero-gradient pt-28 pb-16 lg:pt-36 lg:pb-24"
    >
      <CanvasParticles />

      {/* Layered radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_75%_at_50%_-20%,rgba(16,185,129,0.14),rgba(79,70,229,0.16),transparent_80%)] pointer-events-none" />
      <div className="hidden lg:block absolute top-1/4 left-1/6 w-[42vw] max-w-[480px] h-[42vw] max-h-[480px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="hidden lg:block absolute bottom-1/4 right-1/6 w-[42vw] max-w-[480px] h-[42vw] max-h-[480px] bg-indigo-500/12 rounded-full blur-[160px] pointer-events-none" />

      {/* Subtle masked grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left — narrative */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 lg:space-y-7 text-left">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="inline-flex items-center gap-2.5 self-start bg-white/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 backdrop-blur-xl rounded-full px-4 py-1.5 text-xs text-slate-900 dark:text-white/90 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span className="font-label text-[10px] tracking-[0.2em] text-blue-600 dark:text-sky-400">
                Founding Development Team
              </span>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display font-[800] text-4xl xs:text-5xl sm:text-6xl lg:text-[3.8rem] tracking-[-0.035em] text-slate-900 dark:text-white leading-[1.07]"
            >
              Build the platform that{' '}
              <span className="font-accent text-gradient-v3">launches student careers.</span>
            </motion.div>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-300/80 max-w-xl leading-relaxed"
            >
              ZYR0 is assembling a <strong className="font-semibold text-slate-900 dark:text-white">founding development team</strong> of
              students to design, build, and ship the internship platform of record. We work in the
              open, our standards are professional, and every contribution is credited.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5 pt-1"
            >
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-white font-display font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm sm:text-base border border-sky-400/30"
              >
                Explore Open Roles
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => scrollToId('team-culture')}
                className="inline-flex items-center justify-center gap-2 bg-slate-900/80 hover:bg-slate-800/90 text-white border border-white/20 backdrop-blur-xl px-6 py-3.5 rounded-xl font-display font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm sm:text-base shadow-md hover:border-white/30"
              >
                How We Work
              </button>
            </motion.div>

            {/* Floating metrics */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{OPEN_ROLES}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Open roles</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{DEPARTMENTS}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Disciplines</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{OPEN_POSITIONS}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Open positions</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">8–12</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hours / week</p>
              </div>
            </motion.div>
          </div>

          {/* Right — team workspace / git visualisation */}
          <div className="lg:col-span-6 relative w-full h-[480px] sm:h-[520px] flex items-center justify-center">
            <div className="absolute w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute w-56 h-56 bg-indigo-500/15 rounded-full blur-3xl -top-10 -right-10 pointer-events-none" />

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-md relative"
            >
              {/* Main repo window */}
              <div className="bg-slate-950/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">zyr0.co/careers</span>
                  <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    FOUNDING TEAM
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Contribution graph */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-300">Contribution Activity</span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        live
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {CONTRIBUTION_PATTERN.map((week, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          {week.map((level, j) => (
                            <ContributionCell key={j} level={level} />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Sprint progress */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Sprint Progress</span>
                    <span className="text-emerald-400 font-mono font-bold">7 workflows live</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400"
                      style={{ width: '72%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Floating role cards */}
              <Float delay={0} className="absolute -left-6 sm:-left-10 top-6 z-10 hidden sm:block">
                <RoleFloater role={featuredRoles[0]} />
              </Float>
              <Float delay={1.1} className="absolute -right-4 sm:-right-8 top-24 z-10">
                <RoleFloater role={featuredRoles[1]} />
              </Float>
              <Float delay={0.5} className="absolute -left-4 sm:-left-8 -bottom-4 z-10 hidden sm:block">
                <RoleFloater role={featuredRoles[2]} compact />
              </Float>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
