import { Reveal, StaggerContainer, StaggerItem } from './Reveal';

const FINDINGS = [
  { id: '01', title: 'Faculty adoption remains uneven', summary: 'While 67% of institutions have AI policies, only 23% provide structured training for faculty integration.' },
  { id: '02', title: 'Assessment methods are shifting', summary: 'Process-based assessment and oral examinations are replacing traditional take-home assignments in 41% of surveyed departments.' },
  { id: '03', title: 'Student AI literacy varies significantly', summary: 'First-generation students report 40% lower confidence in AI tool usage compared to peers with prior technical exposure.' },
];

const SOURCES = [
  { key: '[1]', text: 'Chen & Martinez (2024) — OpenAlex' },
  { key: '[2]', text: 'Williams & Patel (2024) — arXiv' },
  { key: '[3]', text: 'Kim & Thompson (2023) — Semantic Scholar' },
];

export function ReportSection() {
  return (
    <section className="rl-section-full" style={{ backgroundColor: 'var(--rl-surface)' }}>
      <div className="rl-section">
        <div className="max-w-3xl mb-12">
          <Reveal variant="fade-up">
            <p className="rl-eyebrow mb-4">Report</p>
          </Reveal>
          <Reveal variant="fade-up" delay={0.05}>
            <h2 className="rl-display rl-heading-text text-[var(--rl-ink)] mb-4">
              FROM RESEARCH TO UNDERSTANDING.
            </h2>
          </Reveal>
        </div>

        <Reveal variant="fade-up" delay={0.1}>
          <div className="rounded-xl border border-[var(--rl-border)] bg-[var(--rl-bg)] overflow-hidden max-w-4xl">
            {/* Report header */}
            <div className="p-6 md:p-8 border-b border-[var(--rl-border)]">
              <div className="flex items-center justify-between mb-4">
                <span className="rl-eyebrow">RESEARCH REPORT</span>
                <span className="text-xs text-[var(--rl-muted)]">18 verified sources</span>
              </div>
              <h3 className="rl-display text-2xl md:text-3xl text-[var(--rl-ink)]">
                Generative AI &amp; University Education
              </h3>
            </div>

            {/* Report body */}
            <div className="p-6 md:p-8">
              <StaggerContainer stagger={0.08}>
                {/* Executive summary */}
                <StaggerItem variant="fade-up">
                  <div className="mb-8">
                    <h4 className="rl-eyebrow text-[var(--rl-ink)] mb-3">EXECUTIVE SUMMARY</h4>
                    <p className="text-sm text-[var(--rl-muted)] leading-relaxed">
                      This report examines the impact of generative AI on university education across four research dimensions:
                      foundational understanding, technical implementation, empirical benchmarks, and institutional constraints.
                      Drawing on 18 verified sources, it synthesizes current evidence into actionable insights for educators,
                      administrators, and policymakers.
                    </p>
                  </div>
                </StaggerItem>

                {/* Key findings */}
                <StaggerItem variant="fade-up">
                  <div className="mb-8">
                    <h4 className="rl-eyebrow text-[var(--rl-ink)] mb-4">KEY FINDINGS</h4>
                    <div className="flex flex-col gap-4">
                      {FINDINGS.map((f) => (
                        <div key={f.id} className="flex gap-4">
                          <span className="rl-display text-2xl text-[var(--rl-accent)] shrink-0">{f.id}</span>
                          <div>
                            <p className="text-sm font-medium text-[var(--rl-ink)] mb-1">{f.title}</p>
                            <p className="text-xs text-[var(--rl-muted)] leading-relaxed">{f.summary}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </StaggerItem>

                {/* Sources */}
                <StaggerItem variant="fade-up">
                  <div className="pt-6 border-t border-[var(--rl-border)]">
                    <h4 className="rl-eyebrow text-[var(--rl-ink)] mb-3">SOURCES</h4>
                    <div className="flex flex-col gap-2">
                      {SOURCES.map((src) => (
                        <p key={src.key} className="text-xs text-[var(--rl-muted)]">
                          <span className="font-semibold text-[var(--rl-ink)]">{src.key}</span> {src.text}
                        </p>
                      ))}
                    </div>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
