import React, { useState, useEffect } from 'react';
import { List, ChevronDown } from 'lucide-react';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface BlogTableOfContentsProps {
  items: TocItem[];
  variant?: 'desktop' | 'mobile';
}

export function extractTocFromMarkdown(content: string): TocItem[] {
  const lines = content.split('\n');
  const items: TocItem[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{2,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const rawText = headingMatch[2].trim();
      // Remove markdown bold/italic/links formatting from heading text
      const cleanText = rawText
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_`]/g, '')
        .trim();

      const id = cleanText
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-');

      if (cleanText && id) {
        items.push({ id, text: cleanText, level });
      }
    }
  }

  return items;
}

export function BlogTableOfContents({ items, variant = 'desktop' }: BlogTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.1,
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(id);
      setMobileOpen(false);
    }
  };

  // Mobile Collapsible Accordion Box
  if (variant === 'mobile') {
    return (
      <div className="xl:hidden my-8 rounded-xl border border-border/80 bg-muted/20 overflow-hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full flex items-center justify-between p-4 text-left font-serif font-semibold text-sm text-foreground hover:bg-muted/40 transition-colors"
          aria-expanded={mobileOpen}
        >
          <span className="flex items-center gap-2">
            <List className="w-4 h-4 text-primary" />
            <span>Table of Contents ({items.length} sections)</span>
          </span>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              mobileOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {mobileOpen && (
          <nav className="p-4 pt-0 border-t border-border/40 space-y-1 text-xs">
            {items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToHeading(item.id)}
                  className={`block w-full text-left py-1.5 transition-colors cursor-pointer ${
                    item.level === 3 ? 'pl-4' : 'pl-1'
                  } ${
                    isActive
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.text}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    );
  }

  // Desktop Floating Sticky Sidebar
  return (
    <nav
      aria-label="Table of contents"
      className="hidden xl:block sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 space-y-3 text-xs"
    >
      <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-[11px] text-muted-foreground pb-2 border-b border-border/50">
        <List className="w-3.5 h-3.5 text-primary" />
        <span>Contents</span>
      </div>

      <div className="space-y-1.5">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollToHeading(item.id)}
              className={`block w-full text-left py-1 leading-snug transition-all cursor-pointer ${
                item.level === 3 ? 'pl-3 text-[11px]' : 'pl-0 text-xs'
              } ${
                isActive
                  ? 'text-primary font-medium border-l-2 border-primary pl-2'
                  : 'text-muted-foreground hover:text-foreground hover:pl-1'
              }`}
            >
              {item.text}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
