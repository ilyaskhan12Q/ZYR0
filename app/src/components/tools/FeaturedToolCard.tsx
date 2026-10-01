import React from 'react';
import { Sparkles, ArrowRight, ExternalLink, Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ToolItem } from '@/data/tools';

interface FeaturedToolCardProps {
  tool: ToolItem;
  onPreview: (tool: ToolItem) => void;
}

export function FeaturedToolCard({ tool, onPreview }: FeaturedToolCardProps) {
  return (
    <div className="relative group overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card to-card/60 p-6 md:p-8 hover:border-accent/50 transition-all duration-300 shadow-sm flex flex-col justify-between">
      {/* Background Accent Mesh */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 group-hover:bg-accent/10 transition-colors" />

      <div className="space-y-4 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent font-medium text-xs py-0.5">
              <Sparkles className="w-3 h-3 mr-1" />
              ZYR0 Flagship
            </Badge>
            {tool.version && (
              <span className="text-xs font-mono text-muted-foreground">{tool.version}</span>
            )}
          </div>

          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            {tool.category}
          </span>
        </div>

        <div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
            {tool.name}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
            {tool.description}
          </p>
        </div>

        {/* Highlighted capabilities list */}
        {tool.capabilities && (
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {tool.capabilities.slice(0, 4).map((cap, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-foreground/80 py-1"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <span className="truncate">{cap}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex flex-wrap gap-1.5">
          {tool.tags.map((t) => (
            <span
              key={t}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/50"
            >
              #{t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onPreview(tool)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors flex-1 sm:flex-none"
          >
            <span>Learn More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <a
            href={tool.sourceUrl}
            target={tool.sourceUrl.startsWith('http') ? '_blank' : undefined}
            rel={tool.sourceUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-accent text-white hover:bg-accent/90 transition-colors flex-1 sm:flex-none"
          >
            <span>Launch Tool</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
