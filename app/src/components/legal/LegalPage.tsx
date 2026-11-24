import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Printer } from 'lucide-react';
import { SEO } from '@/components/SEO';

export type LegalBlock =
  | { kind: 'p'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'ordered'; items: string[] }
  | { kind: 'subheading'; text: string }
  | { kind: 'callout'; title?: string; text: string }
  | { kind: 'table'; headers: string[]; rows: string[][] };

export interface LegalSection {
  id: string;
  title: string;
  blocks: LegalBlock[];
}

interface LegalPageProps {
  title: string;
  summary: string;
  path: string;
  metaTitle?: string;
  metaDescription: string;
  keywords?: string;
  updated: string;
  sections: LegalSection[];
  related?: { label: string; to: string }[];
}

const DEFAULT_RELATED = [
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Cookie Policy', to: '/cookies' },
  { label: 'Contact', to: '/contact' },
];

function Block({ block }: { block: LegalBlock }) {
  switch (block.kind) {
    case 'p':
      return <p className="text-[15px] leading-7 text-foreground/80">{block.text}</p>;
    case 'subheading':
      return <h3 className="pt-1 font-heading text-base font-semibold text-foreground">{block.text}</h3>;
    case 'list':
      return (
        <ul className="list-disc space-y-2 pl-5 text-[15px] leading-7 text-foreground/80 marker:text-zyro-accent/70">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case 'ordered':
      return (
        <ol className="list-decimal space-y-2 pl-5 text-[15px] leading-7 text-foreground/80 marker:text-zyro-accent/70">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case 'callout':
      return (
        <aside className="rounded-r-lg border-l-2 border-zyro-accent bg-[var(--zyro-accent-muted)] px-4 py-3">
          {block.title && <p className="text-sm font-medium text-foreground">{block.title}</p>}
          <p className="text-sm leading-6 text-foreground/75">{block.text}</p>
        </aside>
      );
    case 'table':
      return (
        <div className="overflow-x-auto rounded-lg border border-border/70">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/70 bg-muted/40">
                {block.headers.map((header) => (
                  <th key={header} scope="col" className="px-4 py-2.5 font-medium text-foreground">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-b border-border/60 last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2.5 align-top text-foreground/75">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export function LegalPage({
  title,
  summary,
  path,
  metaTitle,
  metaDescription,
  keywords,
  updated,
  sections,
  related = DEFAULT_RELATED,
}: LegalPageProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');

  const readingTime = useMemo(() => {
    const words = sections
      .flatMap((section) =>
        section.blocks.flatMap((block) => {
          if (block.kind === 'table') return [...block.headers, ...block.rows.flat()];
          if (block.kind === 'list' || block.kind === 'ordered') return block.items;
          return [block.text];
        }),
      )
      .join(' ')
      .split(/\s+/)
      .filter(Boolean).length;
    return Math.max(1, Math.round(words / 220));
  }, [sections]);

  useEffect(() => {
    const headings = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-120px 0px -65% 0px' },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [sections]);

  const contents = (
    <ol className="space-y-1.5 text-sm">
      {sections.map((section) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            aria-current={activeId === section.id ? 'location' : undefined}
            className={`block border-l-2 py-1 pl-3 transition-colors ${
              activeId === section.id
                ? 'border-zyro-accent font-medium text-foreground'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
            }`}
          >
            {section.title}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="pb-24 print:pb-0">
      <SEO
        title={metaTitle ?? title}
        description={metaDescription}
        path={path}
        keywords={keywords}
      />

      {/* Slim header */}
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pb-10 lg:pt-14">
          <p className="font-label text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Legal</p>
          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">{summary}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span>Last updated {updated}</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-border" />
            <span>{readingTime} min read</span>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/70 transition-colors hover:text-foreground print:hidden"
            >
              <Printer className="h-3.5 w-3.5" />
              Print this page
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Mobile contents */}
        <details className="mt-8 rounded-xl border border-border/70 px-4 py-3 lg:hidden print:hidden">
          <summary className="cursor-pointer text-sm font-medium text-foreground">On this page</summary>
          <nav aria-label="On this page" className="mt-3">
            {contents}
          </nav>
        </details>

        <div className="mt-10 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14 lg:py-16">
          {/* Desktop contents */}
          <aside className="hidden lg:sticky lg:top-[calc(var(--zyro-header-h)+2rem)] lg:block lg:self-start print:hidden">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              On this page
            </p>
            <nav aria-label="On this page">{contents}</nav>
          </aside>

          <article className="max-w-[72ch] space-y-12">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-[calc(var(--zyro-header-h)+2rem)]"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-label text-[11px] tabular-nums text-zyro-accent">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    {section.title}
                  </h2>
                </div>
                <div className="mt-4 space-y-4">
                  {section.blocks.map((block, i) => (
                    <Block key={i} block={block} />
                  ))}
                </div>
              </section>
            ))}

            <footer className="border-t border-border/70 pt-8">
              <p className="text-sm text-muted-foreground">
                Questions about this policy? Write to us at{' '}
                <a href="mailto:privacy@zyroo.org" className="font-medium text-foreground underline-offset-4 hover:underline">
                  privacy@zyroo.org
                </a>
                .
              </p>
              <div className="mt-5 flex flex-wrap gap-2 print:hidden">
                {related.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground/75 transition-colors hover:border-zyro-accent/50 hover:text-foreground"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}
