/* ============================================================
   0-AI Deep Research Workspace — mock data fixtures (Phase 1)
   Client-side only. No enums (erasableSyntaxOnly constraint).
   ============================================================ */

export type Depth = 'STANDARD' | 'EXHAUSTIVE';

export type SourceKind = 'academic' | 'industry';

export interface Source {
  id: number;
  kind: SourceKind;
  authors: string;
  title: string;
  venue: string;
  year: string;
  doi?: string;
}

export interface ReportParagraph {
  text: string;
  /** Source ids referenced by [N] citation pills */
  citations: number[];
}

export interface ReportSection {
  heading: string;
  paragraphs: ReportParagraph[];
}

export type TelemetryStepId = 'planner' | 'workers' | 'verifier' | 'synthesis';

export interface TelemetryStep {
  id: TelemetryStepId;
  label: string;
  detail: string;
  /** Seconds this step takes to complete */
  durationSec: number;
}

export interface TelemetryLog {
  step: TelemetryStepId;
  line: string;
  /** Seconds after start when the line appears */
  at: number;
}

export interface ResearchReport {
  id: string;
  prompt: string;
  depth: Depth;
  durationSec: number;
  generatedAt: string;
  title: string;
  abstract: string;
  sections: ReportSection[];
  sources: Source[];
}

export const TELEMETRY_STEPS: TelemetryStep[] = [
  { id: 'planner', label: 'Task Planner', detail: 'Decomposing query into sub-research tasks', durationSec: 2 },
  { id: 'workers', label: 'Worker Pool Concurrency', detail: '4 workers querying sources in parallel', durationSec: 3 },
  { id: 'verifier', label: 'Verifier / Deduplication', detail: 'Cross-checking claims and merging duplicates', durationSec: 2 },
  { id: 'synthesis', label: 'Synthesis', detail: 'Writing final report with citations', durationSec: 2 },
];

export const TELEMETRY_LOGS: TelemetryLog[] = [
  { step: 'planner', line: 'Parsed query intent: economics + AI + internship matching', at: 0.4 },
  { step: 'planner', line: 'Spawned 3 sub-tasks: labor data, AI matching literature, market evidence', at: 1.2 },
  { step: 'workers', line: 'Worker 1 → 38 candidate sources (DOI registry)', at: 2.4 },
  { step: 'workers', line: 'Worker 2 → 21 industry whitepapers', at: 2.9 },
  { step: 'workers', line: 'Worker 3 → 5 labor-market surveys', at: 3.4 },
  { step: 'verifier', line: 'Cross-validated 9 claims; 2 sources failed confidence gate', at: 5.2 },
  { step: 'verifier', line: 'Deduped 4 overlapping sources → 8 unique citations', at: 6 },
  { step: 'synthesis', line: 'Structuring report: abstract, 3 sections, sources', at: 7.2 },
];

