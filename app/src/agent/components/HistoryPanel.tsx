import type { ResearchHistoryItem } from '@/agent/hooks/useResearchPipeline';

interface HistoryPanelProps {
  items: ResearchHistoryItem[];
  activeId?: string;
  onSelect: (id: string) => void;
}

export function HistoryPanel({ items, activeId, onSelect }: HistoryPanelProps) {
  return (
    <aside className="hidden w-64 shrink-0 border-l border-border bg-card p-3 md:block">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Research history
      </p>
      {items.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">No deep-research runs yet.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`rounded-[2px] border px-2.5 py-2 text-left text-[11px] transition ${
                activeId === item.id
                  ? 'border-primary/60 bg-primary/5 text-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <span className="line-clamp-2">{item.prompt}</span>
              <span className="mt-1 block text-[10px] opacity-60">
                {new Date(item.created_at).toLocaleDateString()} ·{' '}
                <span className={item.status === 'completed' ? 'text-[#166534]' : 'text-[#92400e]'}>
                  {item.status}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}