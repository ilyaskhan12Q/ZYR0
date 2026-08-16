import { KeyRound, PanelLeft, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Depth } from '@/data/zeroAiFixtures';

interface ZeroAiHeaderProps {
  depth: Depth;
  onDepthChange: (depth: Depth) => void;
  hasAnyKeys: boolean;
  configuredCount: number;
  onOpenKeys: () => void;
  onToggleSidebar: () => void;
  onOpenMobileHistory: () => void;
}

function DepthOption({ value, hint, active }: { value: Depth; hint: string; active: boolean }) {
  return (
    <span className={`za-mono text-xs font-semibold tracking-widest ${active ? 'text-foreground' : ''}`}>
      {value}
      <span className="ml-2 font-sans font-normal tracking-normal text-muted-foreground">{hint}</span>
    </span>
  );
}

export function ZeroAiHeader({
  depth,
  onDepthChange,
  hasAnyKeys,
  configuredCount,
  onOpenKeys,
  onToggleSidebar,
  onOpenMobileHistory,
}: ZeroAiHeaderProps) {
  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md sm:px-4">
      {/* Desktop: collapse sidebar */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onToggleSidebar}
        aria-label="Toggle history sidebar"
        className="hidden md:inline-flex"
      >
        <PanelLeft className="size-4" />
      </Button>
      {/* Mobile: open history sheet */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onOpenMobileHistory}
        aria-label="Open research history"
        className="md:hidden"
      >
        <Menu className="size-4" />
      </Button>

      {/* Brand */}
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border bg-primary/10 text-primary">
          <span className="za-mono text-[11px] font-bold tracking-tight">0-AI</span>
        </div>
        <div className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="text-sm font-semibold tracking-tight text-foreground">Deep Research</span>
          <span className="za-mono text-[10px] tracking-[0.18em] text-muted-foreground">WORKSPACE · PHASE 1</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {/* Depth selector */}
        <Select value={depth} onValueChange={(v) => onDepthChange(v as Depth)}>
          <SelectTrigger
            aria-label="Research depth"
            className="h-8 w-auto gap-2 border bg-secondary/40 px-2.5 text-xs sm:w-[190px]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" sideOffset={6}>
            <SelectItem value="STANDARD">
              <DepthOption value="STANDARD" hint="Balanced · ~1 min" active={depth === 'STANDARD'} />
            </SelectItem>
            <SelectItem value="EXHAUSTIVE">
              <DepthOption value="EXHAUSTIVE" hint="Deep · ~3 min" active={depth === 'EXHAUSTIVE'} />
            </SelectItem>
          </SelectContent>
        </Select>

        {/* BYOK button */}
        <Button variant="ghost" size="sm" onClick={onOpenKeys} className="relative gap-1.5 text-xs">
          <span className="relative">
            <KeyRound className="size-3.5" />
          </span>
          <span className="hidden sm:inline">Keys</span>
          <span
            className={`size-1.5 rounded-full ${hasAnyKeys ? 'bg-emerald-400' : 'bg-muted-foreground/50'}`}
            aria-hidden="true"
          />
          {hasAnyKeys ? (
            <span className="sr-only">{configuredCount} provider key{configuredCount === 1 ? '' : 's'} configured</span>
          ) : null}
        </Button>
      </div>
    </header>
  );
}