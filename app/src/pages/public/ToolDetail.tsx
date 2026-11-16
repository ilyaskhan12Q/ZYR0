import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, Terminal, Copy, Check,
  Sparkles, Tag, ChevronRight, BookOpen, Layers,
  Info, ShieldCheck, User, Globe, Code2, Zap,
  AlertCircle, Share2
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownContent } from '@/components/markdown/MarkdownContent';
import { BASE_URL } from '@/config/seo';
import { copyToClipboard } from '@/lib/clipboard';
import { splitCapability } from '@/lib/capability';
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
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Tool';
}

function isExternalUrl(url?: string) {
  return Boolean(url && /^https?:\/\//i.test(url));
}

function externalProps(url: string) {
  return isExternalUrl(url) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

function ToolDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-20 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pt-14">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="aspect-[21/9] w-full rounded-2xl" />
      <div className="space-y-3">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-5 w-full max-w-xl" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}

function ToolNotFound() {
  return (
    <div className="min-h-page flex items-center justify-center bg-background px-4">
      <SEO
        title="Tool Not Found — ZYR0 ToolHub"
        description="The tool or skill you are looking for does not exist or is no longer available."
        path="/tools"
        noIndex
      />
      <div className="max-w-md space-y-4 text-center">
        <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Tool Not Found</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This tool or skill does not exist, is not yet approved, or may have been removed from the directory.
        </p>
        <Link to="/tools">
          <Button className="mt-2 gap-2 bg-[var(--zyro-accent)] text-white hover:bg-[var(--zyro-sapphire)]">
            <ArrowLeft className="h-4 w-4" />
            Return to ToolHub
          </Button>
        </Link>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  );
}

function RecommendedCard({ tool }: { tool: ToolItem }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(tool.imageUrl) && !imgFailed;
  const initials = tool.name.split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="group flex flex-col justify-between overflow-hidden rounded-xl border border-border/70 bg-card transition-all duration-200 hover:border-[var(--zyro-accent)]/50 hover:shadow-md"
    >
      <div>
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border/40 bg-[var(--zyro-twilight)]">
          {showImage ? (
            <>
              <img
                src={tool.imageUrl}
                alt={`${tool.name} cover`}
                onError={() => setImgFailed(true)}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" aria-hidden="true" />
            </>
          ) : (
            <>
              <div className="absolute inset-0" style={{ background: coverGradient(tool.coverColor) }} aria-hidden="true" />
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.16] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:16px_16px]" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="select-none font-serif text-4xl text-white/15">{initials}</span>
              </div>
            </>
          )}

          <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
            <Badge variant="outline" className="h-5 border-white/30 bg-white/15 text-[10px] text-white backdrop-blur-sm">
              {tool.source}
            </Badge>
            {tool.item_type && (
              <Badge variant="outline" className="h-5 border-white/30 bg-white/15 text-[10px] font-mono capitalize text-white backdrop-blur-sm">
                {getTypeLabel(tool.item_type)}
              </Badge>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-3">
            <h3 className="line-clamp-1 text-sm font-bold tracking-tight text-white drop-shadow-sm">{tool.name}</h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-white/80">{tool.tagline}</p>
          </div>
        </div>

        <div className="p-3">
          <div className="flex flex-wrap gap-1">
            {tool.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded border border-border/40 bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 p-3 pt-2 text-xs text-muted-foreground group-hover:text-foreground">
        <span className="flex items-center gap-1 font-medium text-[var(--zyro-accent)]">
          View listing
          <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
        <span className="font-mono text-[10px]">{tool.category}</span>
      </div>
    </Link>
  );
}

export default function ToolDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [tool, setTool] = useState<ToolItem | null | 'loading'>('loading');
  const [recommended, setRecommended] = useState<ToolItem[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (!slug) {
      setTool(null);
      return;
    }
    let mounted = true;
    setTool('loading');
    setImgFailed(false);

    getToolBySlug(slug).then((data) => {
      if (!mounted) return;
      setTool(data);
      if (!data) return;

      getAllPublicTools().then((all) => {
        if (!mounted) return;
        const others = all.filter((t) => t.slug !== data.slug);
        let scored = others
          .map((candidate) => {
            let score = 0;
            if (candidate.category === data.category) score += 4;
            const currentTags = new Set(data.tags.map((t) => t.toLowerCase()));
            score += candidate.tags.filter((t) => currentTags.has(t.toLowerCase())).length * 2;
            if (candidate.item_type && candidate.item_type === data.item_type) score += 1;
            if (candidate.featured) score += 1;
            return { candidate, score };
          })
          .sort((a, b) => b.score - a.score)
          .filter(({ score }) => score > 0)
          .map(({ candidate }) => candidate);

        if (scored.length < 3 && others.length > 0) {
          const addedIds = new Set(scored.map((s) => s.id));
          scored = [...scored, ...others.filter((t) => !addedIds.has(t.id))];
        }

        setRecommended(scored.slice(0, 3));
      });
    });

    return () => {
      mounted = false;
    };
  }, [slug]);

  const handleCopyLink = async () => {
    if (!(await copyToClipboard(window.location.href))) {
      toast.error('Failed to copy link');
      return;
    }
    setLinkCopied(true);
    toast.success('Listing link copied');
    window.setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleCopyCommand = async (command: string, index: number) => {
    if (!(await copyToClipboard(command))) {
      toast.error('Failed to copy command');
      return;
    }
    setCopiedIndex(index);
    toast.success('Command copied');
    window.setTimeout(() => setCopiedIndex(null), 2000);
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
  const isSkill = tool.item_type === 'skill';
  const isHybrid = tool.item_type === 'tool_skill';
  const noun = isSkill ? 'Skill' : isHybrid ? 'Tool + Skill' : 'Tool';

  const commands =
    tool.installCommands && tool.installCommands.length > 0
      ? tool.installCommands
      : tool.installCommand
        ? [{ label: isSkill ? 'Invocation command' : 'Installation command', command: tool.installCommand }]
        : [];
  const hasSetupContent = commands.length > 0 || Boolean(tool.installInstructions);

  const seoTitle = tool.seoTitle || `${tool.name} — ${getTypeLabel(tool.item_type)} in ${tool.category}`;
  const seoDescription = tool.seoDescription || tool.tagline;
  const seoImage = isExternalUrl(tool.imageUrl) ? tool.imageUrl : undefined;

  const sourceLabel = (() => {
    switch (tool.source) {
      case 'ZYR0 Native': return 'Open on ZYR0';
      case 'GitHub': return 'View repository';
      case 'Hugging Face': return 'View on Hugging Face';
      case 'GitLab': return 'View repository';
      default: return 'Visit website';
    }
  })();

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'ToolHub', item: `${BASE_URL}/tools` },
        { '@type': 'ListItem', position: 3, name: tool.name, item: `${BASE_URL}${canonicalPath}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: seoDescription,
      url: `${BASE_URL}${canonicalPath}`,
      applicationCategory: tool.category,
      applicationSubCategory: getTypeLabel(tool.item_type),
      ...(seoImage ? { image: seoImage } : {}),
      ...(isExternalUrl(tool.sourceUrl) ? { sameAs: [tool.sourceUrl] } : {}),
      ...(tool.version ? { softwareVersion: tool.version } : {}),
      ...(tool.tags.length > 0 ? { keywords: tool.tags.join(', ') } : {}),
      isPartOf: {
        '@type': 'WebSite',
        name: 'ZYR0 ToolHub',
        url: `${BASE_URL}/tools`,
      },
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={seoTitle}
        description={seoDescription}
        path={canonicalPath}
        image={seoImage}
        keywords={tool.tags.join(', ')}
        structuredData={structuredData}
      />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pt-14">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/tools" className="transition-colors hover:text-foreground">ToolHub</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1 font-medium text-foreground">{tool.name}</span>
        </nav>

        {/* Header */}
        <header className="relative mb-10 overflow-hidden rounded-2xl border border-border/40 bg-[var(--zyro-twilight)]">
          <div className="absolute inset-0" aria-hidden="true">
            {showImage ? (
              <>
                <img
                  src={tool.imageUrl}
                  alt=""
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/15" />
              </>
            ) : (
              <>
                <div className="absolute inset-0" style={{ background: coverGradient(tool.coverColor) }} />
                <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:20px_20px]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="select-none font-serif text-[9rem] leading-none text-white/10">{initials}</span>
                </div>
              </>
            )}
          </div>

          <div className="relative z-10 flex min-h-[380px] flex-col justify-between gap-10 p-5 sm:min-h-[400px] sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-white/30 bg-white/15 text-[11px] font-medium text-white backdrop-blur-sm">
                {tool.source}
              </Badge>
              {tool.item_type && (
                <Badge variant="outline" className={`text-[11px] font-mono capitalize backdrop-blur-sm ${getTypeBadgeClass(tool.item_type)}`}>
                  {getTypeLabel(tool.item_type)}
                </Badge>
              )}
              {tool.featured && (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" />
                  Featured
                </span>
              )}
              {tool.badge && (
                <span className="rounded-full bg-[var(--zyro-accent)] px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                  {tool.badge}
                </span>
              )}
            </div>

            <div className="space-y-3">
              <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md sm:text-4xl lg:text-5xl">
                {tool.name}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">{tool.tagline}</p>

              {tool.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tool.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/tools?q=${encodeURIComponent(tag)}`}
                      className="rounded-md border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/75 backdrop-blur-sm transition-colors hover:border-white/30 hover:text-white"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button asChild size="sm" className="gap-2 rounded-xl border border-white/25 bg-white text-[var(--zyro-twilight)] shadow-md hover:bg-white/90">
                  <a href={tool.sourceUrl} aria-label={`${sourceLabel}: ${tool.name}`} {...externalProps(tool.sourceUrl)}>
                    <ExternalLink className="h-3.5 w-3.5" />
                    {sourceLabel}
                  </a>
                </Button>
                {tool.documentationUrl && (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="gap-2 rounded-xl border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                  >
                    <a href={tool.documentationUrl} aria-label={`Documentation: ${tool.name}`} {...externalProps(tool.documentationUrl)}>
                      <BookOpen className="h-3.5 w-3.5" />
                      Documentation
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
          {/* Main content */}
          <div className="min-w-0 space-y-10">
            {commands.length > 0 && (
              <section>
                <SectionHeading>
                  <Terminal className="h-4 w-4 text-[var(--zyro-accent)]" />
                  Commands
                </SectionHeading>
                <div className="space-y-3">
                  {commands.map((command, index) => (
                    <div key={`${command.label}-${index}`} className="overflow-hidden rounded-xl border border-neutral-800 bg-[#0d1117]">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-2.5">
                        <span className="inline-flex items-center rounded-md border border-white/15 bg-white/10 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-white/85">
                          {command.label || (isSkill ? 'Invocation command' : 'Installation command')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCommand(command.command, index)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-2 py-1 text-[10px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                          aria-label={`Copy ${command.label || 'command'}`}
                        >
                          {copiedIndex === index ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-emerald-300 sm:text-sm">
                        <span className="select-none text-neutral-500">$ </span>
                        {command.command}
                      </pre>
                    </div>
                  ))}
                </div>
                {tool.installInstructions && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-[var(--zyro-accent)]/20 bg-[var(--zyro-accent-muted)] px-3.5 py-3 text-xs leading-relaxed text-foreground/85">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--zyro-accent)]" />
                    <p className="whitespace-pre-line">{tool.installInstructions}</p>
                  </div>
                )}
              </section>
            )}

            {commands.length === 0 && tool.installInstructions && (
              <section>
                <SectionHeading>
                  <Info className="h-4 w-4 text-[var(--zyro-accent)]" />
                  Requirements &amp; setup notes
                </SectionHeading>
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">{tool.installInstructions}</p>
              </section>
            )}

            {tool.description.trim() && (
              <section className={hasSetupContent ? 'border-t border-border/60 pt-8' : undefined}>
                <SectionHeading>
                  <Info className="h-4 w-4 text-[var(--zyro-accent)]" />
                  Overview
                </SectionHeading>
                <MarkdownContent content={tool.description} />
              </section>
            )}

            {tool.capabilities.length > 0 && (
              <section className="border-t border-border/60 pt-8">
                <SectionHeading>
                  <Zap className="h-4 w-4 text-[var(--zyro-accent)]" />
                  {isSkill ? 'Capabilities' : 'Key features'}
                </SectionHeading>
                <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {tool.capabilities.map((capability, index) => {
                    const [label, value] = splitCapability(capability);
                    return (
                      <li
                        key={`${capability}-${index}`}
                        className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5"
                      >
                        <span className="flex min-w-0 items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span className="text-sm leading-snug text-foreground/85">{label}</span>
                        </span>
                        {value && (
                          <span className="shrink-0 rounded-md border border-border/50 bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                            {value}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-2xl border border-border/70 bg-card p-5">
              <SectionHeading>
                <Layers className="h-4 w-4 text-[var(--zyro-accent)]" />
                Details
              </SectionHeading>
              <dl className="divide-y divide-border/50 text-xs">
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd>
                    <Badge variant="outline" className={`h-5 text-[10px] capitalize ${getTypeBadgeClass(tool.item_type)}`}>
                      {getTypeLabel(tool.item_type)}
                    </Badge>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="text-right font-medium text-foreground">{tool.category}</dd>
                </div>
                {tool.version && (
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-muted-foreground">Version</dt>
                    <dd className="font-mono font-medium text-foreground">{tool.version}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-muted-foreground">Source</dt>
                  <dd className="flex items-center gap-1 text-right font-medium text-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    {tool.source}
                  </dd>
                </div>
                {tool.author?.name && (
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-muted-foreground">Author</dt>
                    <dd className="text-right font-medium text-foreground">
                      {tool.author.url ? (
                        <a
                          href={tool.author.url}
                          {...externalProps(tool.author.url)}
                          className="inline-flex items-center gap-1 text-[var(--zyro-accent)] hover:underline"
                        >
                          {tool.author.name}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        tool.author.name
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card p-5">
              <SectionHeading>
                <Globe className="h-4 w-4 text-[var(--zyro-accent)]" />
                Links
              </SectionHeading>
              <div className="space-y-2">
                <a
                  href={tool.sourceUrl}
                  {...externalProps(tool.sourceUrl)}
                  className="group flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3 transition-all hover:border-[var(--zyro-accent)]/40 hover:bg-muted/40"
                >
                  <span className="flex items-center gap-2.5">
                    <Code2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">{sourceLabel}</span>
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-[var(--zyro-accent)]" />
                </a>

                {tool.documentationUrl && (
                  <a
                    href={tool.documentationUrl}
                    {...externalProps(tool.documentationUrl)}
                    className="group flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3 transition-all hover:border-[var(--zyro-accent)]/40 hover:bg-muted/40"
                  >
                    <span className="flex items-center gap-2.5">
                      <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">Documentation</span>
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-[var(--zyro-accent)]" />
                  </a>
                )}

                {tool.author?.url && (
                  <a
                    href={tool.author.url}
                    {...externalProps(tool.author.url)}
                    className="group flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3 transition-all hover:border-[var(--zyro-accent)]/40 hover:bg-muted/40"
                  >
                    <span className="flex items-center gap-2.5">
                      <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">Author profile</span>
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-[var(--zyro-accent)]" />
                  </a>
                )}

                <Link
                  to="/tools"
                  className="group flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3 transition-all hover:border-[var(--zyro-accent)]/40 hover:bg-muted/40"
                >
                  <span className="flex items-center gap-2.5">
                    <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">All tools &amp; skills</span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-[var(--zyro-accent)]" />
                </Link>
              </div>
            </section>

            {tool.tags.length > 0 && (
              <section className="rounded-2xl border border-border/70 bg-card p-5">
                <SectionHeading>
                  <Tag className="h-4 w-4 text-[var(--zyro-accent)]" />
                  Tags
                </SectionHeading>
                <div className="flex flex-wrap gap-1.5">
                  {tool.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/tools?q=${encodeURIComponent(tag)}`}
                      className="rounded-lg border border-border/50 bg-muted/60 px-2.5 py-1 font-mono text-xs text-muted-foreground transition-all hover:border-[var(--zyro-accent)]/50 hover:bg-muted hover:text-[var(--zyro-accent)]"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="w-full gap-2 border-border/70 text-xs font-medium hover:border-[var(--zyro-accent)]/50"
            >
              {linkCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Link copied
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  Share this {noun.toLowerCase()}
                </>
              )}
            </Button>
          </aside>
        </div>

        {recommended.length > 0 && (
          <section className="mt-14 border-t border-border/60 pt-10">
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <Sparkles className="h-5 w-5 text-[var(--zyro-accent)]" />
                  Related tools &amp; skills
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                  More listings from the same category and tag ecosystem
                </p>
              </div>
              <Link to="/tools" className="flex shrink-0 items-center gap-1 text-xs font-medium text-[var(--zyro-accent)] hover:underline sm:text-sm">
                Browse all
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((item) => (
                <RecommendedCard key={item.id} tool={item} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 flex items-center justify-between border-t border-border/60 pt-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <Link to="/tools" className="text-sm font-medium text-[var(--zyro-accent)] hover:underline">
            Browse all listings →
          </Link>
        </div>
      </div>
    </div>
  );
}
