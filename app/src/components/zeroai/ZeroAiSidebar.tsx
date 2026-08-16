import { ChevronLeft, Clock, FileText, Plus, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { HistoryItem } from '@/hooks/useZeroAiHistory';

interface ZeroAiSidebarProps {
  /* Desktop rail */
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /* Mobile sheet */
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  /* Data + actions */
  items: HistoryItem[];
  activeId: string | null;
  onSelect: (item: HistoryItem) => void;
  onNewResearch: () => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onOpenKeys: () => void;
  hasAnyKeys: boolean;
}

function HistoryList({
  items,
  activeId,
  onSelect,
  onRemove,
}: {
  items: HistoryItem[];
  activeId: string | null;
  onSelect: (item: HistoryItem) => void;
  onRemove: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
        <Clock className="size-5 text-muted-foreground/60" />
        <p className="text-xs text-muted-foreground">No research yet.<br />Start your first report above.</p>
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-1 px-2">
      {items.map((item) => (
        <li key={item.id} className="group relative">
          <button
            type="button"
            onClick={() => onSelect(item)}
            className={cn(
              'flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors',
              item.id === activeId
                ? 'border-primary/30 bg-primary/10 text-foreground'
                : 'border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <FileText className="mt-0.5 size-3.5 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium leading-snug">{item.title}</span>
              <span className="za-mono mt-1 block text-[10px] tracking-wide text-muted-foreground/70">
                {item.depth} · {item.status === 'running' ? 'running' : 'done'}
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Delete history item ${item.title}`}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground/50 opacity-0 transition-opacity hover:bg-z-hover hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
          >
            <Trash2 className="size-3" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function ZeroAiSidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onMobileOpenChange,
  items,
  activeId,
  onSelect,
  onNewResearch,
  onRemove,
  onClearAll,
  onOpenKeys,
  hasAnyKeys,
}: ZeroAiSidebarProps) {
  const desktopBody = (
    <div className="flex h-full flex-col">
      <div className="px-3 py-3">
        <Button size="sm" className="w-full justify-start gap-2" onClick={onNewResearch}>
          <Plus className="size-4" />
          {!collapsed && <span>New Research</span>}
        </Button>
      </div>
      {!collapsed && (
        <div className="flex items-center justify-between px-4 pb-2">
          <span className="za-mono text-[10px] tracking-[0.22em] text-muted-foreground">HISTORY</span>
          {items.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-[10px] text-muted-foreground/70 underline-offset-2 hover:text-foreground hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}
      <nav className="min-h-0 flex-1 overflow-y-auto">
        <HistoryList items={items} activeId={activeId} onSelect={onSelect} onRemove={onRemove} />
      </nav>
      <div className="border-t p-2">
        <button
          type="button"
          onClick={onOpenKeys}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
            collapsed && 'justify-center px-0'
          )}
        >
          <span className={`size-1.5 rounded-full ${hasAnyKeys ? 'bg-emerald-400' : 'bg-muted-foreground/50'}`} />
          {!collapsed && <span>API Keys (BYOK)</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={cn(
          'relative z-10 hidden h-full shrink-0 flex-col border-r bg-card/60 transition-[width] duration-200 md:flex',
          collapsed ? 'w-[64px]' : 'w-[268px]'
        )}
      >
        {desktopBody}
        {/* Collapse handle on the rail edge */}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-accent"
        >
          <ChevronLeft className={cn('size-3.5 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </aside>

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-[300px] gap-0 p-0">
          <SheetHeader className="flex-row items-center justify-between border-b px-4 py-3">
            <SheetTitle>
              <span className="za-mono text-sm font-bold tracking-tight">0-AI · HISTORY</span>
            </SheetTitle>
            <Button variant="ghost" size="icon-sm" onClick={() => onMobileOpenChange(false)} aria-label="Close history">
              <X className="size-4" />
            </Button>
          </SheetHeader>
          <div className="min-h-0 flex-1">{desktopBody}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}