import { useState, useRef, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import type { AgentModelInfo } from '@/agent/core/types';
import type { ResearchDepth } from '@/agent/research/types';
import { DepthDropdown } from '@/agent/components/shared/DepthDropdown';
import { ModelSelector } from '@/agent/components/shared/ModelSelector';

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

          {/* Controls row */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-3 pt-1">
            <div className="flex items-center gap-2">
              {/* Chat / Research toggle */}
              <div className="flex rounded-full border border-white/10 text-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => onModeChange('chat')}
                  className={`px-3 py-2.5 transition-all duration-150 ${
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
                  className={`px-3 py-2.5 transition-all duration-150 ${
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
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-medium bg-[#1488fc] hover:bg-[#1a94ff] text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
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
