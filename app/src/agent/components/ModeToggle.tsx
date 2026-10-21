'use client'

import { MessageSquare, Telescope } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AgentMode = 'chat' | 'research'

/**
 * Chat / Research selector.
 *
 * It lives in the top bar of the workspace (the thread header and the empty
 * state hero) rather than under the composer, so the mode is chosen *before*
 * the prompt is typed — ChatGPT-style.
 */
export function ModeToggle({
  mode,
  onModeChange,
  className,
}: {
  mode: AgentMode
  onModeChange: (m: AgentMode) => void
  className?: string
}) {
  return (
    <div
      role="group"
      aria-label="Response mode"
      className={cn(
        'flex shrink-0 rounded-full border border-white/10 bg-[var(--ag-panel-70)] backdrop-blur-sm overflow-hidden text-sm',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onModeChange('chat')}
        aria-pressed={mode === 'chat'}
        className={cn(
          'flex items-center gap-1.5 px-4 py-2 font-medium transition-all duration-150',
          mode === 'chat'
            ? 'bg-white/10 text-white'
            : 'text-[var(--ag-text-5)] hover:text-white hover:bg-white/5'
        )}
      >
        <MessageSquare className="size-4 shrink-0" aria-hidden="true" />
        Chat
      </button>
      <button
        type="button"
        onClick={() => onModeChange('research')}
        aria-pressed={mode === 'research'}
        className={cn(
          'flex items-center gap-1.5 px-4 py-2 font-medium transition-all duration-150',
          mode === 'research'
            ? 'bg-white/10 text-white'
            : 'text-[var(--ag-text-5)] hover:text-white hover:bg-white/5'
        )}
      >
        <Telescope className="size-4 shrink-0" aria-hidden="true" />
        Research
      </button>
    </div>
  )
}
