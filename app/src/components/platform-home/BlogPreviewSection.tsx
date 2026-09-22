import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Calendar, Clock } from 'lucide-react';
import Reveal from './Reveal';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  gradient: string;
}

const recentPosts: BlogPost[] = [
  {
    slug: 'autonomous-web-generation-guardrails',
    title: 'Building Autonomous AI Systems with Deterministic Guardrails',
    excerpt: 'How ZYR0 Studio transforms natural language prompts into production-ready React 19 code without hallucinations or broken dependencies.',
    category: 'Engineering',
    date: 'Sep 21, 2026',
    readTime: '6 min read',
    gradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
  },
  {
    slug: 'modern-school-operating-system',
    title: 'The Future of Institutional Management: Beyond Legacy Portals',
    excerpt: 'Why modern educational institutions need unified biometric attendance, automated fee ledgering, and intelligent timetable scheduling.',
    category: 'EdTech',
    date: 'Sep 18, 2026',
    readTime: '5 min read',
    gradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
  },
  {
    slug: 'cryptographic-proof-of-work-internships',
    title: 'Why Cryptographically Verifiable Internships Matter for Modern Hiring',
    excerpt: 'How tamper-proof certificates and verified GitHub pull-request submissions eliminate credential inflation and accelerate engineering recruitment.',
    category: 'Careers',
    date: 'Sep 14, 2026',
    readTime: '4 min read',
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
  },
];

export default function BlogPreviewSection() {
  return (
    <section id="blog" className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-[1264px] mx-auto px-6 md:px-16">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 md:mb-16 gap-6">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 border"
                style={{
                  color: 'var(--zyro-accent)',
                  borderColor: 'var(--zyro-border)',
                  background: 'var(--zyro-accent-muted)',
                }}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Editorial & Insights</span>
              </div>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold tracking-tight"
                style={{ color: 'var(--zyro-text)' }}
              >
                Latest from the blog.
              </h2>
            </div>

            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#7B7BDC] hover:underline transition-colors group"
            >
              <span>View all articles</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Reveal>

        {/* 3 Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {recentPosts.map((post, index) => (
            <Reveal key={post.slug} delay={index * 0.08}>
              <Link
                to={`/blog/${post.slug}`}
                className="group relative rounded-2xl border p-6 h-full flex flex-col justify-between transition-all duration-300 hover:border-[var(--zyro-accent)]/50 hover:shadow-lg block overflow-hidden"
                style={{
                  background: 'var(--zyro-surface)',
                  borderColor: 'var(--zyro-border)',
                }}
              >
                {/* Subtle top gradient accent */}
                <div
                  className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${post.gradient} pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity`}
                />

                <div className="relative z-10">
                  {/* Category & Read Time */}
                  <div className="flex items-center justify-between gap-2 mb-4 text-xs">
                    <span
                      className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border"
                      style={{
                        background: 'var(--zyro-elevated)',
                        borderColor: 'var(--zyro-border)',
                        color: 'var(--zyro-text-muted)',
                      }}
                    >
                      {post.category}
                    </span>
                    <span
                      className="flex items-center gap-1 font-mono text-[11px]"
                      style={{ color: 'var(--zyro-text-muted)' }}
                    >
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-lg font-semibold transition-colors leading-snug mb-3 group-hover:text-[#7B7BDC]"
                    style={{ color: 'var(--zyro-text)' }}
                  >
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p
                    className="text-xs sm:text-sm leading-relaxed line-clamp-3 mb-6"
                    style={{ color: 'var(--zyro-text-secondary)' }}
                  >
                    {post.excerpt}
                  </p>
                </div>

                {/* Date & Read more link */}
                <div
                  className="relative z-10 pt-4 border-t flex items-center justify-between text-xs"
                  style={{ borderColor: 'var(--zyro-border)' }}
                >
                  <span
                    className="flex items-center gap-1 font-mono text-[11px]"
                    style={{ color: 'var(--zyro-text-muted)' }}
                  >
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </span>
                  <span className="text-[#7B7BDC] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read post <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
