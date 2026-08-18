import type { ReactNode } from 'react';

// Dependency-free, XSS-safe report renderer: React escapes all text by
// construction (no dangerouslySetInnerHTML). Supports ## / ### headings,
// **bold**, "- " bullet lists, and clickable [n] citation anchors.

interface RenderOptions {
  citationVerified?: (key: number) => boolean;
  onCitationClick?: (key: number) => void;
}

const INLINE_RE = /(\[(\d{1,3})\])|(\*\*([^*]+)\*\*)/g;

function inline(text: string, options: RenderOptions): ReactNode[] {
  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={key++}>{text.slice(last, match.index)}</span>);

    if (match[2]) {
      const citationKey = Number(match[2]);
      const verified = options.citationVerified?.(citationKey) ?? true;
      parts.push(
        <button
          key={key++}
          type="button"
          onClick={() => options.onCitationClick?.(citationKey)}
          title={verified ? `Source [${citationKey}] — verified` : `Source [${citationKey}] — link not confirmed`}
          className={`align-super text-[11px] font-semibold underline decoration-dotted underline-offset-2 transition hover:opacity-70 ${
            verified ? 'text-primary' : 'text-amber-600'
          }`}
        >
          [{citationKey}]
        </button>,
      );
    } else if (match[3] !== undefined && match[4] !== undefined) {
      parts.push(
        <strong key={key++} className="font-semibold">
          {match[4]}
        </strong>,
      );
    }
    last = INLINE_RE.lastIndex;
  }

  if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>);
  return parts;
}

export function renderReportMarkdown(markdown: string, options: RenderOptions = {}): ReactNode {
  const lines = markdown.split('\n');
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const flushList = () => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={key++} className="my-1.5 list-disc space-y-1 pl-5">
        {list.map((item, i) => (
          <li key={i}>{inline(item, options)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const line of lines) {
    const trimmed = line.trimEnd();
    if (/^###\s/.test(trimmed)) {
      flushList();
      blocks.push(
        <h3 key={key++} className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {trimmed.replace(/^###\s/, '')}
        </h3>,
      );
    } else if (/^##\s/.test(trimmed)) {
      flushList();
      blocks.push(
        <h2 key={key++} className="agent-serif mt-5 text-lg font-semibold">
          {trimmed.replace(/^##\s/, '')}
        </h2>,
      );
    } else if (/^-\s/.test(trimmed)) {
      list.push(trimmed.replace(/^-\s/, ''));
    } else if (trimmed === '') {
      flushList();
    } else {
      flushList();
      blocks.push(
        <p key={key++} className="my-2 leading-relaxed">
          {inline(trimmed, options)}
        </p>,
      );
    }
  }
  flushList();

  return <div className="space-y-1">{blocks}</div>;
}