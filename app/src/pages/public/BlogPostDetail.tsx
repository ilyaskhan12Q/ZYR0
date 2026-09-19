import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, Calendar, Share2, Twitter, Linkedin,
  Link2, Check, BookOpen, ChevronRight, Sparkles, Tag
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { getBlogBySlug, getRelatedBlogs } from '@/services/blogs';
import type { BlogPost } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function BlogPostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPost() {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await getBlogBySlug(slug);
        if (!data) {
          navigate('/blog', { replace: true });
          return;
        }
        setPost(data);

        // Fetch related posts
        const related = await getRelatedBlogs(data.category, slug, 3);
        setRelatedPosts(related);
      } catch (err) {
        console.error('Failed to load blog:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, navigate]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Article link copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 animate-pulse">
          <div className="h-4 w-24 bg-muted rounded mb-8" />
          <div className="h-12 w-full bg-muted rounded mb-4" />
          <div className="h-6 w-3/4 bg-muted rounded mb-8" />
          <div className="h-72 w-full bg-muted rounded-xl mb-10" />
          <div className="space-y-4">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-5/6 bg-muted rounded" />
            <div className="h-4 w-4/6 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <article className="min-h-screen bg-background text-foreground transition-colors duration-200">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-24">
        
        {/* Navigation Back */}
        <div className="mb-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Journal
          </Link>
        </div>

        {/* Article Header Metadata */}
        <header className="border-b border-border/60 pb-8 mb-10">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground mb-4">
            <span className="px-2.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
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

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground leading-[1.15] tracking-tight mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg sm:text-xl text-muted-foreground font-sans leading-relaxed mb-8">
              {post.excerpt}
            </p>
          )}

          {/* Author + Social Share Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-border/40">
            <div className="flex items-center gap-3">
              {post.author_avatar ? (
                <img
                  src={post.author_avatar}
                  alt={post.author_name}
                  className="w-10 h-10 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold font-mono">
                  {post.author_name.charAt(0)}
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-foreground">{post.author_name}</div>
                <div className="text-xs text-muted-foreground">Contributor @ ZYR0</div>
              </div>
            </div>

            {/* Clean Share Bar */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono mr-1">Share:</span>
              <button
                onClick={handleShareTwitter}
                aria-label="Share on X"
                className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/60"
              >
                <Twitter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleShareLinkedIn}
                aria-label="Share on LinkedIn"
                className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/60"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCopyLink}
                aria-label="Copy article link"
                className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/60"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Link2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="mb-12 rounded-xl overflow-hidden border border-border/70 bg-muted/20">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Markdown Content Section - Clean Typography */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-foreground leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mt-10 mb-4 pb-2 border-b border-border/40">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mt-8 mb-3">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg sm:text-xl font-serif font-semibold text-foreground mt-6 mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-base leading-relaxed text-foreground/90 font-sans my-4">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 my-4 text-foreground/90">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1 my-4 text-foreground/90">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-base text-foreground/90 leading-relaxed">
                  {children}
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-foreground/80 pl-4 italic text-muted-foreground my-6 font-serif">
                  {children}
                </blockquote>
              ),
              code: ({ children, className }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs font-medium text-foreground">
                      {children}
                    </code>
                  );
                }
                return (
                  <pre className="p-4 rounded-lg bg-muted/70 border border-border/80 overflow-x-auto text-xs font-mono my-6">
                    <code>{children}</code>
                  </pre>
                );
              },
              table: ({ children }) => (
                <div className="overflow-x-auto my-6 border border-border rounded-lg">
                  <table className="w-full text-left border-collapse text-sm">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border-b border-border bg-muted/40 p-3 font-semibold text-foreground">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border-b border-border/40 p-3 text-muted-foreground">
                  {children}
                </td>
              ),
              img: ({ src, alt }) => (
                <div className="my-8 rounded-lg overflow-hidden border border-border">
                  <img src={src} alt={alt || ''} className="w-full h-auto object-cover" />
                  {alt && <p className="text-center text-xs text-muted-foreground mt-2 font-mono">{alt}</p>}
                </div>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Future AdSense / Promotion Container Slot */}
        <div className="my-14 p-6 border border-dashed border-border/80 rounded-xl bg-muted/10 text-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 block mb-1">
            Sponsor / Advertisement Slot
          </span>
          <p className="text-xs text-muted-foreground font-sans">
            Clean, unobtrusive placement reserved for relevant technical dispatches or AdSense auto units.
          </p>
        </div>

        {/* Tags Row */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-border/60 flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground mr-2">Tags:</span>
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/blog?tag=${encodeURIComponent(tag)}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors border border-border/40"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Author Bio Card */}
        <div className="mt-12 p-6 border border-border/80 rounded-xl bg-card flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {post.author_avatar ? (
            <img
              src={post.author_avatar}
              alt={post.author_name}
              className="w-14 h-14 rounded-full object-cover border border-border shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-bold font-mono shrink-0">
              {post.author_name.charAt(0)}
            </div>
          )}
          <div className="text-center sm:text-left">
            <h4 className="text-base font-serif font-bold text-foreground">{post.author_name}</h4>
            <p className="text-xs text-muted-foreground mt-1 font-sans leading-relaxed">
              Writing on architecture, computational systems, and developer tooling across the ZYR0 ecosystem.
            </p>
          </div>
        </div>

        {/* Related Posts Row */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border/80">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-serif font-bold text-foreground">
                Related Dispatches
              </h3>
              <Link
                to={`/blog?category=${encodeURIComponent(post.category)}`}
                className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                More in {post.category} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.slug}`}
                  className="group block p-4 border border-border/70 rounded-xl bg-card hover:border-foreground/40 transition-all"
                >
                  <span className="text-[10px] font-mono uppercase text-muted-foreground block mb-2">
                    {related.category}
                  </span>
                  <h4 className="text-sm font-serif font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {related.title}
                  </h4>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                    <Clock className="w-3 h-3" /> {related.read_time_minutes} min read
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
