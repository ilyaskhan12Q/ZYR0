import React, { useState } from 'react';
import { ExternalLink, Terminal, Copy, Check, BookOpen, Layers, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ToolItem } from '@/data/tools';
import { toast } from 'sonner';

interface ToolPreviewDialogProps {
  tool: ToolItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ToolPreviewDialog({ tool, open, onOpenChange }: ToolPreviewDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!tool) return null;

  const handleCopyCommand = async () => {
    if (!tool.installCommand) return;
    try {
      await navigator.clipboard.writeText(tool.installCommand);
      setCopied(true);
      toast.success('Install command copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy command');
    }
  };

  const getSourceBadge = () => {
    switch (tool.source) {
      case 'ZYR0 Native':
        return (
          <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent font-medium text-xs">
            ZYR0 Native
          </Badge>
        );
      case 'GitHub':
        return (
          <Badge variant="secondary" className="font-mono text-xs">
            GitHub
          </Badge>
        );
      case 'Hugging Face':
        return (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium text-xs">
            Hugging Face
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {tool.source}
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-card border border-border shadow-2xl">
        <DialogHeader className="space-y-3 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2">
              {getSourceBadge()}
              {tool.item_type && (
                <Badge
                  variant="outline"
                  className={`text-[11px] font-mono capitalize ${
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
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {tool.badge}
                </span>
              )}
              {tool.version && (
                <span className="text-[11px] font-mono text-muted-foreground/80">
                  {tool.version}
                </span>
              )}
            </div>
            {tool.author && (
              <span className="text-xs text-muted-foreground">
                By{' '}
                {tool.author.url ? (
                  <a
                    href={tool.author.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline font-medium text-foreground"
                  >
                    {tool.author.name}
                  </a>
                ) : (
                  <span className="font-medium text-foreground">{tool.author.name}</span>
                )}
              </span>
            )}
          </div>

          <div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground font-sans">
              {tool.name}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-foreground/80 mt-1">
              {tool.tagline}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Description Body */}
        <div className="mt-4 space-y-5 text-sm text-foreground/90 leading-relaxed">
          <p>{tool.description}</p>

          {/* Key Capabilities */}
          {tool.capabilities && tool.capabilities.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-accent" />
                Key Capabilities
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {tool.capabilities.map((cap, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded-lg bg-muted/40 border border-border/50 text-foreground/80"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Installation Section */}
          {tool.installCommand && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-accent" />
                  Quick Install
                </h4>
                {tool.installInstructions && (
                  <span className="text-[11px] text-muted-foreground">
                    {tool.installInstructions}
                  </span>
                )}
              </div>

              <div className="relative group">
                <pre className="p-3 bg-neutral-950 text-neutral-100 rounded-lg font-mono text-xs overflow-x-auto border border-white/10 flex items-center justify-between gap-4">
                  <span className="select-all">{tool.installCommand}</span>
                  <button
                    onClick={handleCopyCommand}
                    className="shrink-0 p-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label="Copy installation command"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </pre>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="pt-2 flex flex-wrap gap-1.5">
            {tool.tags.map((t) => (
              <span
                key={t}
                className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/40"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-xs"
          >
            Close
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {tool.documentationUrl && (
              <a
                href={tool.documentationUrl}
                target={tool.documentationUrl.startsWith('http') ? '_blank' : undefined}
                rel={tool.documentationUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors flex-1 sm:flex-none"
              >
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                Docs
              </a>
            )}

            <a
              href={tool.sourceUrl}
              target={tool.sourceUrl.startsWith('http') ? '_blank' : undefined}
              rel={tool.sourceUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-accent text-white hover:bg-accent/90 transition-colors flex-1 sm:flex-none"
            >
              <span>
                {tool.source === 'ZYR0 Native'
                  ? 'Launch Native Tool'
                  : tool.source === 'GitHub'
                  ? 'Open GitHub'
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
