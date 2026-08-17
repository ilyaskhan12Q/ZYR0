import type { AgentChatMessage } from '@/agent/core/types';
import { Badge } from '@/components/ui/badge';

function formatTokens(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function formatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

function AssistantMeta({ message }: { message: AgentChatMessage }) {
  if (!message.meta) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
      <span className="font-mono">{message.meta.model}</span>
      <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
        ↑{formatTokens(message.meta.inputTokens)} ↓{formatTokens(message.meta.outputTokens)}
      </Badge>
      <span className="font-mono">{formatMs(message.meta.latencyMs)}</span>
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Thinking">
      <span className="agent-pulse-dot size-1.5 rounded-full bg-current" />
      <span className="agent-pulse-dot size-1.5 rounded-full bg-current" />
      <span className="agent-pulse-dot size-1.5 rounded-full bg-current" />
    </span>
  );
}

export function AgentChat({ messages }: { messages: AgentChatMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="agent-logo-ring flex size-14 items-center justify-center rounded-2xl text-xl font-bold">
          Z
        </div>
        <h2 className="agent-serif text-xl font-medium">Research Agent</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Ask a question below. Runs on the free-tier Zen models with automatic
          fallback — no API keys required. Deep research pipeline lands in Phase 2.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed agent-whitespace-pre-wrap ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border'
            }`}
          >
            {message.streaming && message.content === '' ? (
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <ThinkingDots />
              </span>
            ) : (
              message.content
            )}
            {message.error && (
              <div className="mt-2 border-t border-destructive/30 pt-2 text-xs text-destructive">
                {message.error}
              </div>
            )}
            {message.role === 'assistant' && !message.streaming && !message.error && (
              <AssistantMeta message={message} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}