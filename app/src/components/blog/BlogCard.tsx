import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, ChevronRight, ArrowRight, BookOpen } from 'lucide-react';
import type { BlogPost } from '@/lib/database.types';

export function BrandCoverFallback({
  aspect = '16/9',
  className = '',
}: {
  title?: string;
  category?: string;
  aspect?: '16/9' | 'auto';
  className?: string;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-br from-[#120159] via-[#0051C3] to-[#7B7BDC] p-6 flex items-center justify-center select-none ${
        aspect === '16/9' ? 'aspect-[16/9]' : ''
      } ${className}`}
    >
      {/* Subtle geometric grid overlay */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Atmospheric radial glow spheres */}
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#120159]/40 rounded-full blur-xl pointer-events-none" />

      {/* Abstract architectural brand watermark */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
          <BookOpen className="w-5 h-5 text-white/90" />
        </div>
        <div className="mt-2.5 font-mono text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-white/70 font-semibold">
          ZYR0 // JOURNAL
        </div>
      </div>

      {/* Discrete bottom corner coordinate watermark */}
      <div className="absolute bottom-2.5 right-3 font-mono text-[9px] text-white/30 tracking-wider pointer-events-none">
        SYS.01
      </div>
    </div>
  );
}

export function BlogHeroCard({ post }: { post: BlogPost }) {
  const [imageError, setImageError] = useState(false);
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block border border-border/80 rounded-2xl overflow-hidden bg-card hover:border-foreground/30 transition-all duration-300 shadow-sm hover:shadow-md"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Cover Column */}
        <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[340px] lg:min-h-[400px] bg-muted/30 overflow-hidden border-b lg:border-b-0 lg:border-r border-border/70">
          {post.cover_image && !imageError ? (
            <img
              src={post.cover_image}
              alt={post.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          ) : (
            <BrandCoverFallback
              title={post.title}
              category={post.category}
              aspect="auto"
              className="h-full min-h-[260px]"
            />
          )}
        </div>

        {/* Content Column */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-mono text-muted-foreground mb-4">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[11px]">
                {post.category}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.read_time_minutes} min read
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground group-hover:text-primary transition-colors leading-[1.2] mb-3">
              {post.title}
            </h2>

            {post.excerpt && (
              <p className="text-sm sm:text-base text-muted-foreground line-clamp-3 sm:line-clamp-4 leading-relaxed font-sans">
                {post.excerpt}
              </p>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {post.author_avatar ? (
                <img
                  src={post.author_avatar}
                  alt={post.author_name}
                  className="w-9 h-9 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">
                  {post.author_name.charAt(0)}
                </div>
              )}
              <div>
                <div className="text-xs font-semibold text-foreground">
                  {post.author_name}
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  {formattedDate}
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground group-hover:translate-x-1 transition-transform">
              <span>Read Article</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function BlogCard({ post }: { post: BlogPost }) {
  const [imageError, setImageError] = useState(false);
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Draft';

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col justify-between border border-border/80 rounded-xl bg-card hover:border-foreground/30 transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md"
    >
      <div>
        {/* Cover Aspect Ratio 16/9 */}
        <div className="relative aspect-[16/9] w-full bg-muted/20 overflow-hidden border-b border-border/70">
          {post.cover_image && !imageError ? (
            <img
              src={post.cover_image}
              alt={post.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <BrandCoverFallback
              title={post.title}
              category={post.category}
              aspect="16/9"
            />
          )}

          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-background/90 backdrop-blur-md border border-border/80 text-foreground shadow-xs">
            {post.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-2.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.read_time_minutes} min read
            </span>
          </div>

          <h3 className="text-lg font-heading font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed font-sans">
              {post.excerpt}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 sm:px-6 pb-5 pt-2 flex items-center justify-between border-t border-border/40 mt-2">
        <div className="flex items-center gap-2">
          {post.author_avatar ? (
            <img
              src={post.author_avatar}
              alt={post.author_name}
              className="w-6 h-6 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-mono font-bold">
              {post.author_name.charAt(0)}
            </div>
          )}
          <span className="text-xs text-foreground/80 font-medium truncate max-w-[130px]">
            {post.author_name}
          </span>
        </div>

        <div className="text-xs font-medium text-foreground group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
          <span>Read</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
