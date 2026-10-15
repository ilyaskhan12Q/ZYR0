'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Check, PanelLeftClose, Plus, Search, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TemporaryGlyph } from '@/agent/components/TemporaryToggle';

/**
 * Floating quick-actions button (bottom-right): hovering it reveals the four
 * most-used workspace shortcuts — close sidebar, search, temporary chat and
 * new chat. Hover drives the reveal on desktop; click toggles the same menu
 * on touch devices, and Escape / click-away dismiss it either way. The
 * invisible bridge spanning the button→menu gap keeps the hover alive while
 * the cursor travels into the menu.
 */

function MenuRow({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-[var(--ag-text-2)] transition-colors hover:bg-white/5 hover:text-white"
    >
      <Icon className="size-4 shrink-0 text-[var(--ag-text-5)]" aria-hidden="true" />
      {label}
    </button>
  );
}

export interface AgentQuickActionsProps {
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  onOpenSearch: () => void;
  temporary: boolean;
  onToggleTemporary: () => void;
  onNewChat: () => void;
}

export function AgentQuickActions({
  sidebarOpen,
  onCloseSidebar,
  onOpenSearch,
  temporary,
  onToggleTemporary,
  onNewChat,
}: AgentQuickActionsProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Escape and click-away dismiss the menu while it is open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onMouseDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onMouseDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onMouseDown);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="fixed bottom-4 right-4 z-40 hidden lg:block"
    >
      {/* Invisible bridge over the 8px gap so the cursor can travel from the
          button into the menu without a mouseleave closing it first. */}
      <span aria-hidden="true" className="absolute bottom-full right-0 h-2 w-full" />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Quick actions"
        title="Quick actions"
        className={cn(
          'grid size-11 place-items-center rounded-full border transition-all duration-150 active:scale-95',
          open
            ? 'border-white/20 bg-white/10 text-white'
            : 'border-white/10 bg-[var(--ag-panel-60)] text-[var(--ag-text-4)] backdrop-blur-sm hover:border-white/20 hover:bg-white/10 hover:text-white'
        )}
      >
        <Zap className="size-4" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            key="quick-actions-menu"
            role="menu"
            aria-label="Quick actions"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full right-0 mb-2 w-48 origin-bottom-right rounded-xl border border-white/10 bg-[var(--ag-surface)] p-1.5 shadow-[0_24px_64px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.08]"
          >
            {sidebarOpen && (
              <MenuRow
                icon={PanelLeftClose}
                label="Close sidebar"
                onClick={() => {
                  onCloseSidebar();
                  setOpen(false);
                }}
              />
            )}
            <MenuRow
              icon={Search}
              label="Search"
              onClick={() => {
                onOpenSearch();
                setOpen(false);
              }}
            />
            {/* Toggle, not navigation — the menu stays open so it can be
                switched off again without re-hovering. */}
            <button
              type="button"
              role="menuitem"
              aria-pressed={temporary}
              onClick={onToggleTemporary}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                temporary
                  ? 'text-amber-300 hover:bg-amber-400/10 hover:text-amber-200'
                  : 'text-[var(--ag-text-2)] hover:bg-white/5 hover:text-white'
              )}
            >
              <TemporaryGlyph active={temporary} />
              <span className="flex-1 text-left">Temporary chat</span>
              {temporary && <Check className="size-3.5 shrink-0 text-amber-400" aria-hidden="true" />}
            </button>
            <MenuRow
              icon={Plus}
              label="New Chat"
              onClick={() => {
                onNewChat();
                setOpen(false);
              }}
            />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
