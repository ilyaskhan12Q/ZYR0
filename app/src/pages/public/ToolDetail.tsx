import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Wand2 } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownContent } from '@/components/markdown/MarkdownContent';
import { BASE_URL } from '@/config/seo';
import { copyToClipboard } from '@/lib/clipboard';
import { splitCapability } from '@/lib/capability';
import { getEffectiveMagicPrompt } from '@/lib/magicPrompt';
import { type ToolItem } from '@/data/tools';
import { getToolBySlug, getAllPublicTools } from '@/services/tools';
import { toast } from 'sonner';
import '@/styles/tool-detail.css';

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

function delay(seconds: number): CSSProperties {
  return { '--t': `${seconds}s` } as CSSProperties;
}

function isJsonLike(command: string) {
  const trimmed = command.trim();
  return trimmed.startsWith('{') || trimmed.startsWith('[');
}

function prettyJson(command: string) {
  try {
    return JSON.stringify(JSON.parse(command), null, 2);
  } catch {
    return command;
  }
}

function renderJson(code: string) {
  return code.split('\n').map((line, index) => {
    const match = line.match(/^(\s*)("(?:[^"\\]|\\.)*")(\s*:)?(.*)$/);
    if (!match) return <div key={index}>{line}</div>;
    return (
      <div key={index}>
        {match[1]}
        <b>{match[2]}</b>
        {match[3]}
        {match[4]}
      </div>
    );
  });
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
        title="Tool Not Found | ZYR0 ToolHub"
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

export default function ToolDetail() {
  const { slug } = useParams<{ slug: string }>();

  const [tool, setTool] = useState<ToolItem | null | 'loading'>('loading');
  const [recommended, setRecommended] = useState<ToolItem[]>([]);
  const [activeCommand, setActiveCommand] = useState(0);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (!slug) {
      setTool(null);
      return;
    }
    let mounted = true;
    setTool('loading');
    setActiveCommand(0);
    setCopiedCommand(null);
    setCopiedPrompt(false);
    setLinkCopied(false);

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
            if (candidate.subcategory && candidate.subcategory === data.subcategory) score += 2;
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
    window.setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleCopyCommand = async (command: string, key: string) => {
    if (!(await copyToClipboard(command))) {
      toast.error('Failed to copy command');
      return;
    }
    setCopiedCommand(key);
    window.setTimeout(() => {
      setCopiedCommand((current) => (current === key ? null : current));
    }, 1600);
  };

  const handleCopyMagicPrompt = async (promptText: string) => {
    if (!(await copyToClipboard(promptText))) {
      toast.error('Failed to copy Magic Prompt');
      return;
    }
    setCopiedPrompt(true);
    toast.success('Magic Prompt copied! Paste into your AI agent.');
    window.setTimeout(() => setCopiedPrompt(false), 2000);
  };

  if (tool === 'loading') {
    return (
      <div className="min-h-page bg-background">
        <ToolDetailSkeleton />
      </div>
    );
  }

  if (!tool) return <ToolNotFound />;

  const isSkill = tool.item_type === 'skill';
  const commands =
    tool.installCommands && tool.installCommands.length > 0
      ? tool.installCommands
      : tool.installCommand
        ? [{ label: isSkill ? 'Invocation command' : 'Installation command', command: tool.installCommand }]
        : [];
  const active = commands[activeCommand] ?? commands[0];
  const hasCommands = commands.length > 0;

  const seoTitle = tool.seoTitle || `${tool.name} | ${getTypeLabel(tool.item_type)} in ${tool.category}`;
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

  const facts = [
    { label: 'type', value: getTypeLabel(tool.item_type) },
    { label: 'category', value: tool.category },
    ...(tool.subcategory ? [{ label: 'subcategory', value: tool.subcategory }] : []),
    ...(tool.version ? [{ label: 'version', value: tool.version }] : []),
    { label: 'source', value: tool.source },
    ...(tool.author?.name ? [{ label: 'author', value: tool.author.name }] : []),
    ...(tool.badge ? [{ label: 'badge', value: tool.badge }] : []),
  ];

  const canonicalPath = `/tools/${tool.slug}`;
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

  const commandDescription = isSkill
    ? 'Run this in your agent to invoke the skill.'
    : 'Run the command that matches your setup.';

  return (
    <div className="tdp" data-theme="dark">
      <SEO
        title={seoTitle}
        description={seoDescription}
        path={canonicalPath}
        image={seoImage}
        keywords={tool.tags.join(', ')}
        structuredData={structuredData}
      />

      <div className="wrap">
        <div className="top in">
          <span>
            <Link to="/tools">toolhub</Link> / {tool.category.toLowerCase()} / {tool.slug}
          </span>
          <div className="top-actions">
            <button type="button" onClick={handleCopyLink}>
              {linkCopied ? 'link copied' : 'copy link'}
            </button>
            <a href={tool.sourceUrl} {...externalProps(tool.sourceUrl)}>
              {sourceLabel.toLowerCase()} ↗
            </a>
          </div>
        </div>

        <header>
          <h1 className="in" style={delay(0.05)}>
            {tool.name}
          </h1>
          <p className="lede in" style={delay(0.15)}>
            {tool.tagline}
          </p>
          {hasCommands && (
            <div className="hero-cmd in" style={delay(0.3)}>
              <code>
                <i>$ </i>
                {commands[0].command}
              </code>
              <button
                type="button"
                className={`cp${copiedCommand === 'hero' ? ' ok' : ''}`}
                onClick={() => handleCopyCommand(commands[0].command, 'hero')}
              >
                {copiedCommand === 'hero' ? 'copied' : 'copy'}
              </button>
            </div>
          )}
          <dl className="facts in" style={delay(0.45)}>
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <section className="row" id="magic-prompt">
          <div className="lab">magic prompt</div>
          <div>
            <h2>Run with AI Agent</h2>
            <p>
              Copy and paste this prompt directly into your AI agent (Claude Code, Gemini CLI, Cursor, Antigravity, or ChatGPT). The agent will configure, execute, and follow best practices automatically.
            </p>
            {(() => {
              const promptText = getEffectiveMagicPrompt(tool);
              return (
                <div className="magic-blk">
                  <div className="magic-bh">
                    <span className="magic-badge">
                      <Wand2 className="h-3.5 w-3.5" />
                      Agent Instructions
                    </span>
                    <button
                      type="button"
                      className={copiedPrompt ? 'ok' : ''}
                      onClick={() => handleCopyMagicPrompt(promptText)}
                    >
                      {copiedPrompt ? 'copied prompt!' : 'copy magic prompt'}
                    </button>
                  </div>
                  <pre className="magic-pre">{promptText}</pre>
                </div>
              );
            })()}
          </div>
        </section>

        {hasCommands && (
          <section className="row" id="install">
            <div className="lab">install</div>
            <div>
              <h2>{isSkill ? 'How to invoke it' : 'Pick how you want to run it'}</h2>
              <div className="tabs" role="tablist" aria-label="Commands">
                {commands.map((command, index) => (
                  <button
                    key={`${command.label}-${index}`}
                    type="button"
                    role="tab"
                    aria-selected={index === activeCommand}
                    onClick={() => setActiveCommand(index)}
                  >
                    {command.label || (isSkill ? 'Invocation command' : 'Installation command')}
                  </button>
                ))}
              </div>
              <div role="tabpanel">
                <p>{commandDescription}</p>
                {active && (
                  <div className="blk">
                    <div className="bh">
                      <span>{active.label || (isSkill ? 'Invocation command' : 'Installation command')}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCommand(active.command, `cmd-${activeCommand}`)}
                      >
                        {copiedCommand === `cmd-${activeCommand}` ? 'copied' : 'copy'}
                      </button>
                    </div>
                    <pre>
                      {isJsonLike(active.command)
                        ? renderJson(prettyJson(active.command))
                        : active.command.split('\n').map((line, index) => (
                            <div key={index}>
                              <i>$ </i>
                              {line}
                            </div>
                          ))}
                    </pre>
                  </div>
                )}
              </div>
              {tool.installInstructions && (
                <div className="notes">
                  <p className="note">install notes</p>
                  <p className="pre-line">{tool.installInstructions}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {!hasCommands && tool.installInstructions && (
          <section className="row" id="notes">
            <div className="lab">setup notes</div>
            <div>
              <h2>Before you install</h2>
              <p className="pre-line">{tool.installInstructions}</p>
            </div>
          </section>
        )}

        {tool.description.trim() && (
          <section className="row" id="overview">
            <div className="lab">overview</div>
            <div className="rd">
              <MarkdownContent content={tool.description} />
            </div>
          </section>
        )}

        {tool.capabilities.length > 0 && (
          <section className="row" id="capabilities">
            <div className="lab">capabilities</div>
            <div>
              <h2>{isSkill ? 'What it can do' : 'Key features'}</h2>
              <ul className="agents">
                {tool.capabilities.map((capability, index) => {
                  const [label, value] = splitCapability(capability);
                  return (
                    <li key={`${capability}-${index}`}>
                      {label}
                      {value ? <span className="cap-value">{value}</span> : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {recommended.length > 0 && (
          <section className="row" id="related">
            <div className="lab">related</div>
            <div>
              <h2>More from ToolHub</h2>
              <div className="related">
                {recommended.map((item) => (
                  <Link key={item.id} to={`/tools/${item.slug}`}>
                    <span className="related-name">{item.name}</span>
                    <span className="related-tagline">{item.tagline}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="side">
          {tool.tags.map((tag) => (
            <Link key={tag} to={`/tools?q=${encodeURIComponent(tag)}`}>
              #{tag}
            </Link>
          ))}
          <a href={tool.sourceUrl} {...externalProps(tool.sourceUrl)}>
            {sourceLabel.toLowerCase()} ↗
          </a>
          {tool.documentationUrl && (
            <a href={tool.documentationUrl} {...externalProps(tool.documentationUrl)}>
              documentation ↗
            </a>
          )}
          {tool.author?.url && (
            <a href={tool.author.url} {...externalProps(tool.author.url)}>
              {tool.author.name.toLowerCase()} ↗
            </a>
          )}
          <Link to="/tools">browse all →</Link>
        </div>
      </div>
    </div>
  );
}
