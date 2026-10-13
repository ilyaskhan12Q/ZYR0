import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, Terminal, Copy, Check,
  Sparkles, Tag, ChevronRight, BookOpen, Layers,
  Info, ShieldCheck, User, Globe, Code2, Zap,
  Package, AlertCircle
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { type ToolItem, coverGradient } from '@/data/tools';
import { getToolBySlug, getAllPublicTools } from '@/services/tools';
import { toast } from 'sonner';

function getTypeBadgeClass(type?: string) {
  if (type === 'skill') return '!border-purple-300/40 !bg-purple-500/25 !text-purple-700 dark:!text-purple-200';
  if (type === 'tool_skill') return '!border-emerald-300/40 !bg-emerald-500/25 !text-emerald-700 dark:!text-emerald-200';
  return '!border-blue-300/40 !bg-blue-500/15 !text-blue-700 dark:!text-blue-200';
}

function getTypeLabel(type?: string) {
  if (type === 'tool_skill') return 'Tool + Skill';
  return type ? (type.charAt(0).toUpperCase() + type.slice(1)) : 'Tool';
}

function ToolDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-20 space-y-8">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="w-full aspect-[21/9] rounded-2xl" />
      <div className="space-y-3">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-5 w-full max-w-xl" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

function ToolNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <SEO
        title="Tool Not Found — ZYR0 ToolHub"
        description="The tool or skill you are looking for does not exist or is no longer available."
        path="/tools"
      />
      <div className="text-center max-w-md space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-2">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Tool Not Found</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          This tool or skill does not exist, is not yet approved, or may have been removed from the directory.
        </p>
        <Link to="/tools">
          <Button className="gap-2 bg-[var(--zyro-accent)] hover:bg-[var(--zyro-sapphire)] text-white mt-2">
            <ArrowLeft className="w-4 h-4" />
            Return to ToolHub
          </Button>
        </Link>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
      <Icon className="w-3.5 h-3.5 text-[var(--zyro-accent)]" />
      {children}
    </h2>
  );
}

function RelatedToolCard({ tool }: { tool: ToolItem }) {
  const initials = tool.name.split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="group flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-card hover:border-[var(--zyro-accent)]/40 hover:bg-[var(--zyro-accent-muted)]/20 transition-all"
    >
      <div
        className="shrink-0 w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center text-white/30 text-sm font-serif font-bold"
        style={{ background: coverGradient(tool.coverColor) }}
        aria-hidden="true"
      >
        {initials}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground group-hover:text-[var(--zyro-accent)] transition-colors line-clamp-1">
          {tool.name}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{tool.tagline}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-[var(--zyro-accent)] transition-colors" />
    </Link>
  );
}

