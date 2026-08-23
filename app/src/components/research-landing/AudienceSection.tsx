import { Reveal, StaggerContainer, StaggerItem } from './Reveal';

const AUDIENCES = [
  {
    title: 'Students',
    description: 'Literature reviews, thesis research, understanding complex topics. Get verified sources and structured reports instead of scanning hundreds of search results.',
    list: ['Literature reviews', 'Thesis research', 'Topic exploration', 'Source verification'],
  },
  {
    title: 'Researchers',
    description: 'Rapid landscape surveys, cross-domain exploration, finding connections between fields. Start with a question and get a citation-backed overview in minutes.',
    list: ['Landscape surveys', 'Cross-domain exploration', 'Gap identification', 'Citation tracking'],
  },
  {
    title: 'Developers',
    description: 'Technical research, API documentation synthesis, understanding frameworks and architectures. Deep-dive into any technology with verified references.',
    list: ['Technical research', 'API synthesis', 'Framework comparison', 'Architecture analysis'],
  },
];

export function AudienceSection() {
  return (
    <section className="rl-section-full" style={{ backgroundColor: 'var(--rl-bg)' }}>
      <div className="rl-section">
        <Reveal variant="fade-up">
          <p className="rl-eyebrow mb-4">Who it's for</p>
        </Reveal>
        <Reveal variant="fade-up" delay={0.05}>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)] mb-12">
            BUILT FOR PEOPLE WHO NEED TO KNOW.
          </h2>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" stagger={0.1}>
          {AUDIENCES.map((a) => (
            <StaggerItem key={a.title} variant="fade-up">
              <div className="border border-[var(--rl-border)] rounded-xl p-6 bg-[var(--rl-surface)] rl-card-hover h-full flex flex-col">
                <h3 className="text-xl font-semibold text-[var(--rl-ink)] mb-3">{a.title}</h3>
                <p className="text-sm text-[var(--rl-muted)] leading-relaxed mb-4">{a.description}</p>
                <ul className="flex flex-col gap-2 mt-auto">
                  {a.list.map((item) => (
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
