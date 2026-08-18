import { useMemo, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { BadgeCheck, BookOpen, ExternalLink, FileText, Link2, ListChecks, User } from 'lucide-react';
import { renderReportMarkdown } from '@/agent/render/renderReportMarkdown';
import { SourceModal } from '@/agent/components/SourceModal';
import { generateReportPdf } from '@/agent/lib/reportPdf';
import type { CitationLedgerEntry, EvidenceItem, ResearchReport } from '@/agent/research/types';

interface ReportViewProps {
  report: ResearchReport;
  errors?: string[];
  onFollowUp: (report: ResearchReport) => void;
  onNewResearch: (topic: string) => void;
  onRegenerate: (topic: string) => void;
}

interface Section {
  heading: string;
  lines: string[];
}

const META_SECTIONS = new Set(['Executive Summary', 'Key Findings', 'Conclusion', 'Sources']);

function extractSections(markdown: string): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const line of markdown.split('\n')) {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      current = { heading: match[1].trim(), lines: [] };
      sections.push(current);
    } else if (current) {
      current.lines.push(line);
    }
  }
  return sections;
}

type TabId = 'overview' | 'findings' | 'evidence' | 'sources';

const TABS: { id: TabId; label: string; icon: typeof BookOpen }[] = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'findings', label: 'Findings', icon: FileText },
  { id: 'evidence', label: 'Evidence', icon: ListChecks },
  { id: 'sources', label: 'Sources', icon: Link2 },
];

