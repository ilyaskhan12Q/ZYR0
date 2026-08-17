import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { AgentModelInfo } from '@/agent/core/types';
import { AGENT_TIER_LABEL } from '@/agent/core/types';

interface AgentSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  models: AgentModelInfo[];
}

export function AgentSettingsModal({ open, onOpenChange, models }: AgentSettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Research Agent — settings</DialogTitle>
          <DialogDescription>
            Model catalog served by the ai-gateway edge function. Every request
            is authenticated, metered per user, and written to the usage ledger.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {models.map((model) => (
            <div
              key={model.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{model.name}</span>
                  <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                    {AGENT_TIER_LABEL[model.tier]}
                  </Badge>
                </div>
                <div className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                  {model.id} · ctx {model.context.toLocaleString()} · out {model.output.toLocaleString()}
                </div>
              </div>
              <div className="shrink-0 text-right text-[11px] text-muted-foreground">
                <div>{model.inputPricePer1M > 0 ? `$${model.inputPricePer1M}/1M in` : 'Free in'}</div>
                <div>{model.outputPricePer1M > 0 ? `$${model.outputPricePer1M}/1M out` : 'Free out'}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">Notes</p>
          <ul className="mt-1 list-inside list-disc space-y-1">
            <li>
              Free-tier Zen models are shared and burst-limited; the gateway
              cooldowns throttled models and falls back down the chain.
            </li>
            <li>
              Bring-your-own-key providers activate automatically when their
              server secrets are configured (Phase 3).
            </li>
            <li>
              Local models (Ollama) arrive in Phase 3 — they run on your own
              machine and never touch the gateway.
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}