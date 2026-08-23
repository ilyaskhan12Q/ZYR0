import { Reveal, StaggerContainer, StaggerItem } from './Reveal';

const CLAIMS = [
  {
    claim: 'Generative AI adoption in higher education increased by 40% between 2023 and 2025.',
    sources: [
      { id: 1, name: 'Educause Review, Vol. 59', type: 'Journal' },
      { id: 2, name: 'arXiv:2401.03912', type: 'Preprint' },
    ],
  },
  {
    claim: 'Transformer-based models outperform RNNs on long-document summarization tasks.',
    sources: [
      { id: 3, name: 'ACL 2024 Proceedings', type: 'Conference' },
      { id: 4, name: 'Semantic Scholar: 847 citations', type: 'Database' },
    ],
  },
];

export function EvidenceSection() {
  return (
    <section className="rl-section-full" style={{ backgroundColor: 'var(--rl-bg)' }}>
      <div className="rl-section">
        <div className="max-w-3xl mb-12">
          <Reveal variant="fade-up">
            <p className="rl-eyebrow mb-4">Evidence</p>
          </Reveal>
          <Reveal variant="fade-up" delay={0.05}>
            <h2 className="rl-display rl-heading-text text-[var(--rl-ink)] mb-4">
              EVERY CLAIM HAS A TRAIL.
            </h2>
          </Reveal>
          <Reveal variant="fade-up" delay={0.1}>
            <p className="text-[var(--rl-muted)] text-lg leading-relaxed max-w-xl">
              Each finding in a ZYROO report is backed by numbered citations.
              Click any claim to see exactly where it came from.
            </p>
          </Reveal>
        </div>

        <StaggerContainer className="space-y-6" stagger={0.1}>
          {CLAIMS.map((item, idx) => (
            <StaggerItem key={idx} variant="fade-up">
              <div className="border border-[var(--rl-border)] rounded-lg p-6 bg-[var(--rl-surface)] rl-card-hover">
                <p className="text-[var(--rl-ink)] text-base font-medium leading-relaxed mb-4">
                  <span className="text-[var(--rl-accent)] font-semibold mr-2">[{idx + 1}]</span>
                  {item.claim}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.sources.map((src) => (
                    <span key={src.id} className="rl-chip">
                      {src.name}
                    </span>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
