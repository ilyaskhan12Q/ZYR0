import React from 'react';
import { ExternalLink, Terminal, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ToolItem } from '@/data/tools';

interface ToolCardProps {
  tool: ToolItem;
  onPreview: (tool: ToolItem) => void;
}

export function ToolCard({ tool, onPreview }: ToolCardProps) {
  // Source badge styling
  const renderSourceBadge = () => {
    switch (tool.source) {
      case 'ZYR0 Native':
        return (
          <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent font-medium text-[11px] h-5">
            ZYR0 Native
          </Badge>
        );
      case 'GitHub':
        return (
          <Badge variant="secondary" className="font-mono text-[11px] h-5 bg-muted text-muted-foreground">
            GitHub
          </Badge>
        );
      case 'Hugging Face':
        return (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium text-[11px] h-5">
            Hugging Face
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[11px] h-5">
            {tool.source}
          </Badge>
        );
    }
  };

  // Strong typographic visual for media container (16:9 ratio)
  const renderMediaContainer = () => {
    if (tool.imageUrl) {
      return (
        <div className="w-full aspect-[16/9] overflow-hidden rounded-t-xl bg-muted/40 relative group-hover:opacity-95 transition-opacity">
          <img
            src={tool.imageUrl}
            alt={tool.name}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        </div>
      );
    }

    // High-taste typographic shield fallback
    const initials = tool.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');

    return (
      <div className="w-full aspect-[16/9] overflow-hidden rounded-t-xl bg-gradient-to-br from-card via-muted/30 to-muted/80 border-b border-border/40 p-4 flex flex-col justify-between relative group-hover:border-accent/30 transition-colors">
        <div className="flex items-center justify-between z-10">
          <div className="w-8 h-8 rounded-lg bg-card border border-border/60 shadow-sm flex items-center justify-center font-mono font-bold text-xs text-foreground/80">
            {initials}
          </div>
          {tool.source === 'ZYR0 Native' && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-accent">
              <Sparkles className="w-3 h-3" />
              Flagship
            </span>
          )}
        </div>

        <div className="z-10">
          <span className="text-xl font-bold tracking-tight text-foreground font-sans block">
            {tool.name}
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5 block">
            {tool.category}
          </span>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute inset-0 bg-radial from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    );
  };

  return (
    <Card className="group flex flex-col justify-between rounded-xl border border-border/70 bg-card hover:border-accent/40 hover:shadow-lg transition-all duration-200 overflow-hidden py-0 gap-0">
      <div>
        {renderMediaContainer()}

        <CardHeader className="p-4 pb-2 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {renderSourceBadge()}
              {tool.item_type && (
                <Badge
                  variant="outline"
                  className={`text-[10px] h-5 font-mono capitalize ${
                    tool.item_type === 'skill'
                      ? 'border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      : tool.item_type === 'tool_skill'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-border/60 bg-muted/40 text-muted-foreground'
                  }`}
                >
                  {tool.item_type === 'tool_skill' ? 'Tool + Skill' : tool.item_type}
                </Badge>
              )}
              {tool.badge && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {tool.badge}
                </span>
              )}
            </div>
            {tool.installCommand && (
              <span
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Install command available"
              >
                <Terminal className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
              {tool.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {tool.tagline}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <div className="flex flex-wrap gap-1 mt-2">
            {tool.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40"
              >
                #{tag}
              </span>
            ))}
          </div>
        </CardContent>
      </div>

      <CardFooter className="p-4 pt-2 border-t border-border/40 bg-muted/20 flex items-center justify-between">
        <button
          onClick={() => onPreview(tool)}
          className="text-xs font-medium text-foreground hover:text-accent transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded py-1 px-1 -mx-1"
        >
          <span>View Details</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <a
          href={tool.sourceUrl}
          target={tool.sourceUrl.startsWith('http') ? '_blank' : undefined}
          rel={tool.sourceUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
          aria-label={`Open ${tool.name} source directly`}
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded hover:bg-muted"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </CardFooter>
    </Card>
  );
}