export function ReportView({ report, errors = [], onFollowUp, onNewResearch, onRegenerate }: ReportViewProps) {
  const [tab, setTab] = useState<TabId>('overview');
  const [modalEntry, setModalEntry] = useState<CitationLedgerEntry | null>(null);
  const [exporting, setExporting] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const elapsed = report.elapsedMs >= 60_000 ? `${(report.elapsedMs / 60_000).toFixed(1)} min` : `${report.elapsedMs}s`;
  const verifiedByKey = new Map(report.ledger.map((entry) => [entry.key, entry.verified]));
  const sorted = [...report.ledger].sort((a, b) => Number(b.verified) - Number(a.verified) || a.key - b.key);

  const sections = useMemo(() => extractSections(report.markdown), [report.markdown]);
  const byHeading = useMemo(() => new Map(sections.map((s) => [s.heading, s])), [sections]);

  const renderSection = (section: Section | undefined, options: { bordered?: boolean } = {}) => {
    if (!section || section.lines.length === 0) return null;
    const body = renderReportMarkdown(section.lines.join('\n'), {
      citationVerified: (key) => verifiedByKey.get(key) ?? true,
      onCitationClick: (key) => {
        const entry = report.ledger.find((e) => e.key === key);
        if (entry) setModalEntry(entry);
      },
    });
    if (!options.bordered) return body;
    return <div className="border-l-2 border-primary bg-background py-2 pl-6">{body}</div>;
  };

  const keyFindingsRows = (() => {
    const section = byHeading.get('Key Findings');
    if (!section) return null;
    const paragraphs = section.lines
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('-'));
    const bullets = section.lines.map((l) => l.trim()).filter((l) => l.startsWith('-'));
    return (
      <div className="flex flex-col gap-8">
        {paragraphs.map((para, i) => (
          <div key={i} className="flex gap-4">
            <span className="agent-serif w-10 shrink-0 text-2xl font-semibold text-primary/50">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0 text-sm leading-relaxed text-foreground">
              {renderReportMarkdown(para, {
                citationVerified: (key) => verifiedByKey.get(key) ?? true,
                onCitationClick: (key) => {
                  const entry = report.ledger.find((e) => e.key === key);
                  if (entry) setModalEntry(entry);
                },
              })}
            </div>
          </div>
        ))}
        {bullets.length > 0 && (
          <div>
            {renderReportMarkdown(bullets.join('\n'), {
              citationVerified: (key) => verifiedByKey.get(key) ?? true,
              onCitationClick: (key) => {
                const entry = report.ledger.find((e) => e.key === key);
                if (entry) setModalEntry(entry);
              },
            })}
          </div>
        )}
      </div>
    );
  })();

  const evidenceFor = (item: EvidenceItem): CitationLedgerEntry | undefined =>
    report.ledger.find((e) => e.url === item.url);

  const hasExecutiveSummary = byHeading.has('Executive Summary');
  const dimensionSections = sections.filter(
    (s) => !META_SECTIONS.has(s.heading) && s.heading !== 'Executive Summary',
  );
  const overviewLead = hasExecutiveSummary ? byHeading.get('Executive Summary') : dimensionSections[0];
  const overviewSections = sections.filter((s) => !META_SECTIONS.has(s.heading) && s !== overviewLead);

  const dateLabel = new Date(report.created_at ?? Date.now())
    .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    .toUpperCase();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Workspace top bar */}
      <div className="shrink-0 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-6 px-6">
          <span className="agent-serif hidden text-lg font-semibold tracking-tight sm:block">ZYROO</span>
          <nav className="hidden h-full items-center gap-8 md:flex">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex h-full items-center border-b-2 text-sm transition ${
                  tab === t.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-[2px]"
              disabled={exporting}
              onClick={() => {
                setExporting(true);
                window.setTimeout(() => {
                  generateReportPdf(report);
                  setExporting(false);
                }, 0);
              }}
            >
              {exporting ? 'Exporting…' : 'Export PDF'}
            </Button>
            <Button variant="outline" size="sm" className="hidden rounded-[2px] sm:inline-flex" onClick={() => onFollowUp(report)}>
              Ask follow-up
            </Button>
            <Button variant="outline" size="sm" className="hidden rounded-[2px] sm:inline-flex" onClick={() => onNewResearch(report.topic)}>
              New research
            </Button>
            <Button variant="ghost" size="sm" className="hidden rounded-[2px] sm:inline-flex" onClick={() => onRegenerate(report.topic)}>
              Regenerate
            </Button>
          </div>
        </div>
      </div>

      {/* Article */}
      <ScrollArea className="min-h-0 flex-1">
        <article className="mx-auto max-w-3xl px-6 pb-24 pt-10">
          {errors.length > 0 && (
            <div className="mb-8 rounded-[2px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <button
                type="button"
                onClick={() => setNotesOpen((prev) => !prev)}
                className="flex w-full items-center justify-between font-medium"
              >
                <span>
                  {errors.length} pipeline note{errors.length > 1 ? 's' : ''} — sources / workers
                </span>
                <span>{notesOpen ? '▲' : '▼'}</span>
              </button>
              {notesOpen && (
                <div className="mt-2 flex flex-col gap-1">
                  {errors.map((err, i) => (
                    <p key={i} className="text-[11px] opacity-80">
                      {err}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary-foreground">
            Final report · {dateLabel}
          </p>
          <h1 className="agent-serif mt-4 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            {report.topic}
          </h1>
          <div className="mt-8 flex items-center gap-3 border-t border-border pt-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#4f46e5] text-white">
              <User className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{report.model || 'Research Agent'}</p>
              <p className="text-xs text-secondary-foreground">
                {elapsed} · {report.ledger.length} verified source{report.ledger.length === 1 ? '' : 's'} ·{' '}
                {report.evidence.length} evidence item{report.evidence.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          {tab === 'overview' && (
            <div className="mt-12 space-y-14 text-[15px] leading-relaxed text-foreground">
              <section>
                <h2 className="agent-serif mb-4 text-2xl font-semibold text-foreground">
                  {hasExecutiveSummary ? 'Executive Summary' : 'Overview'}
                </h2>
                {renderSection(overviewLead, { bordered: true })}
              </section>
              {hasExecutiveSummary && keyFindingsRows && (
                <section>
                  <h2 className="agent-serif mb-6 border-b border-border pb-4 text-2xl font-semibold text-foreground">
                    Key Findings
                  </h2>
                  {keyFindingsRows}
                </section>
              )}
              {hasExecutiveSummary && (
                <section>
                  <h2 className="agent-serif mb-4 text-2xl font-semibold text-foreground">Conclusion</h2>
                  {renderSection(byHeading.get('Conclusion'))}
                </section>
              )}
              {overviewSections.map((section) => (
                <section key={section.heading}>
                  <h2 className="agent-serif mb-4 text-2xl font-semibold text-foreground">{section.heading}</h2>
                  {renderSection(section)}
                </section>
              ))}
            </div>
          )}

          {tab === 'findings' && (
            <div className="mt-12 space-y-14 text-[15px] leading-relaxed text-foreground">
              {dimensionSections.length === 0 ? (
                <p className="text-sm text-muted-foreground">No dimension sections were found in this report.</p>
              ) : (
                dimensionSections.map((section, i) => (
                  <section key={section.heading}>
                    <div className="mb-4 flex items-baseline gap-4 border-b border-border pb-4">
                      <span className="agent-serif text-2xl font-semibold text-primary/50">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h2 className="agent-serif text-2xl font-semibold text-foreground">{section.heading}</h2>
                    </div>
                    {renderSection(section)}
                  </section>
                ))
              )}
            </div>
          )}

          {tab === 'evidence' && (
            <div className="mt-12">
              {report.evidence.length === 0 ? (
                <div className="rounded-[2px] border border-border bg-card p-6 text-sm text-muted-foreground">
                  Evidence items are not stored for reports loaded from history. Browse the{' '}
                  <button type="button" className="text-primary hover:underline" onClick={() => setTab('sources')}>
                    Sources
                  </button>{' '}
                  tab instead.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {report.evidence.map((item) => {
                    const entry = evidenceFor(item);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => entry && setModalEntry(entry)}
                        className="rounded-[2px] border border-border bg-card p-4 text-left transition hover:border-primary"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                            {item.sourceName}
                            {item.year ? ` · ${item.year}` : ''}
                          </span>
                          {entry?.verified && (
                            <BadgeCheck className="size-4 shrink-0 text-[#166534]" />
                          )}
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-foreground">
                          {item.title}
                        </p>
                        {item.snippet && (
                          <p className="mt-2 line-clamp-3 border-l-2 border-primary/30 pl-3 text-xs italic leading-relaxed text-muted-foreground">
                            “{item.snippet}
                            {item.snippet.length >= 400 ? '…' : ''}”
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'sources' && (
            <div className="mt-12 flex flex-col gap-3">
              {sorted.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sources in the citation ledger.</p>
              ) : (
                sorted.map((entry) => (
                  <SourceCard
                    key={entry.key}
                    entry={entry}
                    onDetails={() => setModalEntry(entry)}
                  />
                ))
              )}
            </div>
          )}
        </article>
      </ScrollArea>

      {/* Mobile bottom navigation */}
      <div className="grid shrink-0 grid-cols-4 border-t border-border bg-background md:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex flex-col items-center gap-1 py-3 text-[11px] transition ${
              tab === t.id ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <t.icon className="size-4" />
            {t.label}
          </button>
        ))}
      </div>

      <SourceModal entry={modalEntry} onOpenChange={(open) => !open && setModalEntry(null)} />
    </div>
  );
}

function SourceCard({
  entry,
  onDetails,
}: {
  entry: CitationLedgerEntry;
  onDetails: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onDetails}
      className="group flex items-start gap-3 rounded-[2px] border border-border bg-card p-4 text-left transition hover:border-primary"
    >
      <span className="agent-serif mt-0.5 shrink-0 text-lg font-semibold text-primary/60">
        [{entry.key}]
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-foreground group-hover:text-primary">
          {entry.title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {entry.sourceName}
          {entry.year ? ` · ${entry.year}` : ''}
          {entry.authors?.length
            ? ` · ${entry.authors.slice(0, 3).join(', ')}${entry.authors.length > 3 ? ' et al.' : ''}`
            : ''}
        </p>
        {entry.doi && <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{entry.doi}</p>}
      </div>
      <span
        className={`mt-0.5 shrink-0 rounded px-2 py-0.5 text-[11px] font-medium ${
          entry.verified
            ? 'bg-[#dcfce7] text-[#166534]'
            : 'bg-amber-100 text-[#92400e]'
        }`}
      >
        {entry.verified ? '✓ verified' : '⚠ unverified'}
      </span>
      <ExternalLink className="mt-1 size-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
    </button>
  );
}