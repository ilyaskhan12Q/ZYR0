import { useState, type KeyboardEvent } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModelPill } from '@/agent/components/ModelPill';
import type { AgentModelInfo } from '@/agent/core/types';
import type { ResearchDepth } from '@/agent/research/types';

const DEPTHS: { id: ResearchDepth; label: string }[] = [
  { id: 'quick', label: 'Quick' },
  { id: 'standard', label: 'Standard' },
  { id: 'deep', label: 'Deep' },
];

interface ComposerDockProps {
  mode: 'chat' | 'research';
  onModeChange: (mode: 'chat' | 'research') => void;
  chatStreaming: boolean;
  onChatSend: (text: string) => void;
  onChatStop: () => void;
  researchRunning: boolean;
  onResearchSend: (topic: string) => void;
  onResearchStop: () => void;
  models: AgentModelInfo[];
  selectedModel: string | null;
  onSelectModel: (id: string) => void;
  modelsLoading?: boolean;
  depth: ResearchDepth;
  onDepthChange: (depth: ResearchDepth) => void;
  onToggleSidebar?: () => void;
}

export function ComposerDock({
  mode,
  onModeChange,
  chatStreaming,
  onChatSend,
  onChatStop,
  researchRunning,
  onResearchSend,
  onResearchStop,
  models,
  selectedModel,
  onSelectModel,
  modelsLoading,
  depth,
  onDepthChange,
  onToggleSidebar,
}: ComposerDockProps) {
  const [value, setValue] = useState('');
  const running = mode === 'chat' ? chatStreaming : researchRunning;

  const submit = () => {
    const text = value.trim();
    if (!text || running) return;
    if (mode === 'chat') onChatSend(text);
    else onResearchSend(text);
    setValue('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="shrink-0 border-t border-border bg-card/60 p-4 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onToggleSidebar && (
              <Button
                variant="outline"
                size="icon"
                className="size-7 rounded-[2px] lg:hidden"
                onClick={onToggleSidebar}
                aria-label="Toggle sidebar"
              >
                <Menu className="size-4" />
              </Button>
            )}
            <div className="flex rounded-[2px] border border-border text-xs">
              <button
                type="button"
                onClick={() => onModeChange('chat')}
                className={`rounded-l-[1px] px-3 py-1.5 transition ${
                  mode === 'chat' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Chat
              </button>
              <button
                type="button"
                onClick={() => onModeChange('research')}
                className={`rounded-r-[1px] px-3 py-1.5 transition ${
                  mode === 'research'
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Research
              </button>
            </div>
            {mode === 'research' && (
              <div className="flex rounded-[2px] border border-border text-xs">
                {DEPTHS.map((d, i) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onDepthChange(d.id)}
                    className={`px-2.5 py-1.5 transition ${
                      i === 0 ? 'rounded-l-[1px]' : i === DEPTHS.length - 1 ? 'rounded-r-[1px]' : ''
                    } ${depth === d.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ModelPill
            models={models}
            selectedId={selectedModel}
            onSelect={onSelectModel}
            disabled={modelsLoading}
          />
        </div>

        <div className="flex items-end gap-3">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder={
              running
                ? mode === 'research'
                  ? 'Researching…'
                  : 'Generating…'
                : mode === 'research'
                  ? 'Research topic — e.g. "climate policy in Germany 2024"'
                  : 'Ask anything — Shift+Enter for newlines'
            }
            disabled={running}
            className="max-h-40 min-h-11 flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-60"
          />
          {running ? (
            <Button variant="secondary" onClick={mode === 'chat' ? onChatStop : onResearchStop} className="h-11 shrink-0">
              Stop
            </Button>
          ) : (
            <Button onClick={submit} disabled={!value.trim()} className="h-11 shrink-0">
              {mode === 'research' ? 'Research' : 'Send'}
            </Button>
          )}
        </div>
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground">
        Free-tier models are shared and rate-limited — the gateway falls back automatically when one is throttled.
      </p>
    </div>
  );
}