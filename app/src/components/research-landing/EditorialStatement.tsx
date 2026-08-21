import { Reveal } from './Reveal';

export function EditorialStatement() {
  return (
    <section className="rl-section">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <p className="rl-display rl-statement-text text-[var(--rl-ink)] mb-2">
            THE INTERNET HAS ANSWERS.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="rl-display rl-statement-text text-[var(--rl-muted)] mb-8">
            BUT FINDING THE RIGHT EVIDENCE IS ANOTHER PROBLEM.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="rl-subheading text-[var(--rl-muted)] max-w-2xl">
            Search engines return pages. Academia returns papers. Neither tells you what actually matters — or whether it's true. ZYR0 brings the process together: from question to verified, sourced research.
          </p>
        </Reveal>

        {/* Monochrome collage — citation fragments */}
        <Reveal delay={0.3} className="mt-12 grid grid-cols-3 gap-4 opacity-40">
          <div className="h-32 rounded-lg bg-[var(--rl-border)]" />
          <div className="h-32 rounded-lg bg-[var(--rl-border)]" style={{ opacity: 0.6 }} />
          <div className="h-32 rounded-lg bg-[var(--rl-border)]" style={{ opacity: 0.3 }} />
        </Reveal>
      </div>
    </section>
  );
}
