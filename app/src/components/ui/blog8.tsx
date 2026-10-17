import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { coverGradient } from '@/data/tools';

interface Post {
  id: string;
  title: string;
  summary: string;
  label: string;
  author: string;
  published: string;
  url: string;
  image?: string;
  coverColor?: string;
  tags?: string[];
}

interface Blog8Props {
  heading?: string;
  headingClassName?: string;
  description?: string;
  /** CTA row under the description (router links etc. stay with the caller) */
  actions?: ReactNode;
  posts?: Post[];
}

const Blog8 = ({
  heading = 'Blog Posts',
  headingClassName,
  description = 'Discover the latest insights and tutorials about modern web development, UI design, and component-driven architecture.',
  actions,
  posts = [],
}: Blog8Props) => {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1264px] mx-auto flex flex-col items-center gap-16 px-6 md:px-16">
        <div className="text-center">
          <h2 className={cn("mx-auto mb-6 text-pretty text-3xl font-display font-semibold md:text-4xl lg:max-w-3xl", headingClassName)}>
            {heading}
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground md:text-lg">
            {description}
          </p>
          {actions && <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div>}
        </div>

        <div className="grid w-full gap-y-10 sm:grid-cols-12 sm:gap-y-12 md:gap-y-16 lg:gap-y-20">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="order-last border-0 bg-transparent shadow-none sm:order-first sm:col-span-12 lg:col-span-10 lg:col-start-2"
            >
              <div className="grid gap-y-6 sm:grid-cols-10 sm:gap-x-5 sm:gap-y-0 md:items-center md:gap-x-8 lg:gap-x-12">
                <div className="sm:col-span-5">
                  <div className="mb-4 md:mb-6">
                    <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wider text-muted-foreground md:gap-5 lg:gap-6">
                      {post.tags?.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold md:text-2xl lg:text-3xl">
                    <Link to={post.url} className="hover:underline">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-4 text-muted-foreground md:mt-5">{post.summary}</p>
                  <div className="mt-6 flex items-center space-x-4 text-sm md:mt-8">
                    <span className="text-muted-foreground">{post.author}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{post.published}</span>
                  </div>
                  <div className="mt-6 flex items-center space-x-2 md:mt-8">
                    <Link
                      to={post.url}
                      className="inline-flex items-center font-semibold hover:underline md:text-base"
                    >
                      <span>Read more</span>
                      <ArrowRight className="ml-2 size-4 transition-transform" />
                    </Link>
                  </div>
                </div>
                <div className="order-first sm:order-last sm:col-span-5">
                  <Link to={post.url} className="block group">
                    <div className="aspect-[16/9] overflow-clip rounded-lg border border-border relative bg-[var(--zyro-twilight)]">
                      {post.image ? (
                        <>
                          <img
                            src={post.image}
                            alt={post.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-opacity duration-200 fade-in group-hover:opacity-80"
                          />
                          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" aria-hidden="true" />
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0" style={{ background: coverGradient(post.coverColor) }} aria-hidden="true" />
                          <div
                            className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:18px_18px]"
                            aria-hidden="true"
                          />
                          <div className="absolute top-3 right-4 w-16 h-16 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-4xl font-serif text-white/15 select-none">
                              {post.title.split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/70 block mb-1">
                          {post.label}
                        </span>
                        <span className="text-lg md:text-xl font-serif tracking-tight text-white leading-tight line-clamp-2">
                          {post.title}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Blog8 };
