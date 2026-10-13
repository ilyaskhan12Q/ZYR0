import React, { useState } from 'react';
import { ExternalLink, Terminal, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type ToolItem, coverGradient } from '@/data/tools';

interface ToolCardProps {
  tool: ToolItem;
  onPreview: (tool: ToolItem) => void;
}

export function ToolCard({ tool, onPreview }: ToolCardProps) {
  const navigate = useNavigate();
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(tool.imageUrl) && !imgFailed;

  const initials = tool.name
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Source badge styling (white-glass, sits on the hero)
  const renderSourceBadge = () => {
    switch (tool.source) {
      case 'ZYR0 Native':
        return (
          <Badge variant="outline" className="border-white/30 bg-white/15 text-white backdrop-blur-sm font-medium text-[10px] h-5">
            ZYR0 Native
          </Badge>
        );
      case 'GitHub':
        return (
          <Badge variant="outline" className="border-white/30 bg-white/15 text-white backdrop-blur-sm font-mono text-[10px] h-5">
            GitHub
          </Badge>
        );
      case 'Hugging Face':
        return (
          <Badge variant="outline" className="border-amber-300/40 bg-amber-500/25 text-amber-100 backdrop-blur-sm font-medium text-[10px] h-5">
            Hugging Face
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-white/30 bg-white/15 text-white backdrop-blur-sm text-[10px] h-5">
            {tool.source}
          </Badge>
        );
    }
  };

  return (
    <Card className="group flex flex-col justify-between rounded-xl border border-border/70 bg-card hover:border-[var(--zyro-accent)]/45 hover:shadow-lg hover:shadow-[var(--zyro-accent-muted)] transition-all duration-200 overflow-hidden py-0 gap-0">
      <div>
        {/* ============ HERO MEDIA BAND (same language as ToolPreviewDialog) ============ */}
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-[var(--zyro-twilight)] border-b border-border/40">
          {showImage ? (
            <>
              <img
                src={tool.imageUrl}
                alt={tool.name}
                onError={() => setImgFailed(true)}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" aria-hidden="true" />
            </>
          ) : (
            <>
              {/* Branded (or admin-custom) gradient + dot texture */}
              <div className="absolute inset-0" style={{ background: coverGradient(tool.coverColor) }} aria-hidden="true" />
              <div
                className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:18px_18px]"
                aria-hidden="true"
              />
              <div className="absolute top-3 right-4 w-20 h-20 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-5xl font-serif text-white/15 select-none">{initials}</span>
              </div>
            </>
          )}

          {/* Badges row */}
          <div className="absolute top-3 left-3.5 flex flex-wrap items-center gap-1.5">
            {renderSourceBadge()}
            {tool.item_type && (
              <Badge
                variant="outline"
                className={`text-[10px] h-5 font-mono capitalize border-white/30 bg-white/15 text-white backdrop-blur-sm ${
                  tool.item_type === 'skill'
                    ? '!border-purple-300/40 !bg-purple-500/30 !text-purple-100'
                    : tool.item_type === 'tool_skill'
                    ? '!border-emerald-300/40 !bg-emerald-500/30 !text-emerald-100'
                    : ''
                }`}
              >
                {tool.item_type === 'tool_skill' ? 'Tool + Skill' : tool.item_type}
              </Badge>
            )}
            {tool.badge && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--zyro-accent)] text-white shadow-sm">
                {tool.badge}
              </span>
            )}
            {tool.featured && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-white bg-white/15 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-white/25">
                <Sparkles className="w-2.5 h-2.5" />
                Featured
              </span>
            )}
            {tool.installCommand && (
              <span
                className="text-white/70"
                title="Install command available"
              >
                <Terminal className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* Name + tagline overlaid at band bottom */}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h3 className={`text-lg font-bold tracking-tight leading-tight line-clamp-1 ${showImage ? 'text-white drop-shadow-md' : 'text-white'}`}>
              {tool.name}
            </h3>
            <p className={`text-xs mt-0.5 line-clamp-2 leading-relaxed ${showImage ? 'text-white/85' : 'text-white/75'}`}>
              {tool.tagline}
            </p>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex flex-wrap gap-1">
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
          onClick={() => navigate(`/tools/${tool.slug}`)}
          className="text-xs font-medium text-foreground hover:text-[var(--zyro-accent)] transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded py-1 px-1 -mx-1"
        >
          <span>Inspect</span>
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