export const REPORT_FIXTURE: ResearchReport = {
  id: 'ZYR0-AI-2026-0001',
  prompt: 'How does AI-powered internship matching affect hiring outcomes for first-job seekers in South Asia?',
  depth: 'STANDARD',
  durationSec: 9,
  generatedAt: '2026-08-16T10:00:00Z',
  title: 'AI-Mediated Internship Matching and Early-Career Labor Market Outcomes in South Asia',
  abstract:
    'Digital labor platforms increasingly deploy AI matching to allocate internship slots. This report synthesizes 8 sources to examine whether AI-mediated matching improves placement rates and wage outcomes for first-job seekers in South Asia, and what design factors — transparency, human-in-the-loop review, and verification of credentials — determine those outcomes.',
  sections: [
    {
      heading: '1. Context: the internship bottleneck',
      paragraphs: [
        {
          text: 'Southeast Asian and South Asian labor markets face a persistent internship bottleneck: employers report thousands of applicants per role while students struggle to convert academic credentials into first professional experience. Structured internship platforms emerged as an institutional response, formalizing application pipelines that informal networks previously dominated.',
          citations: [2, 3],
        },
        {
          text: 'Early evidence indicates that structured pipelines improve screening consistency, but only where evaluation criteria are published in advance and outcomes are tracked beyond the internship period.',
          citations: [3, 7],
        },
      ],
    },
    {
      heading: '2. What AI matching changes',
      paragraphs: [
        {
          text: 'AI-assisted matching shifts the cost of screening: systems rank applicants on skill-signal features (portfolio artifacts, verified code repositories, structured assessments) rather than resumes alone. Controlled studies report up to 31% higher placement rates for candidates who receive ranked, feedback-bearing match recommendations, with the largest gains among applicants lacking social capital.',
          citations: [1, 4, 5],
        },
        {
          text: 'However, gains are conditional on design. Blind deployments that treat matching as a black box produced gender-skewed shortlists in two field experiments, while deployments with mandatory human review and calibration audits eliminated most of the skew without sacrificing yield.',
          citations: [4, 6],
        },
      ],
    },
    {
      heading: '3. Verifiable credentials as the missing signal',
      paragraphs: [
        {
          text: 'A recurring failure mode in AI matching is signal fraud: unverifiable course certificates and self-reported skills dilute the very features the model ranks on. Platforms that issue cryptographically verifiable credentials — QR-validated certificates linked to graded work products — measurably reduced shortlist rejection rates in hiring simulations.',
          citations: [1, 8],
        },
        {
          text: 'The economic intuition is straightforward: verification lowers the employer\'s cost of trusting the signal, which raises the value of the match and the willingness to pay for placement. For first-job seekers the same mechanism shortens time-to-offer, the metric most correlated with long-run wage growth.',
          citations: [5, 8],
        },
      ],
    },
  ],
  sources: [
    { id: 1, kind: 'academic', authors: 'Rashid, A. & Khan, S.', title: 'Skill signal verification in automated hiring pipelines', venue: 'Journal of Labor Economics', year: '2024', doi: '10.1000/jle.2024.0181' },
    { id: 2, kind: 'industry', authors: 'South Asia Labor Observatory', title: 'State of early-career internships 2025', venue: 'Platform Research Series No. 12', year: '2025' },
    { id: 3, kind: 'academic', authors: 'Mannan, K.', title: 'Structured internship programs and screening consistency', venue: 'World Development', year: '2023', doi: '10.1016/j.worlddev.2023.106210' },
    { id: 4, kind: 'academic', authors: 'Chen, L., Okafor, P. & Varma, R.', title: 'Bias audits in AI shortlisting: two field experiments', venue: 'Proceedings of ACM FAccT', year: '2024', doi: '10.1145/3630106.3658942' },
    { id: 5, kind: 'industry', authors: 'Mercy Corps Digital', title: 'Matching technologies and youth employment in Pakistan', venue: 'Impact Evaluation Brief', year: '2024' },
    { id: 6, kind: 'academic', authors: 'Nguyen, T. & Alvi, F.', title: 'Human-in-the-loop matching and calibration audits', venue: 'AEA Papers & Proceedings', year: '2023' },
    { id: 7, kind: 'industry', authors: 'World Bank', title: 'Digital jobs and skills in South Asia', venue: 'Policy Research Working Paper 10812', year: '2024' },
    { id: 8, kind: 'academic', authors: 'de Vries, M. & Siddiqui, A.', title: 'Verifiable credentials and employer trust: a hiring simulation', venue: 'Information Economics and Policy', year: '2025', doi: '10.1016/j.infoecopol.2025.101081' },
  ],
};

/** Build a Markdown export of a report (used by the Copy Markdown action). */
export function reportToMarkdown(report: ResearchReport): string {
  const meta = [
    `# ${report.title}`,
    ``,
    `> **Prompt:** ${report.prompt}`,
    `> **Report ID:** ${report.id} · **Depth:** ${report.depth} · **Duration:** ${report.durationSec}s · **Sources:** ${report.sources.length}`,
    ``,
    `## Abstract`,
    ``,
    report.abstract,
    ``,
  ];
  for (const section of report.sections) {
    meta.push(`## ${section.heading}`, '');
    for (const para of section.paragraphs) {
      const refs = para.citations.map((n) => `[${n}]`).join('');
      meta.push(`${para.text}${refs}`, '');
    }
  }
  meta.push(`## Sources`, '');
  report.sources.forEach((s, i) => {
    meta.push(`${i + 1}. ${s.kind === 'academic' ? 'Academic' : 'Industry'} — ${s.authors}. *${s.title}*. ${s.venue} (${s.year})${s.doi ? `, DOI: ${s.doi}` : ''}`);
  });
  meta.push('', `_Generated by 0-AI Deep Research Workspace (Phase 1 mock)._`);
  return meta.join('\n');
}