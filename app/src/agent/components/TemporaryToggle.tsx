'use client'

import { cn } from '@/lib/utils'

/**
 * The temporary-chat glyph: a speech bubble with a diagonal slash — an
 * "off the record" chat. Stroked with a gradient that follows the state
 * (quiet gray when off, amber when on) so the control still reads as a
 * premium mark at the 16px it renders at.
 */
function TemporaryGlyph({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn(
        'size-4 shrink-0',
        active && 'drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]'
      )}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="tmp-chat-grad" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? '#fde68a' : '#a1a1a8'} />
          <stop offset="1" style={{ stopColor: active ? '#f59e0b' : 'var(--ag-text-5)' }} />
        </linearGradient>
      </defs>
      <g
        stroke="url(#tmp-chat-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        <path d="M7.5 7.5 15.5 15.5" />
      </g>
    </svg>
  )
}

/**
 * Temporary-chat switch (ChatGPT-style): an icon-only control in the top
 * corner. While it is on, nothing written in the conversation is persisted
 * to `agent_researches` / `agent_messages`, so the run never appears in the
 * sidebar history. The accessible name lives on aria-label/title since the
 * visible word was dropped to match ChatGPT.
 */
export function TemporaryToggle({
  active,
  onToggle,
  className,
}: {
  active: boolean
  onToggle: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label="Temporary chat"
      title="Temporary chat — messages are never saved to your history"
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full border transition-all duration-150 active:scale-95',
        active
          ? 'border-amber-400/40 bg-amber-400/15 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
          : 'border-white/10 bg-[var(--ag-panel-60)] hover:border-white/20 hover:bg-white/10',
        className
      )}
    >
      <TemporaryGlyph active={active} />
    </button>
  )
}
