import { Reveal, StaggerContainer, StaggerItem } from './Reveal';
import { FEATURES } from '@/data/researchLandingDemo';

export function FeaturesSection() {
  return (
    <section className="rl-section">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="rl-eyebrow mb-4 inline-block">Capabilities</span>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)]">
            BUILT FOR SERIOUS RESEARCH.
          </h2>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.08}>
          {FEATURES.map((feature) => (
            <StaggerItem key={feature.title} variant="fade-up">
              <div className="p-6 rounded-xl border border-[var(--rl-border)] bg-[var(--rl-surface)] h-full rl-card-hover group">
                <div className="w-10 h-10 rounded-full bg-[var(--rl-bg)] border border-[var(--rl-border)] flex items-center justify-center mb-4 group-hover:bg-[var(--rl-accent)] group-hover:border-[var(--rl-accent)] transition-colors duration-300">
                  <span className="text-[var(--rl-accent-dark)] text-lg font-bold group-hover:text-white transition-colors duration-300">
                    {feature.title[0]}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[var(--rl-ink)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--rl-muted)] leading-relaxed">{feature.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
