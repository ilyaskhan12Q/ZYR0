import { Reveal } from './Reveal';

export function LiveResearchSection() {
  const steps = [
    { label: 'Understanding', status: 'complete' as const },
    { label: 'Building plan', status: 'complete' as const },
    { label: 'Searching', status: 'active' as const },
    { label: 'Verifying', status: 'pending' as const },
    { label: 'Writing', status: 'pending' as const },
  ];

  return (
    <section className="rl-section">
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-12">
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)]">
            WATCH THE RESEARCH HAPPEN.
          </h2>
        </Reveal>

        <Reveal>
          <div className="rounded-2xl bg-[var(--rl-surface)] border border-[var(--rl-border)] p-6 md:p-8">
            {/* Progress stepper */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    step.status === 'complete' ? 'bg-[var(--rl-accent)]' :
                    step.status === 'active' ? 'bg-[var(--rl-ink)] animate-pulse' :
                    'bg-[var(--rl-border)]'
                  }`} />
                  <span className={`text-xs font-medium hidden sm:inline ${
                    step.status === 'active' ? 'text-[var(--rl-ink)]' : 'text-[var(--rl-muted)]'
                  }`}>
                    {step.label}
                  </span>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block w-8 h-px bg-[var(--rl-border)]" />
                  )}
                </div>
              ))}
            </div>

            {/* Research areas chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['Foundations', 'Technical', 'Benchmarks', 'Constraints'].map((area) => (
                <span key={area} className="rl-chip">{area}</span>
              ))}
            </div>

            {/* Source cards appearing */}
            <div className="flex flex-col gap-3">
              {[
                { title: 'Impact of AI on Higher Education: A Systematic Review', source: 'OpenAlex', year: 2024 },
                { title: 'Generative AI in the Classroom: Opportunities and Challenges', source: 'arXiv', year: 2024 },
                { title: 'University Faculty Perspectives on AI Integration', source: 'Semantic Scholar', year: 2023 },
              ].map((src, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border border-[var(--rl-border)] bg-[var(--rl-bg)]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--rl-ink)] truncate">{src.title}</p>
                    <p className="text-xs text-[var(--rl-muted)]">{src.source} · {src.year}</p>
                  </div>
                  <span className="rl-chip ml-3 shrink-0">✓ Verified</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
