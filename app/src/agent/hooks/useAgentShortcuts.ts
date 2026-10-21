import { useEffect, useRef } from 'react';

/**
 * Keyboard shortcuts for the research workspace:
 *
 *   Alt+N  new chat          Alt+T  temporary chat
 *   Alt+S  search history    Alt+L  sidebar (open/close)
 *
 * Alt is used instead of Ctrl because Chrome/Edge/Firefox reserve Ctrl+N
 * (new window), Ctrl+T (new tab) and Ctrl+L (address bar) — a page never
 * receives those keydowns. `event.code` is matched rather than `event.key`
 * so the shortcuts keep working on non-latin keyboard layouts, and macOS
 * users get the same combos via Option (= Alt).
 *
 * The panel shortcuts are toggles: the same keys that reveal the search box
 * or the sidebar hide them again.
 */
export const AGENT_SHORTCUTS = {
  newChat: { label: 'New chat', keys: ['Alt', 'N'] as const },
  temporary: { label: 'Temporary chat', keys: ['Alt', 'T'] as const },
  search: { label: 'Search', keys: ['Alt', 'S'] as const },
  closeSearch: { label: 'Close search', keys: ['Alt', 'S'] as const },
  closeSidebar: { label: 'Close sidebar', keys: ['Alt', 'L'] as const },
  openSidebar: { label: 'Open sidebar', keys: ['Alt', 'L'] as const },
};

export interface AgentShortcutActions {
  onNewChat: () => void;
  onToggleTemporary: () => void;
  onToggleSearch: () => void;
  onToggleSidebar: () => void;
}

export function useAgentShortcuts(actions: AgentShortcutActions, enabled = true) {
  // Keep the latest handlers without re-subscribing on every render.
  const actionsRef = useRef(actions);
  useEffect(() => {
    actionsRef.current = actions;
  });

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      // Alt alone, no other modifiers, and not an auto-repeat while held.
      if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.repeat) return;

      const current = actionsRef.current;
      switch (event.code) {
        case 'KeyN':
          event.preventDefault();
          current.onNewChat();
          break;
        case 'KeyT':
          event.preventDefault();
          current.onToggleTemporary();
          break;
        case 'KeyS':
          event.preventDefault();
          current.onToggleSearch();
          break;
        case 'KeyL':
          event.preventDefault();
          current.onToggleSidebar();
          break;
        default:
          return;
      }
      event.stopPropagation();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
