import { Reveal } from './Reveal';
import { PIPELINE_STAGES, RESEARCH_AREAS } from '@/data/researchLandingDemo';

export function ResearchEngine() {
  return (
    <section id="how-it-works" className="rl-section" style={{ backgroundColor: 'var(--rl-surface)' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="rl-eyebrow mb-4 inline-block">How it works</span>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)]">
            ONE QUESTION. MULTIPLE LINES OF RESEARCH.
          </h2>
        </Reveal>

        {/* Pipeline flow */}
        <Reveal className="mb-16">
          <div className="flex flex-wrap justify-center gap-2 md:gap-0">
            {PIPELINE_STAGES.map((stage, i) => (
              <div key={stage.id} className="flex items-center">
                <div className="flex flex-col items-center gap-2 px-3 md:px-4">
                  <div className="w-3 h-3 rounded-full border-2 border-[var(--rl-accent)] bg-[var(--rl-bg)]" />
                  <span className="text-xs font-medium text-[var(--rl-ink)] whitespace-nowrap">{stage.label}</span>
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <div className="hidden md:block w-8 h-px bg-[var(--rl-border)]" />
                )}
              </div>
            ))}
          </div>
        </Reveal>

        {/* Four research areas */}
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {RESEARCH_AREAS.map((area, i) => (
              <div
                key={area.id}
                className="p-6 rounded-xl border border-[var(--rl-border)] bg-[var(--rl-bg)]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--rl-accent)]" />
                  <span className="rl-eyebrow text-[var(--rl-accent-dark)]">{area.label}</span>
                </div>
                <p className="text-sm text-[var(--rl-muted)]">{area.description}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
