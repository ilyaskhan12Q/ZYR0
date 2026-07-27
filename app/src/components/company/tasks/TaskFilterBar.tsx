import { Search, X, LayoutGrid, List, RotateCcw, Filter } from 'lucide-react';

interface TaskFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedInternshipId: string;
  onInternshipChange: (id: string) => void;
  selectedPriority: string;
  onPriorityChange: (priority: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: 'grid' | 'table' | 'cards';
  setViewMode: (mode: 'grid' | 'table') => void;
  internships: any[];
  taskCounts: Record<string, number>;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

const statusTabs = ['All', 'Pending', 'Submitted', 'Approved', 'Rejected', 'Overdue'];

export function TaskFilterBar({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  selectedInternshipId,
  onInternshipChange,
  selectedPriority,
  onPriorityChange,
  sortBy,
  onSortChange,
  viewMode,
  setViewMode,
  internships,
  taskCounts,
  onResetFilters,
  hasActiveFilters,
}: TaskFilterBarProps) {
  return (
    <div className="space-y-3 bg-card border border-border p-4 rounded-2xl shadow-sm">
      {/* Search & Main Controls Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by task title, intern name, or instructions..."
            className="w-full pl-9 pr-9 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdowns & View Toggle */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Internship Filter */}
          <select
            value={selectedInternshipId}
            onChange={(e) => onInternshipChange(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
          >
            <option value="">All Projects</option>
            {internships.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
          >
            <option value="dueDate">Sort: Due Date</option>
            <option value="createdNewest">Sort: Newest First</option>
            <option value="createdOldest">Sort: Oldest First</option>
            <option value="priority">Sort: Priority</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-muted p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Grid Cards View"
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'grid' || viewMode === 'cards'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Structured Table View"
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Tabs & Active Filters Reset */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {statusTabs.map((tab) => {
            const count = taskCounts[tab] || 0;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-accent text-white shadow-sm font-semibold'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-background text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
