import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft, Clock, Calendar, Twitter, Linkedin,
  Link2, Check, BookOpen, ChevronRight, ChevronLeft, Tag
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { getBlogBySlug, getRelatedBlogs, getAdjacentBlogs } from '@/services/blogs';
import type { BlogPost } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BlogReadingProgress } from '@/components/blog/BlogReadingProgress';
import { BlogCodeBlock } from '@/components/blog/BlogCodeBlock';
import { BlogTableOfContents, extractTocFromMarkdown } from '@/components/blog/BlogTableOfContents';
import { BrandCoverFallback } from '@/components/blog/BlogCard';

export default function BlogPostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [adjacentPosts, setAdjacentPosts] = useState<{ prev: BlogPost | null; next: BlogPost | null }>({
    prev: null,
    next: null,
  });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [coverError, setCoverError] = useState(false);

  useEffect(() => {
    async function loadPost() {
      if (!slug) return;
      setLoading(true);
      setNotFound(false);
      setCoverError(false);

      try {
        const data = await getBlogBySlug(slug);
        if (!data) {
          setNotFound(true);
          return;
        }

        setPost(data);

        // Fetch related posts and sequential previous/next posts in parallel
        const [related, adjacent] = await Promise.all([
          getRelatedBlogs(data.category, slug, 3),
          getAdjacentBlogs(data.published_at, slug),
        ]);

        setRelatedPosts(related);
        setAdjacentPosts(adjacent);
      } catch (err) {
        console.error('Failed to load blog:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Extract table of contents items from markdown content
  const postContent = post?.content;
  const tocItems = useMemo(() => {
    if (!postContent) return [];
    return extractTocFromMarkdown(postContent);
  }, [postContent]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Article link copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleShareTwitter = () => {
    if (!post) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`"${post.title}" via @zyroplatform`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    if (!post) return;
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  // Helper to generate heading slug IDs matching TOC
  const generateHeadingId = (children: React.ReactNode): string => {
    const text = String(children || '')
      .replace(/[*_`]/g, '')
      .trim();
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 animate-pulse">
          <div className="h-4 w-28 bg-muted rounded mb-8" />
          <div className="h-12 w-full bg-muted rounded mb-4" />
          <div className="h-6 w-3/4 bg-muted rounded mb-8" />
          <div className="h-72 w-full bg-muted rounded-2xl mb-10" />
          <div className="space-y-4">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-5/6 bg-muted rounded" />
            <div className="h-4 w-4/6 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Graceful 404 state
  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-32 pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
            Dispatch Not Found
          </h1>
          <p className="text-sm text-muted-foreground font-sans mb-6">
            The article you are looking for does not exist or may have been unlisted by the editorial team.
          </p>
          <Button asChild variant="outline">
            <Link to="/blog">Return to Journal</Link>
          </Button>
        </div>
      </div>
    );
  }

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <article className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Sticky top reading progress bar */}
      <BlogReadingProgress />

      <SEO
        title={post.title}
        description={post.excerpt || `Read ${post.title} on ZYR0 Journal.`}
        path={`/blog/${post.slug}`}
        type="article"
        image={post.cover_image || undefined}
        keywords={post.tags?.join(', ')}
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            image: post.cover_image,
            author: {
              '@type': 'Person',
              name: post.author_name,
            },
            publisher: {
              '@type': 'Organization',
              name: 'ZYR0',
              logo: {
                '@type': 'ImageObject',
                url: 'https://zyroo.org/zyro-logo.png',
              },
            },
            datePublished: post.published_at,
            dateModified: post.updated_at,
          },
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-24">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Journal</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="max-w-3xl border-b border-border/70 pb-8 mb-10">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground mb-4">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[11px]">
              {post.category}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {publishedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.read_time_minutes} min read
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground leading-[1.18] tracking-tight mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg sm:text-xl text-muted-foreground font-sans leading-relaxed mb-8">
              {post.excerpt}
            </p>
          )}

          {/* Author & Share Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-border/40">
            <div className="flex items-center gap-3">
              {post.author_avatar ? (
                <img
                  src={post.author_avatar}
                  alt={post.author_name}
                  className="w-10 h-10 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold font-mono">
                  {post.author_name.charAt(0)}
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-foreground">{post.author_name}</div>
                <div className="text-xs text-muted-foreground font-mono">Editorial Team @ ZYR0</div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono mr-1">Share:</span>
              <button
                type="button"
                onClick={handleShareTwitter}
                aria-label="Share on X"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/70 cursor-pointer"
              >
                <Twitter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleShareLinkedIn}
                aria-label="Share on LinkedIn"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/70 cursor-pointer"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                aria-label="Copy article link"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/70 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Link2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Cover Visual */}
        <div className="max-w-3xl mb-12 rounded-2xl overflow-hidden border border-border/80 bg-muted/20">
          {post.cover_image && !coverError ? (
            <img
              src={post.cover_image}
              alt={post.title}
              onError={() => setCoverError(true)}
              className="w-full h-auto max-h-[520px] object-cover"
            />
          ) : (
            <BrandCoverFallback
              title={post.title}
              category={post.category}
              aspect="16/9"
              className="min-h-[280px]"
            />
          )}
        </div>

        {/* Mobile / Tablet Collapsible Table of Contents */}
        {tocItems.length > 0 && (
          <div className="max-w-3xl">
            <BlogTableOfContents items={tocItems} variant="mobile" />
          </div>
        )}

        {/* Reading Layout (Prose Column + Desktop Sticky TOC) */}
        <div className="xl:grid xl:grid-cols-[1fr_240px] xl:gap-12 items-start">
          
          {/* Main Reading Column (~72ch measure max-w-3xl) */}
          <div className="max-w-3xl prose prose-slate dark:prose-invert text-foreground leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => {
                  const id = generateHeadingId(children);
                  return (
                    <h1 id={id} className="scroll-mt-24 text-2xl sm:text-3xl font-heading font-bold text-foreground mt-10 mb-4 pb-2 border-b border-border/50">
                      {children}
                    </h1>
                  );
                },
                h2: ({ children }) => {
                  const id = generateHeadingId(children);
                  return (
                    <h2 id={id} className="scroll-mt-24 text-xl sm:text-2xl font-heading font-bold text-foreground mt-9 mb-3">
                      {children}
                    </h2>
                  );
                },
                h3: ({ children }) => {
                  const id = generateHeadingId(children);
                  return (
                    <h3 id={id} className="scroll-mt-24 text-lg sm:text-xl font-heading font-semibold text-foreground mt-7 mb-2">
                      {children}
                    </h3>
                  );
                },
                p: ({ children }) => (
                  <p className="text-base sm:text-[17px] leading-[1.75] text-foreground/90 font-sans my-4">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-outside pl-6 space-y-1.5 my-5 text-foreground/90 font-sans">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-outside pl-6 space-y-1.5 my-5 text-foreground/90 font-sans">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-base sm:text-[17px] leading-[1.7] text-foreground/90">
                    {children}
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-primary pl-5 italic text-muted-foreground my-6 font-serif text-lg">
                    {children}
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="px-1.5 py-0.5 rounded-md bg-muted font-mono text-xs font-medium text-foreground border border-border/60">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <BlogCodeBlock className={className}>
                      {children}
                    </BlogCodeBlock>
                  );
                },
                table: ({ children }) => (
                  <div className="overflow-x-auto my-6 border border-border/80 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm font-sans">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border-b border-border bg-muted/50 p-3 font-semibold text-foreground">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border-b border-border/40 p-3 text-muted-foreground">
                    {children}
                  </td>
                ),
                img: ({ src, alt }) => (
                  <figure className="my-8 rounded-xl overflow-hidden border border-border/80 bg-muted/10">
                    <img src={src} alt={alt || ''} className="w-full h-auto object-cover" />
                    {alt && (
                      <figcaption className="p-2.5 text-center text-xs text-muted-foreground font-mono border-t border-border/40">
                        {alt}
                      </figcaption>
                    )}
                  </figure>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>

            {/* Tags Section */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-6 border-t border-border/70 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground mr-2">Tags:</span>
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors border border-border/60"
                  >
                    <Tag className="w-3 h-3 text-muted-foreground" />
                    <span>#{tag}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Author Bio Card */}
            <div className="mt-12 p-6 sm:p-7 border border-border/80 rounded-2xl bg-card flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {post.author_avatar ? (
                <img
                  src={post.author_avatar}
                  alt={post.author_name}
                  className="w-14 h-14 rounded-full object-cover border border-border shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold font-mono shrink-0">
                  {post.author_name.charAt(0)}
                </div>
              )}
              <div className="text-center sm:text-left">
                <h4 className="text-base font-heading font-bold text-foreground">
                  {post.author_name}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 font-sans leading-relaxed">
                  Authoring technical dispatches, computational architecture, and system guides across the ZYR0 platform.
                </p>
              </div>
            </div>

            {/* Sequential Previous & Next Post Navigation */}
            {(adjacentPosts.prev || adjacentPosts.next) && (
              <div className="mt-12 pt-8 border-t border-border/70 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {adjacentPosts.prev ? (
                  <Link
                    to={`/blog/${adjacentPosts.prev.slug}`}
                    className="group p-4 border border-border/70 rounded-xl hover:border-foreground/30 transition-all bg-card/60 flex flex-col justify-between"
                  >
                    <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1 mb-1">
                      <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                      Older Dispatch
                    </span>
                    <span className="text-sm font-heading font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {adjacentPosts.prev.title}
                    </span>
                  </Link>
                ) : (
                  <div className="hidden sm:block" />
                )}

                {adjacentPosts.next ? (
                  <Link
                    to={`/blog/${adjacentPosts.next.slug}`}
                    className="group p-4 border border-border/70 rounded-xl hover:border-foreground/30 transition-all bg-card/60 flex flex-col justify-between text-right"
                  >
                    <span className="text-[11px] font-mono text-muted-foreground flex items-center justify-end gap-1 mb-1">
                      Newer Dispatch
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <span className="text-sm font-heading font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {adjacentPosts.next.title}
                    </span>
                  </Link>
                ) : null}
              </div>
            )}
          </div>

          {/* Desktop Floating Table of Contents Sidebar */}
          {tocItems.length > 0 && (
            <BlogTableOfContents items={tocItems} variant="desktop" />
          )}
        </div>

        {/* Related Dispatches Section */}
        {relatedPosts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-border/80">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                  Keep Reading
                </span>
                <h3 className="text-2xl font-heading font-bold text-foreground">
                  Related Dispatches
                </h3>
              </div>
              <Link
                to={`/blog?category=${encodeURIComponent(post.category)}`}
                className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <span>All {post.category}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.slug}`}
                  className="group block p-5 border border-border/70 rounded-xl bg-card hover:border-foreground/40 transition-all duration-200 shadow-xs hover:shadow-md"
                >
                  <span className="text-[10px] font-mono uppercase text-primary font-semibold block mb-2">
                    {related.category}
                  </span>
                  <h4 className="text-sm font-heading font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {related.title}
                  </h4>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{related.read_time_minutes} min read</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </article>
  );
}
