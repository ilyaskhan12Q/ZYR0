import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { AgentModelInfo } from '@/agent/core/types';
import { AGENT_TIER_LABEL } from '@/agent/core/types';

interface ModelPillProps {
  models: AgentModelInfo[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function ModelPill({ models, selectedId, onSelect, disabled }: ModelPillProps) {
  const [open, setOpen] = useState(false);
  const selected = models.find((m) => m.id === selectedId);
  const tier = selected?.tier ?? 'free';

  const tierColor =
    tier === 'free'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        disabled={disabled}
        className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground outline-none transition hover:bg-accent focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
      >
        <span className="font-medium">{selected?.name ?? 'Auto'}</span>
        <Badge variant="outline" className={`h-4 px-1.5 text-[10px] ${tierColor}`}>
          {AGENT_TIER_LABEL[tier]}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Model — auto falls back through the chain
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => onSelect('auto')}
          className={selectedId === null ? 'bg-accent' : undefined}
        >
          <div className="flex flex-col gap-0.5 py-1">
            <span className="text-sm font-medium">Auto (recommended)</span>
            <span className="text-xs text-muted-foreground">
              Free models in priority order, automatic fallback on throttling
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onSelect(model.id)}
            className={selectedId === model.id ? 'bg-accent' : undefined}
          >
            <div className="flex w-full flex-col gap-0.5 py-1">
              <span className="text-sm font-medium">{model.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{model.id}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}