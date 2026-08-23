import { Reveal, StaggerContainer, StaggerItem } from './Reveal';

const AUDIENCES = [
  {
    title: 'Students',
    description: 'Literature reviews, thesis research, understanding complex topics.',
    list: ['Literature reviews', 'Thesis research', 'Topic exploration', 'Source verification'],
    gradient: 'from-[#657C68] to-[#455A49]',
  },
  {
    title: 'Researchers',
    description: 'Rapid landscape surveys, cross-domain exploration, finding connections.',
    list: ['Landscape surveys', 'Cross-domain exploration', 'Gap identification', 'Citation tracking'],
    gradient: 'from-[#455A49] to-[#333]',
  },
  {
    title: 'Developers',
    description: 'Technical research, API documentation synthesis, framework deep-dives.',
    list: ['Technical research', 'API synthesis', 'Framework comparison', 'Architecture analysis'],
    gradient: 'from-[#333] to-[#111]',
  },
];

export function AudienceSection() {
  return (
    <section className="rl-section-full" style={{ backgroundColor: 'var(--rl-surface)' }}>
      <div className="rl-section">
        <Reveal variant="fade-up">
          <p className="rl-eyebrow mb-3">Who it's for</p>
        </Reveal>
        <Reveal variant="fade-up" delay={0.05}>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)] mb-8">
            BUILT FOR PEOPLE<br />WHO NEED TO KNOW.
          </h2>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4" stagger={0.08}>
          {AUDIENCES.map((a) => (
            <StaggerItem key={a.title} variant="fade-up">
              <div className="rounded-xl overflow-hidden border border-[var(--rl-border)] bg-[var(--rl-bg)] rl-card-hover group">
                {/* Image placeholder */}
                <div className={`h-32 bg-gradient-to-br ${a.gradient} flex items-end p-4`}>
                  <div className="flex flex-wrap gap-1.5">
                    {a.list.map((item) => (
                      <span key={item} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/20 text-white/90 backdrop-blur-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Copy */}
                <div className="p-4">
                  <h3 className="text-base font-semibold text-[var(--rl-ink)] mb-1">{a.title}</h3>
                  <p className="text-sm text-[var(--rl-muted)] leading-relaxed">{a.description}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
