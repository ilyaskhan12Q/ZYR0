import { useEffect, useRef, useState } from 'react';
import { History, Plus, Settings, ChevronLeft, ChevronRight, ChevronDown, Search } from 'lucide-react';
import { AGENT_SHORTCUTS } from '@/agent/hooks/useAgentShortcuts';
import { ShortcutHint } from '@/agent/components/ShortcutHint';

export interface SidebarHistoryItem {
  id: string;
  title: string;
  mode: 'chat' | 'research';
  time: string;
}

/**
 * ZYR0 Research mark — `/logos/research.png` is a vertical lockup (sphere over
 * the "ZYRO RESEARCH" wordmark), so it is scaled to 140% and nudged up to frame
 * just the sphere; the wordmark baked into the file would be illegible (and
 * wrongly spelled for this workspace) at sidebar sizes.
 */
function ResearchLogo({ className }: { className?: string }) {
  return (
    <span className={`relative block overflow-hidden ${className ?? 'size-7'}`} aria-hidden="true">
      <img
        src="/logos/research.png"
        alt=""
        className="absolute top-[-5.5%] left-1/2 w-[140%] max-w-none -translate-x-1/2"
        draggable={false}
      />
    </span>
  );
}

/**
 * "Recent" mark — history clock stroked with the ZYRO blue→violet gradient
 * and a soft glow, so the section header reads as a premium affordance
 * rather than a plain uppercase label.
 */
function RecentIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="recent-icon-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4da5fc" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <g
        stroke="url(#recent-icon-grad)"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7.5v4.8l3.4 1.9" />
      </g>
    </svg>
  );
}

/**
 * Per-item marks for the Recent list — same gradient-stroke + glow language as
 * RecentIcon, in two colourways so a research report is told apart from a plain
 * chat at a glance (blue→violet for research, emerald→blue for chat).
 */
function ResearchItemIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="research-item-grad" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4da5fc" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <g
        stroke="url(#research-item-grad)"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
        <path d="M9 13.5h6" />
      </g>
    </svg>
  );
}

function ChatItemIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="chat-item-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#4da5fc" />
        </linearGradient>
      </defs>
      <g
        stroke="url(#chat-item-grad)"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </g>
    </svg>
  );
}

