import { useRef, useState } from 'react';
import { ArrowUp, Check, Copy, SquarePen } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChatTurn } from '@/lib/zeroai/chat';
import type { ComposerMode } from '@/lib/zeroai/intent';
import { ModeSegment } from '@/components/zeroai/ModeSegment';

interface ChatStageProps {
  turns: ChatTurn[];
  typing: boolean;
  busy: boolean;
  mode: ComposerMode;
  onModeChange: (mode: ComposerMode) => void;
  onSend: (text: string) => void;
  onNewResearch: () => void;
}

function AssistantBubble({ turn }: { turn: ChatTurn }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(turn.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy to clipboard.');
    }
  };

  return (
    <div className="flex max-w-[85%] items-start gap-2 self-start">
      <div className="za-log-in min-w-0 rounded-2xl rounded-bl-md border bg-card px-4 py-2.5 text-sm leading-relaxed text-foreground">
        <p className="whitespace-pre-wrap">{turn.text}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy reply"
        className="mt-2 shrink-0 rounded-md p-1 text-muted-foreground/50 transition-colors hover:text-foreground"
      >
        {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}

export function ChatStage({ turns, typing, busy, mode, onModeChange, onSend, onNewResearch }: ChatStageProps) {
  const [draft, setDraft] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const canSubmit = draft.trim().length >= 2 && !busy && !typing;

  const submit = () => {
    if (busy || typing) return;
    if (draft.trim().length < 2) {
      toast.info('Type at least 2 characters.');
      return;
    }
    const text = draft.trim();
    setDraft('');
    onSend(text);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pt-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="za-mono text-[10px] font-semibold tracking-widest text-muted-foreground">QUICK CHAT</span>
          <span className="za-pulse-dot size-1.5 rounded-full bg-muted-foreground/60" />
        </div>
        <Button variant="ghost" size="sm" onClick={onNewResearch} className="gap-1.5 text-xs text-muted-foreground">
          <SquarePen className="size-3.5" />
          New research
        </Button>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
        {turns.length === 0 && !typing && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Quick chat is on — say hi, or ask anything casual. Research questions go straight to deep-research mode.
          </p>
        )}
        {turns.map((turn) =>
          turn.role === 'user' ? (
            <div key={turn.id} className="flex justify-end">
              <div className="za-log-in max-w-[85%] rounded-2xl rounded-br-md border border-primary/25 bg-primary/10 px-4 py-2.5 text-sm leading-relaxed text-foreground">
                {turn.text}
              </div>
            </div>
          ) : (
            <AssistantBubble key={turn.id} turn={turn} />
          )
        )}
        {typing && (
          <div className="flex self-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border bg-card px-4 py-3">
              <span className="za-pulse-dot size-1.5 rounded-full bg-muted-foreground" />
              <span className="za-pulse-dot size-1.5 rounded-full bg-muted-foreground" />
              <span className="za-pulse-dot size-1.5 rounded-full bg-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="px-4 pb-4 sm:px-6 sm:pb-5">
        <div className="mx-auto max-w-2xl rounded-2xl border border-z-edge-strong bg-card p-2 shadow-lg shadow-black/20 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-ring/50">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              autoGrow();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            placeholder="Ask anything — 'hello', or 'compare sodium-ion vs LFP'…"
            className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60"
            aria-label="Chat message"
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-2 pb-1 pt-2">
            <ModeSegment mode={mode} onModeChange={onModeChange} />
            <div className="ml-auto flex items-center gap-3">
              <span className={cn('za-mono text-[10px] tracking-wide', busy ? 'text-primary' : 'text-muted-foreground/70')}>
                {busy ? 'ROUTING…' : 'AUTO ROUTES CHAT VS RESEARCH'}
              </span>
              <Button size="icon-sm" onClick={submit} disabled={!canSubmit} aria-label="Send message" className="rounded-lg">
                <ArrowUp className="size-4" />
              </Button>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[10px] text-muted-foreground/60">
          Quick chat answers with your BYOK key (or canned replies without one). Research questions hand off to the deep-research pipeline.
        </p>
      </div>
    </div>
  );
}