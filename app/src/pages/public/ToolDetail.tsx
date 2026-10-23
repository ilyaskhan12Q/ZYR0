import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, Terminal, Copy, Check,
  Sparkles, Tag, ChevronRight, BookOpen, Layers,
  Info, ShieldCheck, User, Globe, Code2, Zap,
  Package, AlertCircle, Share2
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-8">
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
    <div className="min-h-page bg-background flex items-center justify-center px-4">
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
    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-[var(--zyro-accent)]" />
      <span>{children}</span>
    </h2>
  );
}

function renderDescriptionContent(text: string) {
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="space-y-4 text-sm sm:text-[15px] leading-relaxed text-muted-foreground">
      {paragraphs.map((p, idx) => {
        const trimmed = p.trim();

        // Workflow sequence detection (e.g. plan -> test -> implement -> ...)
        if (trimmed.includes('->') && trimmed.split('->').length >= 3) {
          const steps = trimmed.split('->').map((s) => s.trim());
          return (
            <div key={idx} className="my-3 p-3.5 sm:p-4 rounded-xl border border-border/70 bg-muted/30">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Workflow Pipeline
              </p>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {steps.map((step, sIdx) => (
                  <React.Fragment key={sIdx}>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-background text-foreground font-mono text-xs font-medium border border-border/60">
                      {step}
                    </span>
                    {sIdx < steps.length - 1 && (
                      <span className="text-[var(--zyro-accent)] font-bold text-xs select-none">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        }

        // Indented quote / highlight callout
        if (p.startsWith('    ') || p.startsWith('\t')) {
          return (
            <blockquote
              key={idx}
              className="border-l-2 border-[var(--zyro-accent)] pl-4 py-1.5 my-3 italic text-foreground/90 bg-[var(--zyro-accent)]/5 rounded-r-lg font-medium text-sm"
            >
              {trimmed}
            </blockquote>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="leading-relaxed whitespace-pre-line text-foreground/85">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

function renderCapability(cap: string, index: number) {
  const match = cap.match(/^(.+?)\s*[-:]\s*(.+)$/);
  if (match) {
    const label = match[1].trim();
    const value = match[2].trim();
    return (
      <div
        key={index}
        className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:border-[var(--zyro-accent)]/40 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--zyro-accent)] shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-foreground truncate">{label}</span>
        </div>
        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/50 shrink-0">
          {value}
        </span>
      </div>
    );
  }

  return (
    <div
      key={index}
      className="flex items-start gap-2.5 p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:border-[var(--zyro-accent)]/40 transition-colors"
    >
      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
      <span className="text-xs sm:text-sm text-foreground/85 leading-snug">{cap.trim()}</span>
    </div>
  );
}

function RecommendedCard({ tool }: { tool: ToolItem }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(tool.imageUrl) && !imgFailed;
  const initials = tool.name.split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="group flex flex-col justify-between rounded-xl border border-border/70 bg-card hover:border-[var(--zyro-accent)]/50 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div>
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-[var(--zyro-twilight)] border-b border-border/40">
          {showImage ? (
            <>
              <img
                src={tool.imageUrl}
                alt={tool.name}
                onError={() => setImgFailed(true)}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" aria-hidden="true" />
            </>
          ) : (
            <>
              <div className="absolute inset-0" style={{ background: coverGradient(tool.coverColor) }} aria-hidden="true" />
              <div
                className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:16px_16px]"
                aria-hidden="true"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-4xl font-serif text-white/15 select-none">{initials}</span>
              </div>
            </>
          )}

          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <Badge variant="outline" className="border-white/30 bg-white/15 text-white backdrop-blur-sm text-[10px] h-5">
              {tool.source}
            </Badge>
            {tool.item_type && (
              <Badge variant="outline" className="text-[10px] h-5 font-mono capitalize border-white/30 bg-white/15 text-white backdrop-blur-sm">
                {getTypeLabel(tool.item_type)}
              </Badge>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-3">
            <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1 drop-shadow-sm">
              {tool.name}
            </h4>
            <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
              {tool.tagline}
            </p>
          </div>
        </div>

        <div className="p-3">
          <div className="flex flex-wrap gap-1">
            {tool.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 pt-2 border-t border-border/40 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground">
        <span className="font-medium text-[var(--zyro-accent)] flex items-center gap-1">
          Inspect tool
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
        <span className="text-[10px] font-mono">{tool.category}</span>
      </div>
    </Link>
  );
}

export default function ToolDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [tool, setTool] = useState<ToolItem | null | 'loading'>('loading');
  const [recommended, setRecommended] = useState<ToolItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
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
          // Calculate relevance score using category, shared tags, and compatibility
          const matches = all
            .filter((t) => t.slug !== data.slug)
            .map((candidate) => {
              let score = 0;
              // 1. Same category (+3)
              if (candidate.category === data.category) score += 3;
              // 2. Shared tags (+2 each)
              const currentTags = new Set(data.tags.map((t) => t.toLowerCase()));
              const shared = candidate.tags.filter((t) => currentTags.has(t.toLowerCase())).length;
              score += shared * 2;
              // 3. Same item type (+1)
              if (candidate.item_type && candidate.item_type === data.item_type) score += 1;
              return { candidate, score };
            })
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 4)
            .map(({ candidate }) => candidate);

          setRecommended(matches);
        });
      }
    });

    return () => { mounted = false; };
  }, [slug]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      toast.success('Tool link copied to clipboard');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

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
      <div className="min-h-page bg-background">
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/tools" className="hover:text-foreground transition-colors">ToolHub</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium line-clamp-1">{tool.name}</span>
        </nav>

        {/* ── Rich Hero Panel — everything inside the gradient band ──── */}
        <div
          className="relative w-full rounded-2xl overflow-hidden bg-[var(--zyro-twilight)] mb-8 border border-border/40"
          style={{ minHeight: '340px' }}
        >
          {/* Background: photo or branded gradient */}
          {showImage ? (
            <img
              src={tool.imageUrl}
              alt={`${tool.name} cover`}
              onError={() => setImgFailed(true)}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
          ) : (
            <>
              <div className="absolute inset-0" style={{ background: coverGradient(tool.coverColor) }} aria-hidden="true" />
              <div
                className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:20px_20px]"
                aria-hidden="true"
              />
              <div className="absolute top-8 right-10 w-40 h-40 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
              {/* Large faint initials as watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[9rem] font-serif text-white/8 select-none leading-none">{initials}</span>
              </div>
            </>
          )}

          {/* Deep bottom scrim so text is always readable */}
          <div className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-black/85 via-black/50 to-transparent" aria-hidden="true" />

          {/* ── Top row: badge chips ── */}
          <div className="relative z-10 flex flex-wrap items-center gap-2 p-4 sm:p-5">
            <Badge variant="outline" className="border-white/30 bg-white/15 text-white backdrop-blur-sm text-[11px] font-medium">
              {tool.source}
            </Badge>
            {tool.item_type && (
              <Badge variant="outline" className={`text-[11px] font-mono capitalize backdrop-blur-sm ${getTypeBadgeClass(tool.item_type)}`}>
                {getTypeLabel(tool.item_type)}
              </Badge>
            )}
            {tool.featured && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/25">
                <Sparkles className="w-3 h-3" />
                Featured
              </span>
            )}
            {tool.badge && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--zyro-accent)] text-white shadow-sm">
                {tool.badge}
              </span>
            )}
          </div>

          {/* ── Bottom overlay: name · tagline · tags · meta row · CTA ── */}
          <div className="relative z-10 p-4 sm:p-6 pt-0 mt-auto flex flex-col gap-3" style={{ paddingTop: 0 }}>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
              {tool.name}
            </h1>

            {/* Tagline */}
            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl">
              {tool.tagline}
            </p>

            {/* Tag chips */}
            {tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tool.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/70 border border-white/15 backdrop-blur-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Meta row + CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-t border-white/15">
              {/* Meta pills: Author · Version · Category · Source */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/60">
                {tool.author?.name && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-white/50 shrink-0" />
                    {tool.author.url ? (
                      <a
                        href={tool.author.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        {tool.author.name}
                      </a>
                    ) : (
                      <span>{tool.author.name}</span>
                    )}
                  </span>
                )}
                {tool.version && (
                  <span className="flex items-center gap-1 font-mono">
                    <Code2 className="w-3 h-3 text-white/50 shrink-0" />
                    {tool.version}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3 text-white/50 shrink-0" />
                  {tool.category}
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  {tool.source}
                </span>
              </div>

              {/* Primary CTA */}
              <a
                href={tool.sourceUrl}
                target={tool.sourceUrl.startsWith('http') ? '_blank' : undefined}
                rel={tool.sourceUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                aria-label={`Open ${tool.name} on ${tool.source}`}
                className="shrink-0"
              >
                <Button
                  size="sm"
                  className="gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all px-5 backdrop-blur-sm border border-white/25"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {getSourceLabel()}
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: Installation (Prioritized) + About + Capabilities */}
          <div className="lg:col-span-2 space-y-6">

            {/* Installation (Prioritized as main content action) */}
            {tool.installCommand && (
              <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <SectionTitle icon={Terminal}>Quick Installation</SectionTitle>
                  <span className="text-[11px] font-mono text-muted-foreground uppercase">Shell</span>
                </div>
                <div className="rounded-xl border border-border/70 bg-[#0d1117] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">bash</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-white/30 text-sm font-mono select-none">$</span>
                      <code className="text-xs sm:text-sm font-mono text-emerald-300 break-all leading-relaxed select-all">
                        {tool.installCommand}
                      </code>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyCommand}
                      aria-label="Copy install command"
                      className="shrink-0 gap-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 border border-white/15 h-8 px-2.5"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {tool.installInstructions && (
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    {tool.installInstructions}
                  </p>
                )}
              </section>
            )}

            {/* About */}
            <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm">
              <SectionTitle icon={Info}>About {tool.name}</SectionTitle>
              {renderDescriptionContent(tool.description)}
            </section>

            {/* Key Capabilities */}
            {tool.capabilities && tool.capabilities.length > 0 && (
              <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm">
                <SectionTitle icon={Zap}>Key Capabilities &amp; Specifications</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                  {tool.capabilities.map((cap, i) => renderCapability(cap, i))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT SIDEBAR: Specifications + Links + Tags + Share */}
          <div className="space-y-6">

            {/* Specifications Card */}
            <aside className="rounded-2xl border border-border/70 bg-card p-5 space-y-3.5 shadow-sm">
              <SectionTitle icon={Package}>Specifications</SectionTitle>
              <div className="divide-y divide-border/50 text-xs">
                {tool.author?.name && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Author</span>
                    {tool.author.url ? (
                      <a
                        href={tool.author.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[var(--zyro-accent)] hover:underline flex items-center gap-1"
                      >
                        {tool.author.name}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="font-medium text-foreground">{tool.author.name}</span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium text-foreground">{tool.category}</span>
                </div>
                {tool.item_type && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="outline" className={`text-[10px] h-5 capitalize ${getTypeBadgeClass(tool.item_type)}`}>
                      {getTypeLabel(tool.item_type)}
                    </Badge>
                  </div>
                )}
                {tool.version && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-mono font-medium text-foreground">{tool.version}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Source</span>
                  <span className="font-medium text-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    {tool.source}
                  </span>
                </div>
              </div>
            </aside>

            {/* Resources & Links */}
            <aside className="rounded-2xl border border-border/70 bg-card p-5 space-y-3 shadow-sm">
              <SectionTitle icon={Globe}>Resources &amp; Links</SectionTitle>
              <div className="space-y-2">
                <a
                  href={tool.sourceUrl}
                  target={tool.sourceUrl.startsWith('http') ? '_blank' : undefined}
                  rel={tool.sourceUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 hover:border-[var(--zyro-accent)]/40 hover:bg-muted/40 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Code2 className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-xs font-medium text-foreground">Source Repository</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[var(--zyro-accent)] transition-colors" />
                </a>

                {tool.documentationUrl && (
                  <a
                    href={tool.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 hover:border-[var(--zyro-accent)]/40 hover:bg-muted/40 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-xs font-medium text-foreground">Documentation</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[var(--zyro-accent)] transition-colors" />
                  </a>
                )}

                <Link
                  to="/tools"
                  className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 hover:border-[var(--zyro-accent)]/40 hover:bg-muted/40 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-xs font-medium text-foreground">All Tools &amp; Skills</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[var(--zyro-accent)] transition-colors" />
                </Link>
              </div>
            </aside>

            {/* Tags */}
            {tool.tags.length > 0 && (
              <aside className="rounded-2xl border border-border/70 bg-card p-5 space-y-3 shadow-sm">
                <SectionTitle icon={Tag}>Tags &amp; Topics</SectionTitle>
                <div className="flex flex-wrap gap-1.5">
                  {tool.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/tools?q=${encodeURIComponent(tag)}`}
                      className="text-xs font-mono px-2.5 py-1 rounded-lg bg-muted/60 text-muted-foreground border border-border/50 hover:border-[var(--zyro-accent)]/50 hover:text-[var(--zyro-accent)] hover:bg-muted transition-all"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </aside>
            )}

            {/* Share Tool */}
            <aside className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="w-full gap-2 text-xs font-medium border-border/70 hover:border-[var(--zyro-accent)]/50"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share This Tool</span>
                  </>
                )}
              </Button>
            </aside>
          </div>
        </div>

        {/* ── Recommended Tools & Skills Section ──── */}
        {recommended.length > 0 && (
          <section className="mt-14 pt-10 border-t border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--zyro-accent)]" />
                  Recommended Tools &amp; Skills
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Related to {tool.name} in {tool.category}
                </p>
              </div>
              <Link
                to={`/tools?category=${encodeURIComponent(tool.category)}`}
                className="text-xs sm:text-sm font-medium text-[var(--zyro-accent)] hover:underline flex items-center gap-1 shrink-0"
              >
                View all in {tool.category}
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommended.map((item) => (
                <RecommendedCard key={item.id} tool={item} />
              ))}
            </div>
          </section>
        )}

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
