import { Reveal } from './Reveal';

export function SourceUniverse() {
  return (
    <section className="rl-section" style={{ backgroundColor: 'var(--rl-surface)' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-12">
          <span className="rl-eyebrow mb-4 inline-block">Sources</span>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)]">
            FROM THE LITERATURE TO THE EVIDENCE.
          </h2>
        </Reveal>

        {/* Asymmetric composition */}
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left — large paper card */}
            <div className="md:col-span-2 p-6 rounded-xl border border-[var(--rl-border)] bg-[var(--rl-bg)]">
              <div className="rl-eyebrow text-[var(--rl-accent-dark)] mb-2">OpenAlex</div>
              <p className="text-sm font-medium text-[var(--rl-ink)] mb-2">
                Impact of AI on Higher Education: A Systematic Review of 127 Studies
              </p>
              <p className="text-xs text-[var(--rl-muted)] mb-3">
                Chen, L., Martinez, A. · 2024 · DOI: 10.1234/example
              </p>
              <p className="text-xs text-[var(--rl-muted)] leading-relaxed">
                This systematic review examines 127 peer-reviewed studies published between 2020 and 2024 on the integration of generative AI tools in higher education...
              </p>
            </div>

            {/* Right — stacked metadata */}
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl border border-[var(--rl-border)] bg-[var(--rl-bg)]">
                <div className="rl-eyebrow text-[var(--rl-muted)] mb-1">Sources found</div>
                <p className="rl-display text-3xl text-[var(--rl-ink)]">247</p>
              </div>
              <div className="p-4 rounded-xl border border-[var(--rl-border)] bg-[var(--rl-bg)]">
                <div className="rl-eyebrow text-[var(--rl-muted)] mb-1">After verification</div>
                <p className="rl-display text-3xl text-[var(--rl-accent-dark)]">18</p>
              </div>
              <div className="p-4 rounded-xl border border-[var(--rl-border)] bg-[var(--rl-bg)]">
                <div className="rl-eyebrow text-[var(--rl-muted)] mb-1">Coverage</div>
                <p className="rl-display text-3xl text-[var(--rl-ink)]">4</p>
                <p className="text-xs text-[var(--rl-muted)]">research dimensions</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
