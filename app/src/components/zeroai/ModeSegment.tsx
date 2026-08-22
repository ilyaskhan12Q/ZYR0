import { FlaskConical, MessageSquare, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ComposerMode } from '@/lib/zeroai/intent';

interface ModeSegmentProps {
  mode: ComposerMode;
  onModeChange: (mode: ComposerMode) => void;
}

const MODES: { id: ComposerMode; label: string; icon: typeof Sparkles }[] = [
  { id: 'auto', label: 'AUTO', icon: Sparkles },
  { id: 'chat', label: 'CHAT', icon: MessageSquare },
  { id: 'research', label: 'RESEARCH', icon: FlaskConical },
];

export function ModeSegment({ mode, onModeChange }: ModeSegmentProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-secondary p-0.5" role="group" aria-label="Composer mode">
      {MODES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onModeChange(id)}
          aria-pressed={mode === id}
          title={id === 'auto' ? 'Auto-detect: chat vs research' : id === 'chat' ? 'Quick chat only' : 'Deep research report'}
          className={cn(
            'za-mono flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-semibold tracking-widest transition-colors',
            mode === id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Icon className="size-3" />
          {label}
        </button>
      ))}
    </div>
  );
}