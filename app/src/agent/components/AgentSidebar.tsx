import type { ReactNode } from 'react';
import { BookOpen, MessageCircle, Plus, Settings } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ResearchHistoryItem } from '@/agent/hooks/useResearchPipeline';

interface AgentSidebarProps {
  chats: ResearchHistoryItem[];
  research: ResearchHistoryItem[];
  activeId?: string;
  onNewSession: () => void;
  onSelectChat: (id: string) => void;
  onSelectResearch: (id: string) => void;
  onOpenSettings: () => void;
  userEmail?: string;
  mobileOpen?: boolean;
  onToggleMobile?: () => void;
}

function LibraryItem({
  icon,
  title,
  subtitle,
  status,
  active,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  status?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-2.5 rounded-[2px] border px-2.5 py-2 text-left transition ${
        active
          ? 'border-primary/50 bg-primary/5 text-foreground'
          : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground'
      }`}
    >
      <span className={`mt-0.5 shrink-0 ${active ? 'text-primary' : 'opacity-70'}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-1 block text-xs font-medium leading-5">{title}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[10px] opacity-70">
          {subtitle}
          {status && (
            <span
              className={
                status === 'completed'
                  ? 'text-[#166534]'
                  : status === 'failed'
                    ? 'text-[#92400e]'
                    : 'text-primary'
              }
            >
              · {status}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

function SectionHeader({ icon, label, count }: { icon: ReactNode; label: string; count: number }) {
  return (
    <p className="mb-1 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {icon}
      {label}
      <span className="opacity-60">({count})</span>
    </p>
  );
}

function SidebarContent({
  chats,
  research,
  activeId,
  onNewSession,
  onSelectChat,
  onSelectResearch,
  onOpenSettings,
  userEmail,
}: AgentSidebarProps) {
  const date = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-4">
        <div className="flex items-center gap-2.5">
          <div className="agent-logo-ring flex size-7 items-center justify-center rounded text-[13px] font-bold">
            Z
          </div>
          <span className="agent-serif text-lg font-semibold tracking-tight">ZYROO</span>
        </div>
      </div>

      <div className="shrink-0 px-3 pb-4">
        <button
          type="button"
          onClick={onNewSession}
          className="flex w-full items-center justify-center gap-2 rounded-[2px] bg-foreground px-3 py-2 text-xs font-semibold text-background transition hover:bg-foreground/90"
        >
          <Plus className="size-3.5" />
          New session
        </button>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-3">
        {chats.length > 0 && (
          <div className="mb-4">
            <SectionHeader icon={<MessageCircle className="size-3" />} label="Chats" count={chats.length} />
            <div className="flex flex-col gap-0.5">
              {chats.map((item) => (
                <LibraryItem
                  key={item.id}
                  icon={<MessageCircle className="size-3.5" />}
                  title={item.prompt}
                  subtitle={date(item.created_at)}
                  active={activeId === item.id}
                  onClick={() => onSelectChat(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {research.length > 0 && (
          <div className="mb-4">
            <SectionHeader icon={<BookOpen className="size-3" />} label="Research" count={research.length} />
            <div className="flex flex-col gap-0.5">
              {research.map((item) => (
                <LibraryItem
                  key={item.id}
                  icon={<BookOpen className="size-3.5" />}
                  title={item.prompt}
                  subtitle={date(item.created_at)}
                  status={item.status}
                  active={activeId === item.id}
                  onClick={() => onSelectResearch(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {chats.length === 0 && research.length === 0 && (
          <p className="px-2 pb-4 text-[11px] text-muted-foreground">
            No sessions yet — start a chat or a deep research run.
          </p>
        )}
      </ScrollArea>

      <div className="shrink-0 border-t border-border p-3">
        <button
          type="button"
          onClick={onOpenSettings}
          className="mb-2 flex w-full items-center gap-2.5 rounded-[2px] px-2 py-1.5 text-xs text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
        >
          <Settings className="size-4" />
          Settings
        </button>
        <div className="flex items-center gap-2.5 rounded-[2px] px-2 py-1.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#4f46e5] text-[11px] font-semibold text-white">
            {(userEmail ?? 'Z').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground">{userEmail ?? 'Signed in'}</p>
            <p className="text-[10px] text-muted-foreground">Research Agent</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AgentSidebar(props: AgentSidebarProps) {
  const handleSelectChat = (id: string) => {
    props.onToggleMobile?.();
    props.onSelectChat(id);
  };
  const handleSelectResearch = (id: string) => {
    props.onToggleMobile?.();
    props.onSelectResearch(id);
  };
  const handleNewSession = () => {
    props.onToggleMobile?.();
    props.onNewSession();
  };

  return (
    <>
      <aside className="hidden min-h-0 w-72 shrink-0 border-r border-border bg-card lg:block">
        <SidebarContent {...props} onSelectChat={handleSelectChat} onSelectResearch={handleSelectResearch} onNewSession={handleNewSession} />
      </aside>

      {props.mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-black/25"
            onClick={props.onToggleMobile}
          />
          <aside className="agent-thread absolute inset-y-0 left-0 w-80 border-r border-border bg-card shadow-xl">
            <SidebarContent {...props} onSelectChat={handleSelectChat} onSelectResearch={handleSelectResearch} onNewSession={handleNewSession} />
          </aside>
        </div>
      )}
    </>
  );
}