export default function ToolDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [tool, setTool] = useState<ToolItem | null | 'loading'>('loading');
  const [related, setRelated] = useState<ToolItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (!slug) { setTool(null); return; }
    let mounted = true;
    setTool('loading');
    setImgFailed(false);

    getToolBySlug(slug).then((data) => {
      if (!mounted) return;
      setTool(data);
      if (data) {
        getAllPublicTools().then((all) => {
          if (!mounted) return;
          const candidates = all.filter(
            (t) => t.slug !== data.slug &&
              (t.category === data.category || t.tags.some((tag) => data.tags.includes(tag)))
          );
          setRelated(candidates.slice(0, 3));
        });
      }
    });

    return () => { mounted = false; };
  }, [slug]);

  const handleCopyCommand = async () => {
    if (!tool || tool === 'loading' || !tool.installCommand) return;
    try {
      await navigator.clipboard.writeText(tool.installCommand);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy command');
    }
  };

  if (tool === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <ToolDetailSkeleton />
      </div>
    );
  }

  if (!tool) return <ToolNotFound />;

  const showImage = Boolean(tool.imageUrl) && !imgFailed;
  const initials = tool.name.split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  const canonicalPath = `/tools/${tool.slug}`;

  const getSourceLabel = () => {
    switch (tool.source) {
      case 'ZYR0 Native': return 'View on ZYR0';
      case 'GitHub': return 'View on GitHub';
      case 'Hugging Face': return 'View on Hugging Face';
      default: return 'View Source';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={`${tool.name} — ZYR0 ToolHub`}
        description={tool.tagline}
        path={canonicalPath}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-24">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/tools" className="hover:text-foreground transition-colors">ToolHub</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium line-clamp-1">{tool.name}</span>
        </nav>

        {/* Hero / Media Band */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[21/7] rounded-2xl overflow-hidden bg-[var(--zyro-twilight)] mb-8 border border-border/40">
          {showImage ? (
            <>
              <img
                src={tool.imageUrl}
                alt={`${tool.name} cover`}
                onError={() => setImgFailed(true)}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" aria-hidden="true" />
            </>
          ) : (
            <>
              <div className="absolute inset-0" style={{ background: coverGradient(tool.coverColor) }} aria-hidden="true" />
              <div
                className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:20px_20px]"
                aria-hidden="true"
              />
              <div className="absolute top-6 right-8 w-32 h-32 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-8xl font-serif text-white/10 select-none">{initials}</span>
              </div>
            </>
          )}

          {/* Badges row */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="border-white/30 bg-white/15 text-white backdrop-blur-sm text-xs">
              {tool.source}
            </Badge>
            {tool.item_type && (
              <Badge variant="outline" className={`text-xs font-mono capitalize backdrop-blur-sm ${getTypeBadgeClass(tool.item_type)}`}>
                {getTypeLabel(tool.item_type)}
              </Badge>
            )}
            {tool.featured && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-white bg-white/15 backdrop-blur-sm px-2 py-1 rounded-full border border-white/25">
                <Sparkles className="w-3 h-3" />
                Featured
              </span>
            )}
            {tool.badge && (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[var(--zyro-accent)] text-white shadow-sm">
                {tool.badge}
              </span>
            )}
          </div>
        </div>

        {/* Title + Tagline + Primary CTA */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="space-y-2 flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {tool.name}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
              {tool.tagline}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tool.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted/70 text-muted-foreground border border-border/50"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <a
            href={tool.sourceUrl}
            target={tool.sourceUrl.startsWith('http') ? '_blank' : undefined}
            rel={tool.sourceUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
            aria-label={`Open ${tool.name} on ${tool.source}`}
            className="shrink-0"
          >
            <Button
              size="lg"
              className="gap-2 bg-[var(--zyro-accent)] hover:bg-[var(--zyro-sapphire)] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all px-6"
            >
              <ExternalLink className="w-4 h-4" />
              {getSourceLabel()}
            </Button>
          </a>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 p-4 rounded-2xl bg-muted/40 border border-border/60">
          {tool.author?.name && (
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Author</p>
              {tool.author.url ? (
                <a
                  href={tool.author.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[var(--zyro-accent)] hover:underline flex items-center gap-1 line-clamp-1"
                >
                  <User className="w-3 h-3 shrink-0" />
                  {tool.author.name}
                </a>
              ) : (
                <p className="text-sm font-medium text-foreground flex items-center gap-1">
                  <User className="w-3 h-3 text-muted-foreground shrink-0" />
                  {tool.author.name}
                </p>
              )}
            </div>
          )}
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Category</p>
            <p className="text-sm font-medium text-foreground flex items-center gap-1">
              <Package className="w-3 h-3 text-muted-foreground shrink-0" />
              {tool.category}
            </p>
          </div>
          {tool.version && (
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Version</p>
              <p className="text-sm font-mono font-medium text-foreground flex items-center gap-1">
                <Code2 className="w-3 h-3 text-muted-foreground shrink-0" />
                {tool.version}
              </p>
            </div>
          )}
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Source</p>
            <p className="text-sm font-medium text-foreground flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
              {tool.source}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: About + Install + Capabilities */}
          <div className="lg:col-span-2 space-y-8">

            {/* About */}
            <section>
              <SectionTitle icon={Info}>About</SectionTitle>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {tool.description}
              </p>
            </section>

            {/* Installation */}
            {tool.installCommand && (
              <section>
                <SectionTitle icon={Terminal}>Installation</SectionTitle>
                <div className="rounded-xl border border-border/70 bg-[#0d1117] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                    </div>
                    <span className="text-[10px] text-white/30 font-mono">bash</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-4">
                    <span className="text-white/30 text-sm font-mono select-none">$</span>
                    <code className="flex-1 text-sm font-mono text-emerald-300 break-all leading-relaxed">
                      {tool.installCommand}
                    </code>
                    <button
                      onClick={handleCopyCommand}
                      aria-label="Copy install command"
                      className="shrink-0 p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {tool.installInstructions && (
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {tool.installInstructions}
                  </p>
                )}
              </section>
            )}

            {/* Key Capabilities */}
            {tool.capabilities && tool.capabilities.length > 0 && (
              <section>
                <SectionTitle icon={Zap}>Key Capabilities</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tool.capabilities.map((cap, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-xl border border-border/60 bg-card hover:border-[var(--zyro-accent)]/30 transition-colors"
                    >
                      <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-[var(--zyro-accent)]/15 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--zyro-accent)]" />
                      </span>
                      <span className="text-sm text-muted-foreground leading-snug">{cap}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT: Links + Related */}
          <div className="space-y-6">

            {/* External Resources */}
            <aside>
              <SectionTitle icon={Globe}>Resources &amp; Links</SectionTitle>
              <div className="space-y-2">
                <a
                  href={tool.sourceUrl}
                  target={tool.sourceUrl.startsWith('http') ? '_blank' : undefined}
                  rel={tool.sourceUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card hover:border-[var(--zyro-accent)]/40 hover:bg-[var(--zyro-accent-muted)]/10 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Code2 className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-foreground">Source Repository</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[var(--zyro-accent)] transition-colors" />
                </a>

                {tool.documentationUrl && (
                  <a
                    href={tool.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card hover:border-[var(--zyro-accent)]/40 hover:bg-[var(--zyro-accent-muted)]/10 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium text-foreground">Documentation</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[var(--zyro-accent)] transition-colors" />
                  </a>
                )}

                <Link
                  to="/tools"
                  className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card hover:border-[var(--zyro-accent)]/40 hover:bg-[var(--zyro-accent-muted)]/10 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-foreground">All Tools &amp; Skills</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[var(--zyro-accent)] transition-colors" />
                </Link>
              </div>
            </aside>

            {/* Tags */}
            {tool.tags.length > 0 && (
              <aside>
                <SectionTitle icon={Tag}>Tags</SectionTitle>
                <div className="flex flex-wrap gap-1.5">
                  {tool.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/tools?q=${encodeURIComponent(tag)}`}
                      className="text-xs font-mono px-2 py-1 rounded-lg bg-muted/60 text-muted-foreground border border-border/50 hover:border-[var(--zyro-accent)]/50 hover:text-[var(--zyro-accent)] transition-all"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </aside>
            )}

            {/* Related Tools */}
            {related.length > 0 && (
              <aside>
                <SectionTitle icon={Sparkles}>Related Tools &amp; Skills</SectionTitle>
                <div className="space-y-2">
                  {related.map((t) => <RelatedToolCard key={t.id} tool={t} />)}
                </div>
              </aside>
            )}
          </div>
        </div>

        {/* Back to Directory */}
        <div className="mt-12 pt-8 border-t border-border/60 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <Link to="/tools" className="text-sm text-[var(--zyro-accent)] hover:underline font-medium">
            Browse all tools →
          </Link>
        </div>
      </div>
    </div>
  );
}
