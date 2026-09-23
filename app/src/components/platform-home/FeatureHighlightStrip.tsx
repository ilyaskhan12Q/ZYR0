import { ArrowDown } from 'lucide-react';
import Timeline from '@/components/ui/timeline';

export default function FeatureHighlightStrip() {
  return (
    <>
      {/* Lead-in — pinned timeline scrolls in from here */}
      <section className="pt-20 md:pt-28 pb-6 md:pb-8 relative overflow-hidden">
        <div className="max-w-[1264px] mx-auto px-6 md:px-16">
          <div className="max-w-2xl">
            <p
              className="font-label text-[11px] tracking-[0.25em] uppercase mb-3"
              style={{ color: 'var(--zyro-accent)' }}
            >
              Why ZYR0
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold tracking-tight mb-4"
              style={{ color: 'var(--zyro-text)' }}
            >
              Architected differently.
            </h2>
            <p
              className="text-base sm:text-lg leading-relaxed mb-6"
              style={{ color: 'var(--zyro-text-secondary)' }}
            >
              Linear-grade precision engineered into an expansive multi-product suite.
              No bloated legacy software, no disconnected point solutions.
            </p>
            <p
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest"
              style={{ color: 'var(--zyro-text-muted)' }}
            >
              <ArrowDown className="w-3.5 h-3.5" />
              Keep scrolling — six years, one horizontal pass
            </p>
          </div>
        </div>
      </section>

      <Timeline
        title="Architected differently."
        periodLabel="2020 — 2026"
        backgroundColor="var(--zyro-bg)"
        textColor="var(--zyro-text)"
        mutedTextColor="var(--zyro-text-secondary)"
        activeColor="#7B7BDC"
        imageUrl="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
        imageAlt="Team collaborating around a table in a bright studio"
        duration={1.4}
      />
    </>
  );
}
