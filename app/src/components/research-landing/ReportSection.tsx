import { Reveal, StaggerContainer, StaggerItem } from './Reveal';

const FINDINGS = [
  { id: '01', title: 'Faculty adoption remains uneven', summary: 'While 67% of institutions have AI policies, only 23% provide structured training.' },
  { id: '02', title: 'Assessment methods are shifting', summary: 'Process-based assessment replacing traditional assignments in 41% of departments.' },
  { id: '03', title: 'Student AI literacy varies', summary: 'First-generation students report 40% lower confidence in AI tool usage.' },
];

const SOURCES = [
  '[1] Chen & Martinez (2024) — OpenAlex',
  '[2] Williams & Patel (2024) — arXiv',
  '[3] Kim & Thompson (2023) — Semantic Scholar',
];

export function ReportSection() {
  return (
    <section id="report" className="rl-dark-section rl-section-full">
      <div className="rl-section">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left: copy (2 cols) */}
          <Reveal variant="fade-left" className="lg:col-span-2">
            <p className="rl-eyebrow-light text-[#657C68] mb-3">Report</p>
            <h2 className="rl-display rl-heading-text text-white mb-3">
              FROM RESEARCH<br />TO UNDERSTANDING.
            </h2>
            <p className="text-[#999] text-sm leading-relaxed mb-6">
              Every report includes executive summary, key findings, and a numbered citation ledger.
              Ready for academic or professional use.
            </p>
            <a href="/research-agent" className="rl-btn-primary-dark text-sm">
              See a live report <span aria-hidden="true">&rarr;</span>
            </a>
          </Reveal>

          {/* Right: report mockup (3 cols) */}
          <Reveal variant="fade-right" delay={0.1} className="lg:col-span-3">
            <div className="rounded-xl border border-[#333] bg-[#1a1a1a] overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-[#333] flex items-center justify-between">
                <div>
                  <p className="rl-eyebrow-light text-[#657C68] mb-1">RESEARCH REPORT</p>
                  <p className="text-white text-sm font-medium">Generative AI &amp; University Education</p>
                </div>
                <span className="rl-chip-dark">18 sources</span>
              </div>

              {/* Body */}
              <div className="p-5">
                <StaggerContainer stagger={0.06}>
                  <StaggerItem variant="fade-up">
                    <div className="mb-5">
                      <p className="rl-eyebrow-light text-[#666] mb-2">EXECUTIVE SUMMARY</p>
                      <p className="text-xs text-[#999] leading-relaxed">
                        This report examines the impact of generative AI on university education
                        across four research dimensions. Drawing on 18 verified sources.
                      </p>
                    </div>
                  </StaggerItem>

                  <StaggerItem variant="fade-up">
                    <div className="mb-5">
                      <p className="rl-eyebrow-light text-[#666] mb-3">KEY FINDINGS</p>
                      <div className="space-y-3">
                        {FINDINGS.map((f) => (
                          <div key={f.id} className="flex gap-3">
                            <span className="rl-display text-base text-[#657C68] shrink-0">{f.id}</span>
                            <div>
                              <p className="text-xs font-medium text-white mb-0.5">{f.title}</p>
                              <p className="text-[11px] text-[#777] leading-relaxed">{f.summary}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </StaggerItem>

                  <StaggerItem variant="fade-up">
                    <div className="pt-4 border-t border-[#333]">
                      <p className="rl-eyebrow-light text-[#666] mb-2">SOURCES</p>
                      <div className="space-y-1">
                        {SOURCES.map((s, i) => (
                          <p key={i} className="text-[11px] text-[#777]">{s}</p>
                        ))}
                      </div>
                    </div>
                  </StaggerItem>
                </StaggerContainer>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
