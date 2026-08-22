import { Reveal, StaggerContainer, StaggerItem } from './Reveal';
import { AUDIENCES } from '@/data/researchLandingDemo';

export function AudienceSection() {
  return (
    <section className="rl-section" style={{ backgroundColor: 'var(--rl-surface)' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="rl-eyebrow mb-4 inline-block">Who it's for</span>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)]">
            BUILT FOR PEOPLE WHO NEED TO KNOW.
          </h2>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" stagger={0.12}>
          {AUDIENCES.map((audience) => (
            <StaggerItem key={audience.title} variant="fade-up">
              <div className="flex flex-col h-full p-6 rounded-xl border border-transparent hover:border-[var(--rl-border)] hover:bg-[var(--rl-bg)] transition-all duration-300 group">
                <h3 className="rl-display text-xl text-[var(--rl-ink)] mb-3 group-hover:text-[var(--rl-accent-dark)] transition-colors">
                  {audience.title}
                </h3>
                <p className="text-sm text-[var(--rl-muted)] leading-relaxed mb-4">{audience.description}</p>
                <ul className="flex flex-col gap-2 mt-auto">
                  {audience.list.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[var(--rl-ink)]">
                      <span className="w-1 h-1 rounded-full bg-[var(--rl-accent)] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
