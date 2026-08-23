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
  {
    claim: 'First-generation students report 40% lower confidence in AI tool usage.',
    sources: [
      { id: 5, name: 'Garcia & Lee (2024)', type: 'arXiv' },
    ],
  },
];

export function EvidenceSection() {
  return (
    <section id="evidence" className="rl-section-full" style={{ backgroundColor: 'var(--rl-bg)' }}>
      <div className="rl-section">
        <Reveal variant="fade-up">
          <p className="rl-eyebrow mb-3">Evidence</p>
        </Reveal>
        <Reveal variant="fade-up" delay={0.05}>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)] mb-8">
            EVERY CLAIM<br />HAS A TRAIL.
          </h2>
        </Reveal>

        <StaggerContainer className="space-y-3" stagger={0.06}>
          {CLAIMS.map((item, idx) => (
            <StaggerItem key={idx} variant="fade-up">
              <div className="border border-[var(--rl-border)] rounded-lg bg-[var(--rl-surface)] overflow-hidden rl-card-hover">
                <div className="flex items-start gap-3 p-4">
                  <span className="rl-display text-lg text-[var(--rl-accent)] shrink-0 mt-0.5">[{idx + 1}]</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--rl-ink)] leading-snug mb-2">{item.claim}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.sources.map((src) => (
                        <span key={src.id} className="rl-chip">{src.name}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