export function AgentSidebar({
  open,
  onToggle,
  onNewSession,
  onSelectHistory,
  activeId,
  historyItems,
  historyLoading,
  onOpenSettings,
  searchOpen,
  onSearchOpenChange,
}: {
  open: boolean;
  onToggle: () => void;
  onNewSession: () => void;
  onSelectHistory?: (id: string, mode: string) => void;
  activeId?: string;
  historyItems?: SidebarHistoryItem[];
  historyLoading?: boolean;
  onOpenSettings?: () => void;
  // Search visibility is controlled by the page so the floating quick-actions
  // button can open the sidebar and reveal the search box in one go.
  searchOpen: boolean;
  onSearchOpenChange: (open: boolean) => void;
}) {
  const [search, setSearch] = useState('');
  const [recentOpen, setRecentOpen] = useState(true);
  // Hover/focus peek: while the sidebar is pinned closed on desktop, resting
  // the pointer (or tabbing) onto the 48px rail reveals the full panel; moving
  // away hides it again. Peeking never changes the pinned `open` state.
  const [peek, setPeek] = useState(false);
  const leaveTimer = useRef<number | null>(null);

  const expanded = open || peek;

  const cancelLeave = () => {
    if (leaveTimer.current !== null) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };

  useEffect(() => cancelLeave, []);

  // Pinning the sidebar open makes a leftover peek state meaningless.
  useEffect(() => {
    if (open) setPeek(false);
  }, [open]);

  // The rail only exists on desktop; below `lg` the closed sidebar is
  // off-canvas, so pointer/focus reveals would be surprising there.
  const canPeek = () => window.innerWidth >= 1024;

  const handleEnter = () => {
    cancelLeave();
    if (!open && canPeek()) setPeek(true);
  };

  // Short grace period so brushing past the rail doesn't slam it shut.
  const handleLeave = () => {
    if (open) return;
    cancelLeave();
    leaveTimer.current = window.setTimeout(() => {
      leaveTimer.current = null;
      setPeek(false);
    }, 180);
  };


  // Actions taken inside a peek dismiss it, so the panel doesn't linger.
  const dismissPeek = () => {
    if (!open) setPeek(false);
  };

  const handleNewSession = () => {
    dismissPeek();
    onNewSession();
  };

  const handleSelectHistory = (id: string, mode: string) => {
    dismissPeek();
    onSelectHistory?.(id, mode);
  };

  const handleOpenSettings = () => {
    dismissPeek();
    onOpenSettings?.();
  };

  // While peeking `open` is still false, so the header's close button must
  // dismiss the peek instead of pinning the sidebar open.
  const handleClose = () => {
    if (open) onToggle();
    else setPeek(false);
  };

  const closeSearch = () => {
    onSearchOpenChange(false);
    setSearch('');
  };

  const filtered = (historyItems ?? []).filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Opener while the sidebar is closed (mobile: the rail itself is hidden) */}
      {!open && (
        <button
          onClick={onToggle}
          aria-label="Open sidebar"
          title="Open sidebar"
          className="fixed top-3 left-3 z-40 size-9 lg:hidden flex items-center justify-center rounded-lg border border-white/10 bg-[var(--ag-rail-80)] backdrop-blur-sm text-[var(--ag-text-4)] hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      )}

      {/* Sidebar */}
      <div
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-[var(--ag-rail)] border-r border-white/5 transition-all duration-300 ease-out max-w-[85vw] ${
          expanded
            ? 'w-[280px] translate-x-0'
            : 'w-[280px] -translate-x-full lg:translate-x-0 lg:w-[48px]'
        }`}
      >
        {/* Top section */}
        <div
          className={`flex border-b border-white/5 ${
            expanded ? 'items-center justify-between p-3' : 'flex-col items-center gap-1 p-2'
          }`}
        >
          {expanded ? (
            <>
              <span className="flex min-w-0 items-center gap-2">
                <ResearchLogo className="size-7 shrink-0" />
                <span className="text-sm font-semibold text-white tracking-tight">ZYR0 Research</span>
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <ShortcutHint
                  label={
                    searchOpen ? AGENT_SHORTCUTS.closeSearch.label : AGENT_SHORTCUTS.search.label
                  }
                  keys={AGENT_SHORTCUTS.search.keys}
                  side="bottom"
                >
                  <button
                    type="button"
                    onClick={() => onSearchOpenChange(!searchOpen)}
                    aria-label="Search chats"
                    aria-expanded={searchOpen}
                    aria-controls="agent-sidebar-search"
                    className={`size-10 flex items-center justify-center rounded-lg transition-colors ${
                      searchOpen
                        ? 'bg-white/10 text-white'
                        : 'text-[var(--ag-text-5)] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Search className="size-4" />
                  </button>
                </ShortcutHint>
                <ShortcutHint
                  label={AGENT_SHORTCUTS.closeSidebar.label}
                  keys={AGENT_SHORTCUTS.closeSidebar.keys}
                  side="bottom"
                >
                  <button
                    onClick={handleClose}
                    aria-label="Close sidebar"
                    className="size-10 flex items-center justify-center rounded-lg text-[var(--ag-text-5)] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                </ShortcutHint>
              </div>
            </>
          ) : (
            <>
              <ShortcutHint
                label={AGENT_SHORTCUTS.openSidebar.label}
                keys={AGENT_SHORTCUTS.openSidebar.keys}
                side="right"
              >
                <button
                  onClick={onToggle}
                  aria-label="Open sidebar"
                  className="size-7 flex items-center justify-center rounded-lg text-[var(--ag-text-5)] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <ChevronRight className="size-4" />
                </button>
              </ShortcutHint>
              <button
                onClick={onToggle}
                aria-label="ZYR0 Research"
                title="ZYR0 Research"
                className="size-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
              >
                <ResearchLogo className="size-5" />
              </button>
            </>
          )}
        </div>

        {/* Collapsed icon-only nav */}
        {!expanded && (
          <>
            <div className="flex flex-col items-center gap-2 py-3">
              <ShortcutHint
                label={AGENT_SHORTCUTS.newChat.label}
                keys={AGENT_SHORTCUTS.newChat.keys}
                side="right"
              >
                <button
                  onClick={handleNewSession}
                  className="size-10 flex items-center justify-center rounded-lg text-[var(--ag-text-5)] hover:text-white hover:bg-white/5 transition-colors"
                  aria-label="New Chat"
                >
                  <Plus className="size-4" />
                </button>
              </ShortcutHint>
              <button
                onClick={onToggle}
                className="size-10 flex items-center justify-center rounded-lg text-[var(--ag-text-5)] hover:text-white hover:bg-white/5 transition-colors"
                title="History"
              >
                <History className="size-4" />
              </button>
            </div>

            {/* Bottom: Settings — mirrors the expanded sidebar's bottom section */}
            <div className="mt-auto flex flex-col items-center gap-2 p-2 border-t border-white/5">
              <button
                onClick={handleOpenSettings}
                aria-label="Settings"
                title="Settings"
                className="size-10 flex items-center justify-center rounded-lg text-[var(--ag-text-5)] hover:text-white hover:bg-white/5 transition-colors"
              >
                <Settings className="size-4" />
              </button>
            </div>
          </>
        )}

        {/* Expanded content */}
        {expanded && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Search — revealed by the top-bar button */}
            {searchOpen && (
              <div id="agent-sidebar-search" className="px-3 pt-3">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/5 focus-within:border-white/20 transition-colors">
                  <Search className="size-3.5 text-[var(--ag-text-6)]" />
                  <input
                    id="agent-sidebar-search-input"
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') closeSearch();
                    }}
                    placeholder="Search history..."
                    aria-label="Search history"
                    className="flex-1 bg-transparent text-sm text-white placeholder-[var(--ag-text-6)] outline-none"
                  />
                </div>
              </div>
            )}

            {/* New Chat button */}
            <div className="p-3">
              <ShortcutHint
                label={AGENT_SHORTCUTS.newChat.label}
                keys={AGENT_SHORTCUTS.newChat.keys}
                side="bottom"
                className="w-full"
              >
                <button
                  onClick={handleNewSession}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-150 active:scale-[0.98]"
                >
                  <Plus className="size-4" />
                  New Chat
                </button>
              </ShortcutHint>
            </div>

            {/* Recent — collapsible dropdown */}
            <div className="flex-1 overflow-y-auto px-2" data-lenis-prevent="">
              <button
                type="button"
                onClick={() => setRecentOpen((v) => !v)}
                aria-expanded={recentOpen}
                aria-controls="agent-recent-list"
                className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider text-[var(--ag-text-6)] hover:text-white hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <RecentIcon className="size-3.5 shrink-0 drop-shadow-[0_0_3px_rgba(77,165,252,0.45)]" />
                  Recent
                </span>
                <ChevronDown
                  className={`size-3 shrink-0 transition-transform duration-200 ${
                    recentOpen ? '' : '-rotate-90'
                  }`}
                />
              </button>

              {recentOpen && (
                <div id="agent-recent-list" className="pt-1 pb-2">
                  {historyLoading ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-xs text-[var(--ag-text-6)]">Loading...</p>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-xs text-[var(--ag-text-6)]">No history yet</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      {filtered.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelectHistory(item.id, item.mode)}
                          className={`w-full flex items-start gap-2.5 px-2.5 py-2.5 rounded-lg text-left transition-colors duration-150 ${
                            activeId === item.id
                              ? 'bg-white/10 text-white'
                              : 'text-[var(--ag-text-3)] hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {item.mode === 'research' ? (
                            <ResearchItemIcon className="size-3.5 mt-0.5 shrink-0 drop-shadow-[0_0_3px_rgba(77,165,252,0.45)]" />
                          ) : (
                            <ChatItemIcon className="size-3.5 mt-0.5 shrink-0 drop-shadow-[0_0_3px_rgba(52,211,153,0.45)]" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{item.title}</p>
                            <p className="text-[10px] text-[var(--ag-text-6)] mt-0.5">{item.time}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom: Settings */}
            <div className="p-3 border-t border-white/5">
              <button
                onClick={handleOpenSettings}
                className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm text-[var(--ag-text-5)] hover:text-white hover:bg-white/5 transition-colors"
              >
                <Settings className="size-4" />
                Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Spacer when sidebar is open on desktop */}
      {open && <div className="hidden lg:block shrink-0 w-[280px]" />}
    </>
  );
}
