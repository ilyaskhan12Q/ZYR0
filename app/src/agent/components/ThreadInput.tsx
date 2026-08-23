import { useState, useRef, useEffect } from 'react';
import { SendHorizontal, ChevronDown, Check, Zap } from 'lucide-react';
import type { AgentModelInfo } from '@/agent/core/types';
import type { ResearchDepth } from '@/agent/research/types';

const DEPTHS: { id: ResearchDepth; label: string }[] = [
  { id: 'quick', label: 'Quick' },
  { id: 'standard', label: 'Standard' },
  { id: 'deep', label: 'Deep' },
];

function DepthDropdown({
  depth,
  onDepthChange,
}: {
  depth: ResearchDepth;
  onDepthChange: (d: ResearchDepth) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = DEPTHS.find((d) => d.id === depth) ?? DEPTHS[1];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 text-[#8a8a8f] hover:text-white hover:bg-white/5 active:scale-95"
      >
        <span>{selected.label}</span>
        <ChevronDown className={`size-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 min-w-[120px] bg-[#1a1a1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="p-1">
              {DEPTHS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    onDepthChange(d.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-sm transition-all duration-150 ${
                    depth === d.id
                      ? 'bg-white/10 text-white'
                      : 'text-[#a0a0a5] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{d.label}</span>
                  {depth === d.id && <Check className="size-3.5 text-emerald-400 ml-auto shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

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
          <div className="absolute bottom-full right-0 mb-2 z-50 min-w-[240px] max-h-[320px] overflow-y-auto bg-[#1a1a1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-bottom-2 duration-200 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            <div className="p-1.5">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#5a5a5f] sticky top-0 bg-[#1a1a1e]/95 backdrop-blur-xl z-10">
                Model
              </div>
              {models.filter((m) => m.enabled).map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150 ${
                    selected?.id === model.id
                      ? 'bg-white/10 text-white'
                      : 'text-[#a0a0a5] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Zap className="size-3.5 text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{model.name}</span>
                      {model.tier === 'free' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-emerald-500/20 text-emerald-300">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                  {selected?.id === model.id && <Check className="size-3.5 text-emerald-400 shrink-0" />}
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
    <div className="shrink-0 px-4 pt-2 pb-6">
      <div className="mx-auto max-w-3xl">
        {/* Floating input container */}
        <div className="rounded-2xl bg-[#1e1e22] ring-1 ring-white/[0.08] shadow-lg shadow-black/30">
          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder ?? defaultPlaceholder}
              disabled={disabled || running}
              rows={1}
              className="w-full resize-none bg-transparent text-[15px] text-white placeholder-[#5a5a5f] px-5 pt-4 pb-3 focus:outline-none min-h-[52px] max-h-[160px] disabled:opacity-50 transition-all duration-150"
            />
          </div>

          {/* Controls row: mode toggle + depth + model + send */}
          <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-1">
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

              {/* Depth dropdown — only in research mode */}
              {mode === 'research' && (
                <DepthDropdown depth={depth} onDepthChange={onDepthChange} />
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Model selector */}
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                onModelChange={onSelectModel}
              />

              {/* Send button */}
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
        </div>

        <p className="mt-2 text-center text-[11px] text-[#5a5a5f]">
          Free-tier models are shared and rate-limited — the gateway falls back automatically when one is throttled.
        </p>
      </div>
    </div>
  );
}
