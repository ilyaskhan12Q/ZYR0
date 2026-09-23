import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Clock, ArrowRight, BookOpen, Calendar, ChevronRight, Share2, Tag } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { getPublishedBlogs, getFeaturedBlog } from '@/services/blogs';
import type { BlogPost } from '@/lib/database.types';
import { Button } from '@/components/ui/button';

const CATEGORIES = ['All', 'Engineering', 'AI & Research', 'Product Updates', 'Guides'];

export default function BlogHome() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';
  const activeTag = searchParams.get('tag') || '';
  const [searchQuery, setSearchQuery] = useState('');
  
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Load featured post only on initial root/all view
        if (activeCategory === 'All' && !activeTag && !searchQuery) {
          const featured = await getFeaturedBlog();
          setFeaturedPost(featured);
        } else {
          setFeaturedPost(null);
        }

        const res = await getPublishedBlogs({
          category: activeCategory,
          tag: activeTag || undefined,
          search: searchQuery || undefined,
        });

        // Filter out featured post from regular grid if present on All view
        const filtered = activeCategory === 'All' && !activeTag && !searchQuery
          ? res.posts.filter((p) => !p.is_featured)
          : res.posts;

        setPosts(filtered);
        setTotalCount(res.count);
      } catch (err) {
        console.error('Error loading blog posts:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [activeCategory, activeTag, searchQuery]);

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

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <SEO
        title="Journal & Engineering Blog"
        description="Deep dives into AI engineering, autonomous workflows, ecosystem updates, and technical insights from the ZYR0 team."
        path="/blog"
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-24">
        
        {/* Header Title Section - Clean Editorial Steady Layout */}
        <div className="border-b border-border/60 pb-10 mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono uppercase tracking-wider bg-muted text-muted-foreground mb-4">
                <BookOpen className="w-3.5 h-3.5" />
                <span>ZYR0 Journal</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-foreground">
                Ideas, Systems & Research.
              </h1>
              <p className="mt-3 text-lg text-muted-foreground max-w-2xl font-sans">
                Technical dispatches, research notes, and architectural patterns behind ZYR0.
              </p>
            </div>

            {/* Live Search Input */}
            <div className="w-full md:w-80 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, topics..."
                className="w-full pl-10 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 rounded-lg text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Category Tabs & Active Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-border/40">
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all border ${
                      isActive
                        ? 'bg-foreground text-background border-foreground font-semibold shadow-sm'
                        : 'bg-background text-muted-foreground border-border/60 hover:text-foreground hover:border-foreground/40'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {activeTag && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-muted text-xs text-foreground font-mono">
                <Tag className="w-3 h-3 text-muted-foreground" />
                <span>Tag: {activeTag}</span>
                <button
                  onClick={handleClearTag}
                  className="ml-1 text-muted-foreground hover:text-foreground font-bold"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
            <div className="col-span-full h-80 bg-muted/40 rounded-xl border border-border/60" />
            <div className="h-72 bg-muted/40 rounded-xl border border-border/60" />
            <div className="h-72 bg-muted/40 rounded-xl border border-border/60" />
            <div className="h-72 bg-muted/40 rounded-xl border border-border/60" />
          </div>
        )}

        {!loading && (
          <>
            {/* FEATURED HERO POST (Option 1 Top Editorial Hero) */}
            {featuredPost && (
              <div className="mb-14">
                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="group block border border-border/70 rounded-2xl overflow-hidden bg-card hover:border-foreground/40 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    {/* Cover image or graphic */}
                    <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[420px] bg-muted/30 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-border/60">
                      {featuredPost.cover_image ? (
                        <img
                          src={featuredPost.cover_image}
                          alt={featuredPost.title}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      ) : (
                        <div className="p-8 text-center">
                          <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-3" />
                          <span className="text-xs font-mono uppercase text-muted-foreground tracking-wider">
                            Featured Editorial
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Column */}
                    <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground mb-4">
                          <span className="px-2.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                            {featuredPost.category}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {featuredPost.read_time_minutes} min read
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground group-hover:text-primary transition-colors leading-tight mb-4">
                          {featuredPost.title}
                        </h2>

                        <p className="text-sm sm:text-base text-muted-foreground line-clamp-4 leading-relaxed font-sans">
                          {featuredPost.excerpt}
                        </p>
                      </div>

                      <div className="pt-8 mt-6 border-t border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {featuredPost.author_avatar ? (
                            <img
                              src={featuredPost.author_avatar}
                              alt={featuredPost.author_name}
                              className="w-9 h-9 rounded-full object-cover border border-border"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold font-mono">
                              {featuredPost.author_name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-medium text-foreground">
                              {featuredPost.author_name}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {featuredPost.published_at ? new Date(featuredPost.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                            </div>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground group-hover:translate-x-1 transition-transform">
                          Read Article <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* ARTICLE GRID (Option 1 Steady 3-Column Cards) */}
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group flex flex-col justify-between border border-border/70 rounded-xl bg-card hover:border-foreground/40 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md"
                  >
                    <div>
                      {/* Thumbnail Container */}
                      <div className="relative aspect-[16/9] w-full bg-muted/30 overflow-hidden border-b border-border/60">
                        {post.cover_image ? (
                          <img
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted/20">
                            <BookOpen className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                        )}
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-background/90 backdrop-blur-sm border border-border text-foreground shadow-xs">
                          {post.category}
                        </span>
                      </div>

                      {/* Card Content */}
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Draft'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.read_time_minutes} min read
                          </span>
                        </div>

                        <h3 className="text-lg font-serif font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">
                          {post.title}
                        </h3>

                        {post.excerpt && (
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed font-sans">
                            {post.excerpt}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Author & Footer */}
                    <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-border/30 mt-4">
                      <div className="flex items-center gap-2">
                        {post.author_avatar ? (
                          <img
                            src={post.author_avatar}
                            alt={post.author_name}
                            className="w-6 h-6 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono font-bold">
                            {post.author_name.charAt(0)}
                          </div>
                        )}
                        <span className="text-xs text-foreground/80 font-medium">
                          {post.author_name}
                        </span>
                      </div>

                      <div className="text-xs font-medium text-foreground group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Read <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-border rounded-xl">
                <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="text-lg font-serif font-semibold text-foreground">No posts found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  No articles matched your selected category or search filter.
                </p>
                {(activeCategory !== 'All' || activeTag || searchQuery) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      searchParams.delete('category');
                      searchParams.delete('tag');
                      setSearchParams(searchParams);
                    }}
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/* Minimalist Monochrome Newsletter Box */}
        <div className="mt-20 border border-border/80 rounded-2xl p-8 sm:p-12 bg-muted/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Stay Informed</span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mt-1">
              Subscribe to ZYR0 Dispatches.
            </h3>
            <p className="text-sm text-muted-foreground mt-2 font-sans">
              Curated architectural insights, research breakthroughs, and product updates delivered straight to your inbox. No spam.
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
            <input
              type="email"
              placeholder="Enter your work email"
              className="w-full sm:w-72 px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
            <Button className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold rounded-lg">
              Subscribe
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
