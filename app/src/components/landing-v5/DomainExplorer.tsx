import { useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Clock, ChevronRight, TerminalSquare } from 'lucide-react';
import { TRACKS, EXPLORER_TASKS, type TrackId } from './explorer-data';
import { Reveal } from './motion';

export function DomainExplorer() {
  const [active, setActive] = useState<TrackId>('all');
  const activeFlag = TRACKS.find((t) => t.id === active)?.flag ?? '--all';
  const tasks = EXPLORER_TASKS.filter((t) => active === 'all' || t.track === active);

  return (
    <section className="py-20 lg:py-28 content-visibility-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl mb-10">
          <span className="v5-eyebrow text-[#38bdf8]">Live Workspace</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Pick a track.{' '}
            <span className="font-accent text-[#38bdf8]">Ship a real task.</span>
          </h2>
          <p className="mt-4 text-[#a2a2c3] leading-relaxed">
            Every task is an actual engineering assignment with acceptance criteria, mentor review,
            and a place in your permanent record.
          </p>
        </Reveal>

        {/* Command-palette bar */}
        <Reveal delay={0.08}>
          <div className="v5-card rounded-xl p-2 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2.5 flex-1 px-3 py-2.5 rounded-lg bg-black/30 border border-white/[0.06]">
              <TerminalSquare className="w-4 h-4 text-[#38bdf8] shrink-0" />
              <span className="v5-mono text-sm text-white/85">
                <span className="text-[#38bdf8]">&gt;</span> select_track:{' '}
                <span className="text-[#34d399]">{activeFlag}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 px-1">
              {TRACKS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`v5-mono text-xs px-3 py-2 rounded-md border transition-colors ${
                    active === t.id
                      ? 'border-[#0284c7] text-[#38bdf8] bg-[#0284c7]/10'
                      : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Task grid */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <m.article
                key={task.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="v5-card rounded-xl p-5 hover:border-[#0284c7] transition-colors duration-150 group cursor-default"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-[15px] font-semibold text-white leading-snug">
                    {task.title}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-[#38bdf8] group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                </div>
                <div className="mt-4 flex items-center gap-3 text-[12px] text-white/50">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    ~{task.hours}h
                  </span>
                  <span
                    className={`v5-mono text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded border ${
                      task.difficulty === 'Beginner'
                        ? 'border-[#10b981]/35 text-[#34d399]'
                        : task.difficulty === 'Intermediate'
                          ? 'border-[#38bdf8]/35 text-[#38bdf8]'
                          : 'border-[#818cf8]/40 text-[#818cf8]'
                    }`}
                  >
                    {task.difficulty}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/[0.06] v5-mono text-[12px] text-white/55">
                  [{task.stack.map((s) => `"${s}"`).join(', ')}]
                </div>
              </m.article>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
