import { useState, useRef, useEffect } from 'react';
import { SendHorizontal, ChevronDown, Check, Zap } from 'lucide-react';
import type { AgentModelInfo } from '@/agent/core/types';
import type { ResearchDepth } from '@/agent/research/types';

const DEPTHS: { id: ResearchDepth; label: string }[] = [
  { id: 'quick', label: 'Quick' },
  { id: 'standard', label: 'Standard' },
  { id: 'deep', label: 'Deep' },
];

function ModelSelector({
  models,
  selectedModel,
  onModelChange,
}: {
  models: AgentModelInfo[];
  selectedModel: string | null;
  onModelChange: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = models.find((m) => m.id === selectedModel) ?? models[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 text-[#8a8a8f] hover:text-white hover:bg-white/5 active:scale-95"
      >
        <Zap className="size-3.5 text-emerald-400" />
        <span>{selected?.name ?? 'Model'}</span>
        <ChevronDown className={`size-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 z-50 min-w-[200px] bg-[#1a1a1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="p-1.5">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#5a5a5f]">
                Model
              </div>
              {models.filter((m) => m.enabled).map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-all duration-150 ${
                    selected?.id === model.id
                      ? 'bg-white/10 text-white'
                      : 'text-[#a0a0a5] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Zap className="size-3.5 text-emerald-400 shrink-0" />
                  <span className="text-sm">{model.name}</span>
                  {selected?.id === model.id && <Check className="size-3.5 text-emerald-400 ml-auto shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function ThreadInput({
  mode,
  onModeChange,
  models,
  selectedModel,
  onSelectModel,
  depth,
  onDepthChange,
  onSend,
  onStop,
  running,
  disabled,
  placeholder,
}: {
  mode: 'chat' | 'research';
  onModeChange: (m: 'chat' | 'research') => void;
  models: AgentModelInfo[];
  selectedModel: string | null;
  onSelectModel: (id: string) => void;
  depth: ResearchDepth;
  onDepthChange: (d: ResearchDepth) => void;
  onSend: (text: string) => void;
  onStop: () => void;
  running: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [message]);

  const submit = () => {
    if (running) {
      onStop();
      return;
    }
    const text = message.trim();
    if (!text || disabled) return;
    onSend(text);
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const defaultPlaceholder = running
    ? mode === 'research'
      ? 'Researching...'
      : 'Generating...'
    : mode === 'research'
      ? 'Research topic — e.g. "climate policy in Germany 2024"'
      : 'Ask anything — Shift+Enter for newlines';

  return (
    <div className="shrink-0 border-t border-white/5 p-4">
      <div className="mx-auto max-w-3xl">
        {/* Controls row: mode toggle + depth + model */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            {/* Chat / Research toggle */}
            <div className="flex rounded-full border border-white/10 text-xs overflow-hidden">
              <button
                type="button"
                onClick={() => onModeChange('chat')}
                className={`px-3 py-1.5 transition-all duration-150 ${
                  mode === 'chat'
                    ? 'bg-white/10 text-white'
                    : 'text-[#6a6a6f] hover:text-white hover:bg-white/5'
                }`}
              >
                Chat
              </button>
              <button
                type="button"
                onClick={() => onModeChange('research')}
                className={`px-3 py-1.5 transition-all duration-150 ${
                  mode === 'research'
                    ? 'bg-white/10 text-white'
                    : 'text-[#6a6a6f] hover:text-white hover:bg-white/5'
                }`}
              >
                Research
              </button>
            </div>

            {/* Depth pills — only in research mode */}
            {mode === 'research' && (
              <div className="flex items-center rounded-full text-xs">
                {DEPTHS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onDepthChange(d.id)}
                    className={`px-2.5 py-1.5 rounded-full transition-all duration-150 ${
                      depth === d.id
                        ? 'bg-white/10 text-white'
                        : 'text-[#6a6a6f] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Model selector */}
          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            onModelChange={onSelectModel}
          />
        </div>

        {/* Input row */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? defaultPlaceholder}
            disabled={disabled || running}
            rows={1}
            className="w-full resize-none bg-[#1e1e22] text-[15px] text-white placeholder-[#5a5a5f] px-4 py-3 rounded-xl ring-1 ring-white/[0.08] focus:outline-none focus:ring-white/[0.15] min-h-[48px] max-h-[160px] disabled:opacity-50 transition-all duration-150"
          />
          <div className="absolute right-2 bottom-2">
            <button
              onClick={submit}
              disabled={!running && !message.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1488fc] hover:bg-[#1a94ff] text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              {running ? (
                <>
                  <span className="hidden sm:inline">Stop</span>
                  <div className="size-1.5 rounded-full bg-white animate-pulse" />
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">{mode === 'research' ? 'Research' : 'Send'}</span>
                  <SendHorizontal className="size-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        <p className="mt-2 text-center text-[11px] text-[#5a5a5f]">
          Free-tier models are shared and rate-limited — the gateway falls back automatically when one is throttled.
        </p>
      </div>
    </div>
  );
}
