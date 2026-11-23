import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, X, Sparkles, Plus, ChevronDown,
  ArrowUpDown, Filter
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { TOOL_CATEGORIES, TOOL_SUBCATEGORIES, type ToolItem, type ToolCategory, type ToolSubcategory } from '@/data/tools';
import { ToolCard } from '@/components/tools/ToolCard';
import { SubmitToolDialog } from '@/components/tools/SubmitToolDialog';
import { ToolEmptyState } from '@/components/tools/ToolEmptyState';
import { getAllPublicTools } from '@/services/tools';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ITEMS_PER_PAGE = 9;

type SortOption = 'featured' | 'newest' | 'az' | 'popular';

export default function ToolHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = (searchParams.get('category') as ToolCategory) || 'All';
  const activeSubcategory = (searchParams.get('subcategory') as ToolSubcategory | 'All') || 'All';
  const activeType = (searchParams.get('type') as 'all' | 'tool' | 'skill') || 'all';
  const searchQuery = searchParams.get('q') || '';
  const sortBy = (searchParams.get('sort') as SortOption) || 'featured';

  const [tools, setTools] = useState<ToolItem[]>([]);
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

  // Deep-link: /tools?submit=1 opens the submit dialog (e.g. from "Publish a Skill")
  useEffect(() => {
    if (searchParams.get('submit') === '1') {
      setSubmitDialogOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('submit');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleCategoryChange = (cat: ToolCategory) => {
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleSubcategoryChange = (subcat: ToolSubcategory | 'All') => {
    if (subcat === 'All') {
      searchParams.delete('subcategory');
    } else {
      searchParams.set('subcategory', subcat);
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

  const handleSortChange = (sort: SortOption) => {
    if (sort === 'featured') {
      searchParams.delete('sort');
    } else {
      searchParams.set('sort', sort);
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

  // Filtered & sorted tools
  const filteredTools = useMemo(() => {
    const list = tools.filter((tool) => {
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

      // Subcategory filter (discipline / use case)
      if (activeSubcategory !== 'All' && tool.subcategory !== activeSubcategory) {
        return false;
      }

      // Search query filter (matches name, tagline, description, tags, source, author, capabilities)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = tool.name.toLowerCase().includes(q);
        const matchesTagline = tool.tagline.toLowerCase().includes(q);
        const matchesDesc = tool.description.toLowerCase().includes(q);
        const matchesTags = tool.tags.some((t) => t.toLowerCase().includes(q));
        const matchesSource = tool.source.toLowerCase().includes(q);
        const matchesAuthor = (tool.author?.name || '').toLowerCase().includes(q);
        const matchesCaps = (tool.capabilities || []).some((c) => c.toLowerCase().includes(q));
        return matchesName || matchesTagline || matchesDesc || matchesTags || matchesSource || matchesAuthor || matchesCaps;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'featured') {
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
      if (sortBy === 'newest') {
        return b.id.localeCompare(a.id);
      }
      if (sortBy === 'az') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'popular') {
        const popA = (a.badge === 'Popular' || a.badge === 'Trending' || a.badge === 'Official') ? 1 : 0;
        const popB = (b.badge === 'Popular' || b.badge === 'Trending' || b.badge === 'Official') ? 1 : 0;
        return popB - popA;
      }
      return 0;
    });
  }, [tools, activeCategory, activeSubcategory, activeType, searchQuery, sortBy]);

  // Paginated visible tools (9 initial, Load More adds 9)
  const displayedTools = useMemo(() => {
    return filteredTools.slice(0, visibleCount);
  }, [filteredTools, visibleCount]);

  const hasMore = visibleCount < filteredTools.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  // Featured flagship tools for top showcase (only on default All view with no active search or filter)
  const isDefaultView = activeCategory === 'All' && activeSubcategory === 'All' && activeType === 'all' && !searchQuery.trim() && sortBy === 'featured';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-14 pb-20">
        {/* UI/UX Pro Max Open Atmospheric Hero */}
        <div className="relative mb-12">
          {/* Subtle Ambient Radial Lighting (Unboxed & Fluid) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-gradient-to-b from-[var(--zyro-accent)]/15 via-[var(--zyro-accent)]/8 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Top Bar: Independent Submit CTA */}
          <div className="flex items-center justify-end gap-4 mb-6">
            {/* Separated Submit Action Button */}
            <Button
              onClick={() => setSubmitDialogOpen(true)}
              className="gap-2 bg-[var(--zyro-accent)] hover:bg-[var(--zyro-sapphire)] text-white font-medium shadow-md hover:shadow-lg transition-all rounded-xl px-4 py-2 text-xs sm:text-sm h-9"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Tool / Skill</span>
            </Button>
          </div>

          {/* Main Title & Editorial Pitch */}
          <div className="text-center max-w-4xl mx-auto space-y-4 mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground font-sans leading-[1.14]">
              Find the right tools for your{' '}
              <span className="bg-gradient-to-r from-[var(--zyro-hyacinth)] via-[var(--zyro-accent)] to-[var(--zyro-sapphire)] bg-clip-text text-transparent">
                next Project
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover and explore AI tools, developer utilities, frameworks and skills to help you build faster and better.
            </p>
          </div>

          {/* Centered Command Search Input */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="relative flex items-center bg-card border border-border/80 group-focus-within:border-[var(--zyro-accent)] rounded-full shadow-xl overflow-hidden transition-all p-1.5">
                <Search className="w-5 h-5 ml-3.5 text-foreground/80 group-focus-within:text-[var(--zyro-accent)] transition-colors shrink-0" />
                <input
                  id="toolhub-search"
                  type="text"
                  placeholder="Search tools, skills, frameworks, tags..."
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
          </div>

          {/* Discovery Toolbar: Type Toggle (Left) + Category & Sort Dropdowns (Right) */}
          <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Segmented Type Toggle (All vs Tools vs Skills) */}
            <div className="flex items-center gap-1 p-1 bg-muted/60 border border-border/60 rounded-full shrink-0 self-start md:self-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'tool', label: 'Tools' },
                { id: 'skill', label: 'Skills' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTypeChange(t.id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeType === t.id
                      ? 'bg-[var(--zyro-accent)] text-white shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Right Controls: Category Dropdown & Sort Selector */}
            <div className="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-auto">
              {/* Category Dropdown */}
              <div className="flex items-center gap-2">
                
                <Select value={activeCategory} onValueChange={(val: any) => handleCategoryChange(val)}>
                  <SelectTrigger className="h-8 text-xs bg-card border-border/70 rounded-full px-2.5 gap-2 min-w-[145px]">
                    <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent align="end" className="text-xs">
                    {TOOL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'All' ? 'All Categories' : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory Dropdown */}
              <div className="flex items-center gap-2">
                
                <Select value={activeSubcategory} onValueChange={(val: any) => handleSubcategoryChange(val)}>
                  <SelectTrigger className="h-8 text-xs bg-card border-border/70 rounded-full px-2.5 gap-2 min-w-[160px]">
                    <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Subcategory" />
                  </SelectTrigger>
                  <SelectContent align="end" className="text-xs">
                    <SelectItem value="All">All Subcategories</SelectItem>
                    {TOOL_SUBCATEGORIES.map((subcat) => (
                      <SelectItem key={subcat} value={subcat}>
                        {subcat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                
                <Select value={sortBy} onValueChange={(val: any) => handleSortChange(val)}>
                  <SelectTrigger className="h-8 text-xs bg-card border-border/70 rounded-full px-2.5 gap-2 min-w-[140px]">
                    <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent align="end" className="text-xs">
                    <SelectItem value="featured">Featured First</SelectItem>
                    <SelectItem value="newest">Newest Added</SelectItem>
                    <SelectItem value="az">Alphabetical (A-Z)</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Flagship Spotlight (Only shown on initial view with no filters) */}
        {isDefaultView && featuredTools.length > 0 && (
          <div className="mb-14 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Featured
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border border-border/60 bg-muted/20">
              {featuredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        )}

        {/* Catalog Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {activeCategory === 'All' ? 'All Curated Directory' : `${activeCategory} Tools`}
              {activeSubcategory !== 'All' && <span className="text-muted-foreground"> / {activeSubcategory}</span>}
            </h2>
            <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted">
              {filteredTools.length}
            </span>
          </div>

          {(activeCategory !== 'All' || activeSubcategory !== 'All' || activeType !== 'all' || searchQuery || sortBy !== 'featured') && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border border-border/60 bg-muted/20">
              {displayedTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
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
        <div className="mt-16 p-8 rounded-2xl border border-[var(--zyro-accent)]/30 bg-gradient-to-r from-[var(--zyro-twilight)] via-[var(--zyro-accent)] to-[var(--zyro-sapphire)] text-white shadow-2xl shadow-[var(--zyro-twilight)]/20 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Ambient Lighting Orbs */}
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-[var(--zyro-hyacinth)]/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2.5 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-white/15 text-white border border-white/20 w-fit backdrop-blur-sm shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-white/90" />
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
