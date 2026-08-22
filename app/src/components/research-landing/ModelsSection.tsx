import { Reveal, StaggerContainer, StaggerItem } from './Reveal';

const models = [
  { name: 'Quick', description: 'Fast results for simple questions', tag: '' },
  { name: 'Standard', description: 'Balanced depth and speed', tag: 'Recommended' },
  { name: 'Deep', description: 'Thorough research for complex topics', tag: '' },
];

export function ModelsSection() {
  return (
    <section className="rl-section" style={{ backgroundColor: 'var(--rl-surface)' }}>
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-12">
          <span className="rl-eyebrow mb-4 inline-block">Research depth</span>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)]">
            THE RIGHT DEPTH FOR THE RIGHT QUESTION.
          </h2>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" stagger={0.1}>
          {models.map((model) => (
            <StaggerItem key={model.name} variant="fade-up">
              <div
                className={`p-6 rounded-xl border text-center transition-all duration-300 group ${
                  model.tag
                    ? 'border-[var(--rl-accent)] bg-[var(--rl-bg)] shadow-sm hover:shadow-md hover:scale-[1.02]'
                    : 'border-[var(--rl-border)] bg-[var(--rl-surface)] hover:border-[var(--rl-accent)] hover:shadow-sm'
                }`}
              >
                {model.tag && <span className="rl-chip mb-3 inline-block">{model.tag}</span>}
                <h3 className="text-lg font-semibold text-[var(--rl-ink)] mb-2 group-hover:text-[var(--rl-accent-dark)] transition-colors">
                  {model.name}
                </h3>
                <p className="text-sm text-[var(--rl-muted)]">{model.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
