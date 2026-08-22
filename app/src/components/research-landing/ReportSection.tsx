import { Reveal, StaggerContainer, StaggerItem } from './Reveal';
import { DEMO_REPORT } from '@/data/researchLandingDemo';

export function ReportSection() {
  return (
    <section className="rl-section" style={{ backgroundColor: 'var(--rl-surface)' }}>
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-12">
          <span className="rl-eyebrow mb-4 inline-block">Report</span>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)]">
            FROM RESEARCH TO UNDERSTANDING.
          </h2>
        </Reveal>

        {/* Report document mockup */}
        <Reveal variant="scale">
          <div className="rounded-2xl border border-[var(--rl-border)] bg-[var(--rl-bg)] overflow-hidden">
            {/* Report header */}
            <div className="p-6 md:p-8 border-b border-[var(--rl-border)]">
              <div className="flex items-center justify-between mb-4">
                <span className="rl-eyebrow">RESEARCH REPORT</span>
                <span className="text-xs text-[var(--rl-muted)]">{DEMO_REPORT.sourceCount} verified sources</span>
              </div>
              <h3 className="rl-display text-2xl md:text-3xl text-[var(--rl-ink)]">
                {DEMO_REPORT.title}
              </h3>
            </div>

            {/* Report body */}
            <div className="p-6 md:p-8">
              {/* Executive summary */}
              <StaggerContainer stagger={0.1}>
                <StaggerItem variant="fade-up">
                  <div className="mb-8">
                    <h4 className="rl-eyebrow text-[var(--rl-ink)] mb-3">EXECUTIVE SUMMARY</h4>
                    <p className="text-sm text-[var(--rl-muted)] leading-relaxed">
                      This report examines the impact of generative AI on university education across four research dimensions: foundational understanding, technical implementation, empirical benchmarks, and institutional constraints. Drawing on {DEMO_REPORT.sourceCount} verified sources, it synthesizes current evidence into actionable insights for educators, administrators, and policymakers.
                    </p>
                  </div>
                </StaggerItem>

                {/* Key findings */}
                <StaggerItem variant="fade-up">
                  <div className="mb-8">
                    <h4 className="rl-eyebrow text-[var(--rl-ink)] mb-4">KEY FINDINGS</h4>
                    <div className="flex flex-col gap-4">
                      {DEMO_REPORT.findings.map((finding) => (
                        <div key={finding.id} className="flex gap-4 group">
                          <span className="rl-display text-2xl text-[var(--rl-accent)] shrink-0 group-hover:scale-110 transition-transform duration-300">
                            {finding.id}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-[var(--rl-ink)] mb-1">{finding.title}</p>
                            <p className="text-xs text-[var(--rl-muted)] leading-relaxed">{finding.summary}</p>
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
                      {DEMO_REPORT.sources.map((src) => (
                        <p key={src.key} className="text-xs text-[var(--rl-muted)]">
                          <span className="font-semibold text-[var(--rl-ink)]">{src.key}</span> {src.title}
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
