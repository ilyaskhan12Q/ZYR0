import { Reveal, StaggerContainer, StaggerItem } from './Reveal';

export function EditorialStatement() {
  return (
    <section className="rl-section">
      <div className="max-w-4xl mx-auto">
        <StaggerContainer className="text-center" stagger={0.15}>
          <StaggerItem variant="fade-up">
            <span className="rl-eyebrow mb-6 inline-block">The problem</span>
          </StaggerItem>

          <StaggerItem variant="fade-up">
            <h2 className="rl-display rl-statement-text text-[var(--rl-ink)] mb-2">
              THE INTERNET HAS ANSWERS.
            </h2>
          </StaggerItem>

          <StaggerItem variant="fade-up">
            <h2 className="rl-display rl-statement-text text-[var(--rl-muted)] mb-8">
              BUT FINDING THE RIGHT EVIDENCE<br className="hidden md:block" /> IS ANOTHER PROBLEM.
            </h2>
          </StaggerItem>

          <StaggerItem variant="fade-up">
            <p className="rl-subheading text-[var(--rl-muted)] max-w-2xl mx-auto mb-12">
              Surface-level search returns surface-level understanding. ZYROO Research Agent
              digs deeper — across sources, across disciplines, across time.
            </p>
          </StaggerItem>
        </StaggerContainer>

        {/* Decorative citation grid with staggered reveal */}
        <StaggerContainer className="grid grid-cols-3 gap-4 opacity-30" stagger={0.1}>
          <StaggerItem variant="scale">
            <div className="h-28 md:h-36 rounded-xl bg-[var(--rl-border)]" style={{ opacity: 1.0 }} />
          </StaggerItem>
          <StaggerItem variant="scale">
            <div className="h-28 md:h-36 rounded-xl bg-[var(--rl-border)]" style={{ opacity: 0.6 }} />
          </StaggerItem>
          <StaggerItem variant="scale">
            <div className="h-28 md:h-36 rounded-xl bg-[var(--rl-border)]" style={{ opacity: 0.3 }} />
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
