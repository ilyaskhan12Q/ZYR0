import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Zap } from 'lucide-react';
import type { AgentModelInfo } from '@/agent/core/types';

export function ModelSelector({
  models,
  selectedModel,
  onModelChange,
  position = 'below',
}: {
  models: AgentModelInfo[];
  selectedModel: string | null;
  onModelChange: (id: string) => void;
  position?: 'below' | 'above';
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const selected = models.find((m) => m.id === selectedModel) ?? models[0];

  const updatePosition = useCallback(() => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: position === 'above' ? rect.top - 8 : rect.bottom + 8,
        left: position === 'above' ? rect.left : rect.left,
      });
    }
  }, [position]);

  useEffect(() => {
    if (isOpen) updatePosition();
  }, [isOpen, updatePosition]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 text-[#8a8a8f] hover:text-white hover:bg-white/5 active:scale-95"
      >
        <Zap className="size-3.5 text-emerald-400" />
        <span>{selected?.name ?? 'Model'}</span>
        <ChevronDown className={`size-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
            <div
              className="fixed z-[9999] w-[260px] max-h-[320px] overflow-y-auto bg-[#1a1a1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 animate-in fade-in duration-150"
              style={{
                top: position === 'above' ? pos.top - 320 : pos.top,
                left: pos.left,
              }}
            >
              <div className="p-1.5">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#5a5a5f] sticky top-0 bg-[#1a1a1e]/95 backdrop-blur-xl z-10">
                  Select Model
                </div>
                {models
                  .filter((m) => m.enabled)
                  .map((model) => (
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
                      {selected?.id === model.id && (
                        <Check className="size-3.5 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
