import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty';

interface ToolEmptyStateProps {
  query?: string;
  category?: string;
  onReset: () => void;
  onOpenSubmit?: () => void;
}

export function ToolEmptyState({ query, category, onReset, onOpenSubmit }: ToolEmptyStateProps) {
  const isFiltered = Boolean(query || (category && category !== 'All'));

  return (
    <Empty className="py-16 border border-dashed border-border rounded-2xl bg-card/40 my-6 max-w-xl mx-auto">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX className="w-5 h-5 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>{isFiltered ? 'No matching tools' : 'Directory is ready for submissions'}</EmptyTitle>
        <EmptyDescription>
          {query ? (
            <>
              No tools matching &ldquo;<span className="font-medium text-foreground">{query}</span>&rdquo;
              {category && category !== 'All' ? ` in ${category}` : ''}. Try broadening your search or reset filters.
            </>
          ) : category && category !== 'All' ? (
            <>No approved tools currently listed in &ldquo;{category}&rdquo;.</>
          ) : (
            <>Be the first to submit an open-source tool, library, or AI agent skill to the ZYR0 registry!</>
          )}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex items-center gap-3">
        {isFiltered && (
          <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </Button>
        )}
        {onOpenSubmit && (
          <Button size="sm" onClick={onOpenSubmit} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <span>Submit a Tool</span>
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
