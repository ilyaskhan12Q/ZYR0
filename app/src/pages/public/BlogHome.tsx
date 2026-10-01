import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, BookOpen, Tag, X, Sparkles, ArrowRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { getPublishedBlogs, getFeaturedBlog } from '@/services/blogs';
import type { BlogPost } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { BlogCard, BlogHeroCard } from '@/components/blog/BlogCard';
import { toast } from 'sonner';

const CATEGORIES = ['All', 'Engineering', 'AI & Research', 'Product Updates', 'Guides'];
const PAGE_SIZE = 9;

export default function BlogHome() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';
  const activeTag = searchParams.get('tag') || '';

  // Local search query input + debounced query state
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Newsletter email state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Debounce search query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Initial load or filter change
  useEffect(() => {
    let isCancelled = false;

    async function loadInitialData() {
      setLoading(true);
      try {
        const isRootAll = activeCategory === 'All' && !activeTag && !debouncedSearch;

        // Fetch featured post only on root / All view
        const featuredPromise = isRootAll ? getFeaturedBlog() : Promise.resolve(null);
        const postsPromise = getPublishedBlogs({
          category: activeCategory,
          tag: activeTag || undefined,
          search: debouncedSearch || undefined,
          limit: PAGE_SIZE,
          offset: 0,
        });

        const [featured, res] = await Promise.all([featuredPromise, postsPromise]);

        if (isCancelled) return;

        setFeaturedPost(featured);

        // Filter out featured post from regular grid if it appears in root view
        const filtered = isRootAll && featured
          ? res.posts.filter((p) => p.id !== featured.id)
          : res.posts;

        setPosts(filtered);
        setTotalCount(res.count);
      } catch (err) {
        if (!isCancelled) {
          console.error('Error loading blog posts:', err);
          toast.error('Could not load dispatches. Please refresh.');
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadInitialData();

    return () => {
      isCancelled = true;
    };
  }, [activeCategory, activeTag, debouncedSearch]);

  // Load more posts (pagination)
  const handleLoadMore = async () => {
    if (loadingMore || posts.length >= totalCount) return;
    setLoadingMore(true);

    try {
      const nextOffset = posts.length + (featuredPost ? 1 : 0);
      const res = await getPublishedBlogs({
        category: activeCategory,
        tag: activeTag || undefined,
        search: debouncedSearch || undefined,
        limit: PAGE_SIZE,
        offset: nextOffset,
      });

      const nextPosts = featuredPost
        ? res.posts.filter((p) => p.id !== featuredPost.id)
        : res.posts;

      setPosts((prev) => [...prev, ...nextPosts]);
    } catch (err) {
      console.error('Failed to load more posts:', err);
      toast.error('Failed to load older dispatches.');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCategoryClick = (cat: string) => {
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleClearTag = () => {
    searchParams.delete('tag');
    setSearchParams(searchParams);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setDebouncedSearch('');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSubscribed(true);
    toast.success('Thank you for subscribing to ZYR0 Dispatches.');
    setNewsletterEmail('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <SEO
        title="Journal & Technical Dispatches"
        description="Architectural deep dives, research notes, and engineering insights from the ZYR0 team."
        path="/blog"
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-24">

        {/* Header Section — Editorial Swiss Modernism 2.0 */}
        <div className="border-b border-border/70 pb-10 mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono uppercase tracking-wider bg-muted text-muted-foreground mb-4">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span>ZYR0 Journal</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-foreground">
                Ideas, Systems & Research.
              </h1>
              <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl font-sans leading-relaxed">
                Technical dispatches, computational architecture, and engineering breakthroughs from the ZYR0 ecosystem.
              </p>
            </div>

            {/* Debounced Search Input */}
            <div className="w-full md:w-80 relative">
              <label htmlFor="blog-search-input" className="sr-only">
                Search articles
              </label>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                id="blog-search-input"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search articles, keywords..."
                className="w-full pl-10 pr-9 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 rounded-xl text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search query"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs & Active Filter Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-border/40">
            <nav className="flex flex-wrap items-center gap-2" aria-label="Article categories">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-full transition-all border cursor-pointer ${
                      isActive
                        ? 'bg-foreground text-background border-foreground font-semibold shadow-xs'
                        : 'bg-background text-muted-foreground border-border/70 hover:text-foreground hover:border-foreground/40'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </nav>

            {activeTag && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-xs text-foreground font-mono border border-border">
                <Tag className="w-3 h-3 text-muted-foreground" />
                <span>Tag: #{activeTag}</span>
                <button
                  onClick={handleClearTag}
                  aria-label={`Clear tag filter ${activeTag}`}
                  className="ml-1 text-muted-foreground hover:text-foreground font-bold cursor-pointer"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            <div className="col-span-full h-80 bg-muted/40 rounded-2xl border border-border/60" />
            <div className="h-72 bg-muted/30 rounded-xl border border-border/60" />
            <div className="h-72 bg-muted/30 rounded-xl border border-border/60" />
            <div className="h-72 bg-muted/30 rounded-xl border border-border/60" />
          </div>
        )}

        {/* Content Section */}
        {!loading && (
          <>
            {/* FEATURED HERO POST */}
            {featuredPost && (
              <div className="mb-12">
                <BlogHeroCard post={featuredPost} />
              </div>
            )}

            {/* ARTICLE GRID */}
            {posts.length > 0 ? (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Load More Button & Count Indicator */}
                <div className="flex flex-col items-center justify-center pt-8 border-t border-border/50 gap-3">
                  <div className="text-xs font-mono text-muted-foreground">
                    Showing {posts.length + (featuredPost ? 1 : 0)} of {totalCount} dispatches
                  </div>

                  {posts.length + (featuredPost ? 1 : 0) < totalCount && (
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-6 py-2.5 text-xs font-mono tracking-wider uppercase border-border/80 hover:bg-muted"
                    >
                      {loadingMore ? 'Loading Dispatches...' : 'Load More Dispatches'}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-20 border border-dashed border-border/80 rounded-2xl bg-muted/10">
                <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  No dispatches found
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto font-sans">
                  We could not find any articles matching your selected category or search keyword.
                </p>
                {(activeCategory !== 'All' || activeTag || searchInput) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-5 text-xs"
                    onClick={() => {
                      setSearchInput('');
                      setDebouncedSearch('');
                      searchParams.delete('category');
                      searchParams.delete('tag');
                      setSearchParams(searchParams);
                    }}
                  >
                    Reset All Filters
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/* Minimalist Editorial Newsletter Box */}
        <div className="mt-20 border border-border/80 rounded-2xl p-8 sm:p-12 bg-muted/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Stay Informed
            </span>
            <h3 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mt-1">
              Subscribe to ZYR0 Dispatches.
            </h3>
            <p className="text-sm text-muted-foreground mt-2 font-sans leading-relaxed">
              Curated architectural insights, research breakthroughs, and ecosystem updates delivered directly to your inbox. No noise.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
            <label htmlFor="newsletter-email" className="sr-only">
              Work email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your work email"
              className="w-full sm:w-72 px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold rounded-xl"
            >
              {subscribed ? 'Subscribed!' : 'Subscribe'}
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}
