import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, X, Sparkles, Compass, Plus, ChevronDown, Check,
  Terminal, Wrench, ShieldCheck, ArrowUpRight, Zap
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { TOOL_CATEGORIES, type ToolItem, type ToolCategory, type ToolItemType } from '@/data/tools';
import { ToolCard } from '@/components/tools/ToolCard';
import { FeaturedToolCard } from '@/components/tools/FeaturedToolCard';
import { ToolPreviewDialog } from '@/components/tools/ToolPreviewDialog';
import { SubmitToolDialog } from '@/components/tools/SubmitToolDialog';
import { ToolEmptyState } from '@/components/tools/ToolEmptyState';
import { getAllPublicTools } from '@/services/tools';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 9;

export default function ToolHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = (searchParams.get('category') as ToolCategory) || 'All';
  const activeType = (searchParams.get('type') as 'all' | 'tool' | 'skill') || 'all';
  const searchQuery = searchParams.get('q') || '';

  const [tools, setTools] = useState<ToolItem[]>([]);
  const [previewTool, setPreviewTool] = useState<ToolItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  useEffect(() => {
    let mounted = true;
    getAllPublicTools().then((data) => {
      if (mounted) {
        setTools(data);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleCategoryChange = (cat: ToolCategory) => {
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleTypeChange = (type: 'all' | 'tool' | 'skill') => {
    if (type === 'all') {
      searchParams.delete('type');
    } else {
      searchParams.set('type', type);
    }
    setSearchParams(searchParams);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleSearchChange = (val: string) => {
    if (!val) {
      searchParams.delete('q');
    } else {
      searchParams.set('q', val);
    }
    setSearchParams(searchParams);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleClearFilters = () => {
    setSearchParams({});
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleOpenPreview = (tool: ToolItem) => {
    setPreviewTool(tool);
    setDialogOpen(true);
  };

  // Filtered tools
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      // Type filter (all, tool, skill)
      if (activeType === 'tool') {
        if (tool.item_type && tool.item_type !== 'tool' && tool.item_type !== 'tool_skill') {
          return false;
        }
      } else if (activeType === 'skill') {
        if (tool.item_type !== 'skill' && tool.item_type !== 'tool_skill') {
          return false;
        }
      }

      // Category filter
      if (activeCategory === 'ZYR0 Native' && tool.source !== 'ZYR0 Native') {
        return false;
      }
      if (
        activeCategory !== 'All' &&
        activeCategory !== 'ZYR0 Native' &&
        tool.category !== activeCategory
      ) {
        return false;
      }

      // Search query filter (matches name, tagline, description, tags, source)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = tool.name.toLowerCase().includes(q);
        const matchesTagline = tool.tagline.toLowerCase().includes(q);
        const matchesDesc = tool.description.toLowerCase().includes(q);
        const matchesTags = tool.tags.some((t) => t.toLowerCase().includes(q));
        const matchesSource = tool.source.toLowerCase().includes(q);
        return matchesName || matchesTagline || matchesDesc || matchesTags || matchesSource;
      }

      return true;
    });
  }, [tools, activeCategory, activeType, searchQuery]);

  // Paginated visible tools (9 initial, Load More adds 9)
  const displayedTools = useMemo(() => {
    return filteredTools.slice(0, visibleCount);
  }, [filteredTools, visibleCount]);

  const hasMore = visibleCount < filteredTools.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  // Featured flagship tools for top showcase (only on default All view with no active search or filter)
  const isDefaultView = activeCategory === 'All' && activeType === 'all' && !searchQuery.trim();
  const featuredTools = useMemo(() => {
    return tools.filter((t) => t.featured);
  }, [tools]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <SEO
        title="ToolHub — Curated AI, Developer & Research Tools"
        description="Discover intelligent tools, developer utilities, and agent workflows curated from ZYR0, GitHub, and Hugging Face."
        path="/tools"
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-20">
        {/* UI/UX Pro Max Open Atmospheric Hero */}
        <div className="relative mb-12">
          {/* Subtle Ambient Radial Lighting (Unboxed & Fluid) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Top Bar: Live Status Pill & Independent Submit CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 backdrop-blur-md shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-sky-400"></span>
              </span>
              <span>ZYR0 Open Tools & Agent Registry</span>
            </div>

            {/* Separated Submit Action Button */}
            <Button
              onClick={() => setSubmitDialogOpen(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all rounded-xl px-4 py-2 text-xs sm:text-sm h-9"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Tool / Skill</span>
            </Button>
          </div>

          {/* Main Title & Editorial Pitch */}
          <div className="text-center max-w-4xl mx-auto space-y-4 mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground font-sans leading-[1.12]">
              Discover & Deploy <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Tools, Utilities & Agent Skills
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Curated autonomous workflows, developer libraries, and AI agent skills from ZYR0, GitHub, and Hugging Face.
            </p>
          </div>

          {/* Centered Command Search Input */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl blur-md opacity-20 group-hover:opacity-35 group-focus-within:opacity-50 transition duration-300 pointer-events-none" />
              <div className="relative flex items-center bg-card border border-border/80 group-focus-within:border-blue-500 rounded-2xl shadow-xl overflow-hidden transition-all p-1.5">
                <Search className="w-5 h-5 ml-3.5 text-muted-foreground group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors shrink-0" />
                <input
                  id="toolhub-search"
                  type="text"
                  placeholder="Search by tool name, Python/Rust, skill protocol, or tag..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-3.5 py-3 bg-transparent text-sm sm:text-base focus:outline-none text-foreground placeholder:text-muted-foreground/60"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange('')}
                    aria-label="Clear search"
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors mr-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-muted-foreground bg-muted rounded-lg border border-border/60 mr-2 shrink-0 select-none">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Value Metric Badges with 'Powerful Tools & Skills' */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span><strong>{tools.length}</strong> Curated Packages</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span><strong>Powerful Tools & Skills</strong></span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Instant 1-Click Copy</span>
              </div>
            </div>
          </div>

          {/* Unified Discovery Toolbar: Segmented Type Filter + Category Pills */}
          <div className="mt-10 pt-6 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Segmented Type Toggle (All vs Tools vs Skills) */}
            <div className="flex items-center gap-1 p-1 bg-muted/60 border border-border/60 rounded-xl shrink-0">
              {[
                { id: 'all', label: 'All Catalog' },
                { id: 'tool', label: 'Tools & Utilities' },
                { id: 'skill', label: 'Agent Skills' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTypeChange(t.id as any)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeType === t.id
                      ? 'bg-card text-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
              {TOOL_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-blue-500/40'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Flagship Spotlight (Only shown on initial view with no filters) */}
        {isDefaultView && featuredTools.length > 0 && (
          <div className="mb-14 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                Featured Flagships
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredTools.map((tool) => (
                <FeaturedToolCard
                  key={tool.id}
                  tool={tool}
                  onPreview={handleOpenPreview}
                />
              ))}
            </div>
          </div>
        )}

        {/* Catalog Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {activeCategory === 'All' ? 'All Curated Directory' : `${activeCategory} Tools`}
            </h2>
            <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted">
              {filteredTools.length}
            </span>
          </div>

          {(activeCategory !== 'All' || activeType !== 'all' || searchQuery) && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Tools Grid / Empty State */}
        {filteredTools.length === 0 ? (
          <ToolEmptyState
            query={searchQuery}
            category={activeCategory}
            onReset={handleClearFilters}
            onOpenSubmit={() => setSubmitDialogOpen(true)}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onPreview={handleOpenPreview}
                />
              ))}
            </div>

            {/* Pagination / Load More UI (9-item batching) */}
            <div className="mt-12 flex flex-col items-center justify-center gap-3">
              <span className="text-xs text-muted-foreground font-mono">
                Showing {Math.min(visibleCount, filteredTools.length)} of {filteredTools.length} tools
              </span>
              {hasMore && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLoadMore}
                  className="gap-2 px-8 rounded-xl font-medium border-border/80 hover:border-accent hover:bg-card"
                >
                  <span>Load More Tools</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              )}
            </div>
          </>
        )}

        {/* Community Submission Spotlight Card */}
        <div className="mt-16 p-8 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Ambient Lighting Orbs */}
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-sky-400/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-violet-400/25 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2.5 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-white/15 text-white border border-white/20 w-fit backdrop-blur-sm shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-200" />
              <span className="font-semibold text-white">Community Submissions</span>
            </div>
            <h4 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans drop-shadow-xs">
              Building or curating an open-source tool or agent skill?
            </h4>
            <p className="text-sm sm:text-base text-slate-100/90 max-w-2xl leading-relaxed">
              ToolHub curates useful utilities for engineers and AI builders. Share your repository or prompt library with the ZYR0 community.
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => setSubmitDialogOpen(true)}
            className="shrink-0 gap-2 bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-xl hover:shadow-2xl transition-all relative z-10 px-6 py-6 text-sm rounded-xl border border-white/40 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 text-slate-900" />
            <span>Submit a Tool</span>
          </Button>
        </div>
      </div>

      {/* Tool Preview Compact Dialog */}
      <ToolPreviewDialog
        tool={previewTool}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {/* Submit Tool Dialog */}
      <SubmitToolDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        onSuccess={() => {
          getAllPublicTools().then(setTools);
        }}
      />
    </div>
  );
}
