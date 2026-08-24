import { useState } from 'react';
import { History, Plus, Settings, ChevronLeft, Search, MessageSquare, FileText } from 'lucide-react';

export interface SidebarHistoryItem {
  id: string;
  title: string;
  mode: 'chat' | 'research';
  time: string;
}

export function AgentSidebar({
  open,
  onToggle,
  onNewSession,
  onSelectHistory,
  activeId,
  historyItems,
  historyLoading,
}: {
  open: boolean;
  onToggle: () => void;
  onNewSession: () => void;
  onSelectHistory?: (id: string, mode: string) => void;
  activeId?: string;
  historyItems?: SidebarHistoryItem[];
  historyLoading?: boolean;
}) {
  const [search, setSearch] = useState('');

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

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-[#111113] border-r border-white/5 transition-all duration-300 ease-out max-w-[85vw] ${
          open
            ? 'w-[280px] translate-x-0'
            : 'w-[280px] -translate-x-full lg:translate-x-0 lg:w-[48px]'
        }`}
      >
        {/* Top section */}
        <div className="flex items-center justify-between p-3 border-b border-white/5">
          {open ? (
            <>
              <span className="text-sm font-semibold text-white tracking-tight">ZYROO</span>
              <button
                onClick={onToggle}
                className="size-10 flex items-center justify-center rounded-lg text-[#6a6a6f] hover:text-white hover:bg-white/5 transition-colors lg:hidden"
              >
                <ChevronLeft className="size-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onToggle}
              className="size-7 flex items-center justify-center rounded-lg text-[#6a6a6f] hover:text-white hover:bg-white/5 transition-colors mx-auto"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </button>
          )}
        </div>

        {/* Collapsed icon-only nav */}
        {!open && (
          <div className="flex flex-col items-center gap-2 py-3">
            <button
              onClick={onNewSession}
              className="size-10 flex items-center justify-center rounded-lg text-[#6a6a6f] hover:text-white hover:bg-white/5 transition-colors"
              title="New Chat"
            >
              <Plus className="size-4" />
            </button>
            <button
              onClick={onToggle}
              className="size-10 flex items-center justify-center rounded-lg text-[#6a6a6f] hover:text-white hover:bg-white/5 transition-colors"
              title="History"
            >
              <History className="size-4" />
            </button>
          </div>
        )}

        {/* Expanded content */}
        {open && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* New Chat button */}
            <div className="p-3">
              <button
                onClick={onNewSession}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-150 active:scale-[0.98]"
              >
                <Plus className="size-4" />
                New Chat
              </button>
            </div>

            {/* Search */}
            <div className="px-3 pb-2">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/5">
                <Search className="size-3.5 text-[#5a5a5f]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search history..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-[#5a5a5f] outline-none"
                />
              </div>
            </div>

            {/* History list */}
            <div className="flex-1 overflow-y-auto px-2">
              <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#5a5a5f]">
                Recent
              </div>
              {historyLoading ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs text-[#5a5a5f]">Loading...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs text-[#5a5a5f]">No history yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {filtered.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSelectHistory?.(item.id, item.mode)}
                      className={`w-full flex items-start gap-2.5 px-2.5 py-2.5 rounded-lg text-left transition-colors duration-150 ${
                        activeId === item.id
                          ? 'bg-white/10 text-white'
                          : 'text-[#a0a0a5] hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {item.mode === 'research' ? (
                        <FileText className="size-3.5 mt-0.5 shrink-0 text-blue-400" />
                      ) : (
                        <MessageSquare className="size-3.5 mt-0.5 shrink-0 text-[#6a6a6f]" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.title}</p>
                        <p className="text-[10px] text-[#5a5a5f] mt-0.5">{item.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom: Settings */}
            <div className="p-3 border-t border-white/5">
              <button className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm text-[#6a6a6f] hover:text-white hover:bg-white/5 transition-colors">
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
