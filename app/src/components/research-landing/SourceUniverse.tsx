import { Reveal, StaggerContainer, StaggerItem } from './Reveal';

const SOURCES = [
  'OpenAlex',
  'arXiv',
  'Semantic Scholar',
  'PubMed',
  'JSTOR',
  'IEEE Xplore',
  'ACL Anthology',
  'Jina Web Search',
];

const STATS = [
  { value: '247', label: 'Sources indexed' },
  { value: '18', label: 'Verified per report' },
  { value: '4', label: 'Research dimensions' },
];

export function SourceUniverse() {
  return (
    <section className="rl-dark-section rl-section-full overflow-hidden">
      <div className="rl-section">
        <Reveal variant="fade-up">
          <p className="rl-eyebrow-light text-[#657C68] mb-4">Trusted sources</p>
        </Reveal>
        <Reveal variant="fade-up" delay={0.05}>
          <h2 className="rl-display rl-heading-text text-white mb-12">
            ACADEMIC + WEB SOURCES.
          </h2>
        </Reveal>

        {/* Logo marquee */}
        <Reveal variant="fade-up" delay={0.1}>
          <div className="rl-logo-marquee mb-16">
            <div className="rl-logo-track">
              {[...SOURCES, ...SOURCES].map((source, i) => (
                <span
                  key={`${source}-${i}`}
                  className="text-xl md:text-2xl font-medium text-[#444] whitespace-nowrap tracking-tight"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                >
                  {source}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Stats */}
        <StaggerContainer className="grid grid-cols-3 gap-8 border-t border-[#333] pt-12" stagger={0.1}>
          {STATS.map((stat) => (
            <StaggerItem key={stat.label} variant="fade-up">
              <div className="text-center">
                <p className="rl-display text-4xl md:text-5xl text-white mb-2">{stat.value}</p>
                <p className="text-sm text-[#666]">{stat.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
