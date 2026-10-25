import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ExternalLink, Terminal, Copy, Check, BookOpen, Tag,
  Layers, Info, FileText, ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ToolItem } from '@/data/tools';
import type { ToolInstallCommand } from '@/lib/database.types';
import { coverGradient } from '@/data/tools';
import { toast } from 'sonner';

interface ToolPreviewDialogProps {
  tool: ToolItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SectionTitle = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2.5">
    <Icon className="w-3.5 h-3.5 text-[var(--zyro-accent)]" />
    {children}
  </h4>
);

export function ToolPreviewDialog({ tool, open, onOpenChange }: ToolPreviewDialogProps) {
  const [copied, setCopied] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [activeCmdIdx, setActiveCmdIdx] = useState(0);

  const commands: ToolInstallCommand[] = tool
    ? (tool.installCommands && tool.installCommands.length > 0)
      ? tool.installCommands
      : tool.installCommand
      ? [{ label: tool.item_type === 'skill' ? 'Invocation' : 'Quick Install', command: tool.installCommand }]
      : []
    : [];

  const activeCommand = commands[activeCmdIdx] || commands[0];

  useEffect(() => {
    setActiveCmdIdx(0);
  }, [tool?.id]);

  if (!tool) return null;

  const handleCopyCommand = async () => {
    if (!activeCommand?.command) return;
    try {
      await navigator.clipboard.writeText(activeCommand.command);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy command');
    }
  };

  const getSourceBadge = () => {
    switch (tool.source) {
      case 'ZYR0 Native':
        return (
          <Badge variant="outline" className="border-white/30 bg-white/15 text-white backdrop-blur-sm font-medium text-[11px]">
            ZYR0 Native
          </Badge>
        );
      case 'GitHub':
        return (
          <Badge variant="outline" className="border-white/30 bg-white/15 text-white backdrop-blur-sm font-mono text-[11px]">
            GitHub
          </Badge>
        );
      case 'Hugging Face':
        return (
          <Badge variant="outline" className="border-amber-300/40 bg-amber-500/25 text-amber-100 backdrop-blur-sm font-medium text-[11px]">
            Hugging Face
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-white/30 bg-white/15 text-white backdrop-blur-sm text-[11px]">
            {tool.source}
          </Badge>
        );
    }
  };

  const showImage = Boolean(tool.imageUrl) && !imgFailed;
  const initials = tool.name
    .split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto p-0 bg-card border border-border shadow-2xl [&_[data-slot=dialog-close]]:text-white [&_[data-slot=dialog-close]]:drop-shadow-md [&_[data-slot=dialog-close]]:z-10">
        {/* ============ HERO / MEDIA BAND ============ */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-[var(--zyro-twilight)]">
          {showImage ? (
            <>
              <img
                src={tool.imageUrl}
                alt={`${tool.name} cover`}
                onError={() => setImgFailed(true)}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Bottom scrim for text legibility over photos */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" aria-hidden="true" />
            </>
          ) : (
            <>
              {/* Branded (or admin-custom) gradient + dot texture fallback */}
              <div className="absolute inset-0" style={{ background: coverGradient(tool.coverColor) }} aria-hidden="true" />
              <div
                className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle,var(--zyro-accent)_1px,transparent_1px)] [background-size:18px_18px]"
                aria-hidden="true"
              />
              <div className="absolute top-5 right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-7xl sm:text-8xl font-serif text-white/15 select-none">{initials}</span>
              </div>
            </>
          )}

          {/* Badges row */}
          <div className="absolute top-4 left-5 flex flex-wrap items-center gap-2">
            {getSourceBadge()}
            {tool.item_type && (
              <Badge
                variant="outline"
                className={`text-[11px] font-mono capitalize border-white/30 bg-white/15 text-white backdrop-blur-sm ${
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
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--zyro-accent)] text-white shadow-sm">
                {tool.badge}
              </span>
            )}
          </div>

          {/* Name + tagline overlaid at band bottom */}
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <DialogTitle className={`text-2xl sm:text-3xl font-serif tracking-tight leading-tight ${showImage ? 'text-white drop-shadow-md' : 'text-white'}`}>
              {tool.name}
            </DialogTitle>
            <DialogDescription className={`text-sm mt-1 max-w-2xl ${showImage ? 'text-white/85' : 'text-white/80'}`}>
              {tool.tagline}
            </DialogDescription>
          </div>
        </div>

        {/* ============ BODY ============ */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-7">
            {/* LEFT: narrative */}
            <div className="space-y-6 min-w-0">
              <section>
                <SectionTitle icon={FileText}>About</SectionTitle>
                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3 [&>h1]:text-base [&>h1]:font-bold [&>h1]:mb-2 [&>h2]:text-sm [&>h2]:font-bold [&>h2]:mb-2 [&>h3]:text-xs [&>h3]:font-bold [&>h3]:mb-1 [&>pre]:bg-neutral-950 [&>pre]:text-emerald-300 [&>pre]:p-3 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&_code]:font-mono [&_code]:text-xs [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-muted/60">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {tool.description}
                  </ReactMarkdown>
                </div>
              </section>

              {tool.capabilities && tool.capabilities.length > 0 && (
                <section>
                  <SectionTitle icon={Layers}>Key Capabilities</SectionTitle>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tool.capabilities.map((cap, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[var(--zyro-accent-muted)] border border-[var(--zyro-accent)]/15 text-xs text-foreground/85"
                      >
                        <span className="w-4 h-4 mt-0.5 rounded-full bg-[var(--zyro-accent)] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </span>
                        <span className="leading-snug">{cap}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Install command(s) — full width in content column so long commands breathe */}
              {commands.length > 0 && (
                <section>
                  <SectionTitle icon={Terminal}>
                    {tool.item_type === 'skill' ? 'Invocation' : 'Quick Install'}
                  </SectionTitle>

                  {/* Multi-command tab switcher */}
                  {commands.length > 1 && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                      {commands.map((cmd, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveCmdIdx(idx)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            activeCmdIdx === idx
                              ? 'bg-[var(--zyro-accent)] text-white shadow-xs'
                              : 'bg-muted/50 text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border/50'
                          }`}
                        >
                          {cmd.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="relative group rounded-xl overflow-hidden border border-neutral-800">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                        {activeCommand?.label ? activeCommand.label.toLowerCase() : 'terminal'}
                      </span>
                      <button
                        onClick={handleCopyCommand}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                        aria-label="Copy installation command"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3.5 bg-neutral-950 text-emerald-300 font-mono text-xs overflow-x-auto">
                      <span className="select-all break-all">
                        <span className="text-neutral-500 select-none">$ </span>{activeCommand?.command}
                      </span>
                    </pre>
                  </div>
                  {tool.installInstructions && (
                    <p className="mt-2 text-xs text-muted-foreground flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[var(--zyro-accent)] shrink-0 mt-px" />
                      <span>{tool.installInstructions}</span>
                    </p>
                  )}
                </section>
              )}

              {/* Install notes without command */}
              {commands.length === 0 && tool.installInstructions && (
                <section>
                  <SectionTitle icon={Info}>Install Notes</SectionTitle>
                  <p className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/40 border border-border/50">
                    {tool.installInstructions}
                  </p>
                </section>
              )}
            </div>

            {/* RIGHT: details card */}
            <aside className="lg:sticky lg:top-0 self-start">
              <div className="rounded-xl border border-border/70 bg-muted/25 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border/60 bg-muted/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Details
                  </span>
                </div>
                <dl className="p-4 space-y-3 text-xs">
                  {[
                    { label: 'Category', value: <span className="font-medium text-foreground">{tool.category}</span> },
                    { label: 'Source', value: <span className="font-medium text-foreground">{tool.source}</span> },
                    tool.version
                      ? { label: 'Version', value: <span className="font-mono font-medium text-foreground">{tool.version}</span> }
                      : null,
                    tool.author?.name
                      ? {
                          label: 'Author',
                          value: tool.author.url ? (
                            <a
                              href={tool.author.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-foreground hover:text-[var(--zyro-accent)] hover:underline inline-flex items-center gap-1"
                            >
                              {tool.author.name}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="font-medium text-foreground">{tool.author.name}</span>
                          ),
                        }
                      : null,
                  ]
                    .filter(Boolean)
                    .map((row) => {
                      const r = row as { label: string; value: React.ReactNode };
                      return (
                        <div key={r.label} className="flex items-baseline justify-between gap-3">
                          <dt className="text-muted-foreground shrink-0">{r.label}</dt>
                          <dd className="text-right">{r.value}</dd>
                        </div>
                      );
                    })}
                </dl>

                {tool.tags.length > 0 && (
                  <div className="px-4 pb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                      <Tag className="w-3 h-3" />
                      Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {tool.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-card text-muted-foreground border border-border/60"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {tool.documentationUrl && (
                  <div className="px-4 pb-4">
                    <a
                      href={tool.documentationUrl}
                      target={tool.documentationUrl.startsWith('http') ? '_blank' : undefined}
                      rel={tool.documentationUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-[var(--zyro-accent)] transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="underline underline-offset-2">Documentation</span>
                    </a>
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* ============ FOOTER ============ */}
          <div className="mt-7 pt-4 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto text-xs"
            >
              Close
            </Button>

            <Link
              to={`/tools/${tool.slug}`}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[var(--zyro-accent)] transition-colors w-full sm:w-auto justify-center"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Full Page
            </Link>

            <a
              href={tool.sourceUrl}
              target={tool.sourceUrl.startsWith('http') ? '_blank' : undefined}
              rel={tool.sourceUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[var(--zyro-accent)] hover:bg-[var(--zyro-sapphire)] transition-colors w-full sm:w-auto shadow-md cursor-pointer"
            >
              <span>
                {tool.source === 'ZYR0 Native'
                  ? 'Launch Native Tool'
                  : tool.source === 'GitHub'
                  ? 'View on GitHub'
                  : tool.source === 'Hugging Face'
                  ? 'Open Hugging Face'
                  : 'Open Official Source'}
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
