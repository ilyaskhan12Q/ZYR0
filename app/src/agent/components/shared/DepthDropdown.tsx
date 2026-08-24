import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { ResearchDepth } from '@/agent/research/types';

const DEPTHS: { id: ResearchDepth; label: string }[] = [
  { id: 'quick', label: 'Quick' },
  { id: 'standard', label: 'Standard' },
  { id: 'deep', label: 'Deep' },
];

export function DepthDropdown({
  depth,
  onDepthChange,
  position = 'bottom',
}: {
  depth: ResearchDepth;
  onDepthChange: (d: ResearchDepth) => void;
  position?: 'top' | 'bottom';
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = DEPTHS.find((d) => d.id === depth) ?? DEPTHS[1];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-3 rounded-full text-xs font-medium transition-all duration-200 text-[#8a8a8f] hover:text-white hover:bg-white/5 active:scale-95"
      >
        <span>{selected.label}</span>
        <ChevronDown className={`size-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute left-0 z-[61] min-w-[120px] bg-[#1a1a1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in duration-150 ${
              position === 'top'
                ? 'bottom-full mb-2 slide-in-from-bottom-1'
                : 'top-full mt-1 slide-in-from-top-1'
            }`}
          >
            <div className="p-1">
              {DEPTHS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    onDepthChange(d.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2.5 rounded-lg text-left text-sm transition-all duration-150 ${
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
