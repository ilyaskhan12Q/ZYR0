import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, X, CheckSquare } from 'lucide-react';

interface TaskBulkActionBarProps {
  selectedCount: number;
  totalOverdueCount: number;
  onOpenExtend: () => void;
  onSelectAllOverdue: () => void;
  onClearSelection: () => void;
}

export function TaskBulkActionBar({
  selectedCount,
  totalOverdueCount,
  onOpenExtend,
  onSelectAllOverdue,
  onClearSelection,
}: TaskBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-2xl max-w-xl w-full"
        >
          {/* Left info badge */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent font-bold text-xs">
              {selectedCount}
            </span>
            <div className="text-xs">
              <span className="font-semibold text-foreground">
                Task{selectedCount !== 1 ? 's' : ''} Selected
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {totalOverdueCount > 0 && (
              <button
                type="button"
                onClick={onSelectAllOverdue}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Select Overdue ({totalOverdueCount})
              </button>
            )}

            <button
              type="button"
              onClick={onOpenExtend}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-accent text-white hover:bg-accent/90 transition-all shadow-sm"
            >
              <Clock className="w-3.5 h-3.5" />
              Extend Deadline
            </button>

            <button
              type="button"
              onClick={onClearSelection}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
