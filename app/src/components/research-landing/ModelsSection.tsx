import { Reveal } from './Reveal';

export function ModelsSection() {
  const models = [
    { name: 'Quick', description: 'Fast results for simple questions', tag: '' },
    { name: 'Standard', description: 'Balanced depth and speed', tag: 'Recommended' },
    { name: 'Deep', description: 'Thorough research for complex topics', tag: '' },
  ];

  return (
    <section className="rl-section" style={{ backgroundColor: 'var(--rl-surface)' }}>
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-12">
          <span className="rl-eyebrow mb-4 inline-block">Research depth</span>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)]">
            THE RIGHT DEPTH FOR THE RIGHT QUESTION.
          </h2>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {models.map((model) => (
              <div
                key={model.name}
                className={`p-6 rounded-xl border text-center ${
                  model.tag
                    ? 'border-[var(--rl-accent)] bg-[var(--rl-bg)]'
                    : 'border-[var(--rl-border)] bg-[var(--rl-surface)]'
                }`}
              >
                {model.tag && <span className="rl-chip mb-3 inline-block">{model.tag}</span>}
                <h3 className="text-lg font-semibold text-[var(--rl-ink)] mb-2">{model.name}</h3>
                <p className="text-sm text-[var(--rl-muted)]">{model.description}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
