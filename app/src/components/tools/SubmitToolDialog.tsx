import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles, Terminal, CheckCircle2, Plus, Trash2, Check, Loader2, Lock, ShieldCheck,
  ArrowRight, UserCheck, ChevronDown, ChevronLeft, ImageIcon, AlertCircle, Save,
  Heading2, Bold, Italic, List, ListOrdered, Link2, Code2, Tag, UserRound, FolderGit2,
  RotateCcw, X, Eye, Pencil, Info, Search, Globe
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { submitTool, updateTool, type SubmitToolInput } from '@/services/tools';
import { coverGradient } from '@/data/tools';
import type { DbTool, ToolInstallCommand } from '@/lib/database.types';
import { slugify } from '@/lib/slug';
import { splitCapability } from '@/lib/capability';
import { MarkdownContent } from '@/components/markdown/MarkdownContent';
import { BASE_URL } from '@/config/seo';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  TOOL_FORM_CATEGORIES,
  TOOL_FORM_SOURCES,
  SEO_DESCRIPTION_MAX,
  SEO_TITLE_MAX,
  applyMarkdownAction,
  buildSeoDescription,
  buildSeoTitle,
  clearToolDraft,
  isDraftEmpty,
  loadToolDraft,
  normalizeUrl,
  parseLines,
  parseTags,
  saveToolDraft,
  type MarkdownAction,
  type ToolDraft,
} from './submitToolForm';

interface SubmitToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  tool?: DbTool | null;
}

type Stage = 1 | 2 | 3;
type ItemType = 'tool' | 'skill' | 'tool_skill';
type FieldKey = 'name' | 'tagline' | 'description' | 'sourceUrl' | 'imageUrl' | 'slug';
type FieldErrors = Partial<Record<FieldKey, string>>;

const inputCls =
  'w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-[var(--zyro-accent)] focus-visible:ring-2 focus-visible:ring-[var(--zyro-accent)]/20';
const inputErrorCls = 'border-red-500/70 focus-visible:border-red-500 focus-visible:ring-red-500/20';
const SEARCH_PREVIEW_DOMAIN = BASE_URL.replace(/^https?:\/\//, '').replace(/\/+$/, '');

const STAGES: { id: Stage; label: string; hint: string }[] = [
  { id: 1, label: 'Basics', hint: 'Source, name, tagline' },
  { id: 2, label: 'Listing content', hint: 'Description, commands, details' },
  { id: 3, label: 'Review', hint: 'Completeness & preview' },
];

const ITEM_TYPES: { id: ItemType; label: string; desc: string }[] = [
  { id: 'tool', label: 'Developer Tool', desc: 'CLI, library, package, UI kit' },
  { id: 'skill', label: 'Agent Skill', desc: 'Automated skill or prompt protocol' },
  { id: 'tool_skill', label: 'Tool + Skill', desc: 'Hybrid tool with agent capabilities' },
];

const QUICK_TAGS = ['Agent', 'Skills', 'CLI', 'LLM', 'MCP', 'Productivity', 'Python', 'TypeScript', 'Rust'];

const MARKDOWN_TOOLS: { label: string; icon: React.ElementType; action: MarkdownAction }[] = [
  { label: 'Heading', icon: Heading2, action: { kind: 'line', prefix: '## ' } },
  { label: 'Bold', icon: Bold, action: { kind: 'inline', before: '**', after: '**', placeholder: 'bold text' } },
  { label: 'Italic', icon: Italic, action: { kind: 'inline', before: '*', after: '*', placeholder: 'italic text' } },
  { label: 'Bulleted list', icon: List, action: { kind: 'line', prefix: '- ' } },
  { label: 'Numbered list', icon: ListOrdered, action: { kind: 'line', prefix: '1. ' } },
  { label: 'Link', icon: Link2, action: { kind: 'inline', before: '[', after: '](https://)', placeholder: 'link text' } },
  { label: 'Code block', icon: Code2, action: { kind: 'inline', before: '```\n', after: '\n```', placeholder: 'code' } },
];

function commandPlaceholder(label: string) {
  const value = label.toLowerCase();
  if (value.includes('update')) return 'npm update -g example';
  if (value.includes('run')) return 'npx example';
  if (value.includes('invoke')) return 'npx example --help';
  if (value.includes('uninstall')) return 'npm uninstall -g example';
  if (value.includes('setup')) return 'npx example setup';
  if (value.includes('build')) return 'npm run build';
  if (value.includes('test')) return 'npm test';
  if (value.includes('pip')) return 'pip install example';
  if (value.includes('docker')) return 'docker run -p 8080:8080 example';
  return 'npm install -g example';
}

const COMMAND_LABEL_DEFAULTS = ['Installation command', 'Update command', 'Run command', 'Setup command'];

function defaultCommandLabel(itemType: ItemType, index: number) {
  if (itemType === 'skill') return index === 0 ? 'Invocation command' : 'Run command';
  return COMMAND_LABEL_DEFAULTS[Math.min(index, COMMAND_LABEL_DEFAULTS.length - 1)];
}

function FieldError({ id, msg }: { id?: string; msg?: string }) {
  return msg ? (
    <p id={id} className="mt-1 flex items-center gap-1 text-[11px] text-red-500">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {msg}
    </p>
  ) : null;
}

function FieldLabel({
  htmlFor,
  children,
  required,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-xs font-semibold text-foreground">
        {children}
        {required && (
          <>
            <span aria-hidden="true" className="ml-0.5 text-red-500">*</span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>
      {hint && <span className="shrink-0 text-[10px] text-muted-foreground">{hint}</span>}
    </div>
  );
}

function StageHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1">
      <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function FormSection({
  icon: Icon,
  title,
  hint,
  summary,
  defaultOpen,
  children,
}: {
  icon: React.ElementType;
  title: string;
  hint?: string;
  summary?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="group rounded-xl border border-border/70 bg-card">
      <CollapsibleTrigger className="flex w-full items-center gap-2.5 px-4 py-3 text-left outline-none transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--zyro-accent)]/30 rounded-xl">
        <Icon className="h-4 w-4 shrink-0 text-[var(--zyro-accent)]" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">{title}</span>
          {hint && <span className="block text-[11px] text-muted-foreground">{hint}</span>}
        </span>
        {summary && (
          <span className="hidden max-w-[45%] truncate text-[11px] text-muted-foreground sm:block">{summary}</span>
        )}
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 border-t border-border/60 px-4 py-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

interface ListingPreviewProps {
  draft: ToolDraft;
  imageState: 'idle' | 'loading' | 'ok' | 'error';
  onImageLoad: () => void;
  onImageError: () => void;
  badge?: string;
  featured?: boolean;
  coverColor?: string;
}

/** Mirrors the public directory listing (ToolPreviewDialog) using only form state. */
function ListingPreview({
  draft,
  imageState,
  onImageLoad,
  onImageError,
  badge,
  featured,
  coverColor,
}: ListingPreviewProps) {
  const tags = parseTags(draft.tagsInput);
  const capabilities = parseLines(draft.capabilitiesInput);
  const commands = draft.commands
    .map((command) => ({
      label: command.label.trim() || (draft.itemType === 'skill' ? 'Invocation command' : 'Installation command'),
      command: command.command.trim(),
    }))
    .filter((command) => command.command);
  const initials = (draft.name.trim() || '?')
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const showImage = Boolean(draft.imageUrl.trim()) && imageState !== 'error';
  const typeLabel = draft.itemType === 'tool_skill' ? 'Tool + Skill' : draft.itemType;
  const author = draft.authorName.trim() || 'Community Builder';

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      {/* Hero — same language as ToolCard / ToolPreviewDialog */}
      <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border/40 bg-[var(--zyro-twilight)]">
        {showImage ? (
          <>
            <img
              src={draft.imageUrl}
              alt={`${draft.name || 'Listing'} cover`}
              onLoad={onImageLoad}
              onError={onImageError}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" aria-hidden="true" />
          </>
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: coverGradient(coverColor) }} aria-hidden="true" />
            <div
              className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:18px_18px]"
              aria-hidden="true"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="select-none font-serif text-5xl text-white/15 sm:text-6xl">{initials}</span>
            </div>
          </>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-white/25 bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {draft.source}
          </span>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-mono capitalize backdrop-blur-sm ${
              draft.itemType === 'skill'
                ? 'border-purple-300/40 bg-purple-500/30 text-purple-100'
                : draft.itemType === 'tool_skill'
                ? 'border-emerald-300/40 bg-emerald-500/30 text-emerald-100'
                : 'border-white/25 bg-white/15 text-white'
            }`}
          >
            {typeLabel}
          </span>
          {badge && (
            <span className="rounded-full bg-[var(--zyro-accent)] px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
              {badge}
            </span>
          )}
          {featured && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              <Sparkles className="h-2.5 w-2.5" />
              Featured
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <h3 className={`font-serif text-xl leading-tight tracking-tight sm:text-2xl ${showImage ? 'text-white drop-shadow-md' : 'text-white'}`}>
            {draft.name.trim() || 'Your tool or skill'}
          </h3>
          <p className={`mt-1 line-clamp-2 text-xs sm:text-sm ${showImage ? 'text-white/85' : 'text-white/80'}`}>
            {draft.tagline.trim() || 'Your one-sentence tagline will appear here.'}
          </p>
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-[var(--zyro-accent)]/20 bg-[var(--zyro-accent-muted)] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--zyro-accent)]">
            {draft.category}
          </span>
          {draft.version.trim() && (
            <span className="rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
              {draft.version.trim()}
            </span>
          )}
        </div>

        {commands.length > 0 && (
          <section>
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Commands</h4>
            <div className="space-y-1.5">
              {commands.map((command) => (
                <div key={`${command.label}-${command.command}`} className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
                  <div className="border-b border-neutral-800 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-neutral-400">
                    {command.label}
                  </div>
                  <pre className="overflow-x-auto p-2.5 font-mono text-[11px] text-emerald-300">
                    <span className="select-none text-neutral-500">$ </span>
                    {command.command}
                  </pre>
                </div>
              ))}
            </div>
            {draft.installInstructions.trim() && (
              <p className="mt-2 flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <Info className="mt-px h-3 w-3 shrink-0 text-[var(--zyro-accent)]" />
                <span>{draft.installInstructions}</span>
              </p>
            )}
          </section>
        )}

        <section>
          <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">About</h4>
          {draft.description.trim() ? (
            <MarkdownContent content={draft.description} className="text-[13px]" />
          ) : (
            <p className="text-xs italic text-muted-foreground">
              Your rendered Markdown description will appear here.
            </p>
          )}
        </section>

        {capabilities.length > 0 && (
          <section>
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {draft.itemType === 'skill' ? 'Capabilities' : 'Key features'}
            </h4>
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {capabilities.map((capability) => {
                const [label, value] = splitCapability(capability);
                return (
                  <li
                    key={capability}
                    className="flex items-start justify-between gap-2 rounded-lg border border-[var(--zyro-accent)]/15 bg-[var(--zyro-accent-muted)] p-2 text-[11px] text-foreground/85"
                  >
                    <span className="flex min-w-0 items-start gap-1.5">
                      <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[var(--zyro-accent)]">
                        <Check className="h-2 w-2 text-white" strokeWidth={3} />
                      </span>
                      <span className="leading-snug">{label}</span>
                    </span>
                    {value && (
                      <span className="shrink-0 rounded border border-border/50 bg-background/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground">
                        {value}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {tags.length > 0 && (
          <section>
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tags</h4>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="border-t border-border/50 pt-4">
          <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Details</h4>
          <dl className="space-y-1.5 text-[11px]">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">Author</dt>
              <dd className="text-right font-medium text-foreground">{author}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">Source</dt>
              <dd className="text-right font-medium text-foreground">{draft.source}</dd>
            </div>
            {draft.version.trim() && (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Version</dt>
                <dd className="text-right font-mono font-medium text-foreground">{draft.version.trim()}</dd>
              </div>
            )}
            {draft.docUrl.trim() && (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Documentation</dt>
                <dd className="truncate text-right font-medium text-[var(--zyro-accent)]">{draft.docUrl.trim()}</dd>
              </div>
            )}
            {draft.authorUrl.trim() && (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Author profile</dt>
                <dd className="truncate text-right font-medium text-[var(--zyro-accent)]">{draft.authorUrl.trim()}</dd>
              </div>
            )}
          </dl>
        </section>
      </div>
    </div>
  );
}

function PreviewColumn(props: ListingPreviewProps) {
  return (
    <div className="lg:sticky lg:top-0 lg:self-start">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Live listing preview
        </span>
        <span className="text-[10px] text-muted-foreground">Updates as you type</span>
      </div>
      <ListingPreview {...props} />
      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
        This is how your listing appears in the public directory once approved.
      </p>
    </div>
  );
}

export function SubmitToolDialog({ open, onOpenChange, onSuccess, tool }: SubmitToolDialogProps) {
  const { user, profile } = useAuth();
  const userId = user?.id;

  const [stage, setStage] = useState<Stage>(1);
  const [itemType, setItemType] = useState<ItemType>('tool');
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<(typeof TOOL_FORM_CATEGORIES)[number]>('AI & Agents');
  const [source, setSource] = useState<string>('GitHub');
  const [sourceUrl, setSourceUrl] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [commands, setCommands] = useState<ToolInstallCommand[]>([{ label: 'Installation command', command: '' }]);
  const [installInstructions, setInstallInstructions] = useState('');
  const [magicPrompt, setMagicPrompt] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [capabilitiesInput, setCapabilitiesInput] = useState('');
  const [version, setVersion] = useState('');
  const [authorName, setAuthorName] = useState(profile?.full_name || '');
  const [authorUrl, setAuthorUrl] = useState(profile?.github || profile?.portfolio_url || '');
  const [slug, setSlug] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  const [mdTab, setMdTab] = useState<'write' | 'preview'>('write');
  const [tagDraft, setTagDraft] = useState('');
  const [imageState, setImageState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Admin publishing controls (unchanged permissions)
  const isAdmin = profile?.role === 'admin';
  const [adminStatus, setAdminStatus] = useState<'approved' | 'pending'>('approved');
  const [adminFeatured, setAdminFeatured] = useState(false);
  const [adminBadge, setAdminBadge] = useState('');
  const [adminCoverColor, setAdminCoverColor] = useState('#7B7BDC');

  const descRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const resetTimerRef = useRef<number | null>(null);

  // Single derived draft — the form state is the only source of truth.
  const draft = useMemo<ToolDraft>(
    () => ({
      itemType,
      name,
      tagline,
      description,
      category,
      source,
      sourceUrl,
      docUrl,
      imageUrl,
      commands,
      installInstructions,
      magicPrompt,
      tagsInput,
      capabilitiesInput,
      version,
      authorName,
      authorUrl,
      slug,
      seoTitle,
      seoDescription,
      adminStatus,
      adminFeatured,
      adminBadge,
      adminCoverColor,
    }),
    [
      itemType, name, tagline, description, category, source, sourceUrl, docUrl, imageUrl,
      commands, installInstructions, magicPrompt, tagsInput, capabilitiesInput, version, authorName,
      authorUrl, slug, seoTitle, seoDescription, adminStatus, adminFeatured, adminBadge, adminCoverColor,
    ]
  );

  const previewTags = parseTags(tagsInput);
  const previewCapabilities = parseLines(capabilitiesInput);
  const validCommands = commands
    .map((command) => ({
      label: command.label.trim() || (itemType === 'skill' ? 'Invocation command' : 'Installation command'),
      command: command.command.trim(),
    }))
    .filter((command) => Boolean(command.command));
  const hasContent = !isDraftEmpty(draft);

  const derivedSlug = slugify(name);
  const effectiveSlug = slugify(slug || name);
  const derivedSeoTitle = buildSeoTitle(name, category, itemType);
  const derivedSeoDescription = buildSeoDescription(name, tagline, category, itemType);
  const effectiveSeoTitle = seoTitle.trim() || derivedSeoTitle;
  const effectiveSeoDescription = seoDescription.trim() || derivedSeoDescription;

  const requiredDone = [name, tagline, sourceUrl, description].filter((value) => value.trim()).length;
  const optionalDone = [
    imageUrl,
    docUrl,
    version,
    previewTags.length > 0 ? 'tags' : '',
    validCommands.length > 0 ? 'commands' : '',
    installInstructions,
    previewCapabilities.length > 0 ? 'capabilities' : '',
    authorUrl,
  ].filter((value) => Boolean(typeof value === 'string' ? value.trim() : value)).length;
  const completeness = Math.round((requiredDone / 4) * 60 + (optionalDone / 8) * 40);

  const missingRequired: { label: string; stage: 1 | 2 }[] = [];
  if (!name.trim()) missingRequired.push({ label: 'Tool / Skill name', stage: 1 });
  if (!tagline.trim()) missingRequired.push({ label: 'One-sentence tagline', stage: 1 });
  if (!sourceUrl.trim()) missingRequired.push({ label: 'Source URL', stage: 1 });
  if (!description.trim()) missingRequired.push({ label: 'Detailed description', stage: 2 });
  if (!effectiveSlug) missingRequired.push({ label: 'URL slug', stage: 2 });

  const validationErrors = (Object.entries(errors) as [FieldKey, string | undefined][]).filter(
    ([, message]) => Boolean(message)
  );
  const errorLabels: Record<FieldKey, string> = {
    name: 'Tool / Skill name',
    tagline: 'One-sentence tagline',
    description: 'Detailed description',
    sourceUrl: 'Source URL',
    imageUrl: 'Cover image URL',
    slug: 'URL slug',
  };

  const resetForm = () => {
    setStage(1);
    setItemType('tool');
    setName('');
    setTagline('');
    setDescription('');
    setCategory('AI & Agents');
    setSource('GitHub');
    setSourceUrl('');
    setDocUrl('');
    setImageUrl('');
    setCommands([{ label: 'Installation command', command: '' }]);
    setInstallInstructions('');
    setTagsInput('');
    setCapabilitiesInput('');
    setVersion('');
    setAuthorName(profile?.full_name || '');
    setAuthorUrl(profile?.github || profile?.portfolio_url || '');
    setSlug('');
    setSeoTitle('');
    setSeoDescription('');
    setAdminStatus('approved');
    setAdminFeatured(false);
    setAdminBadge('');
    setAdminCoverColor('#7B7BDC');
    setMdTab('write');
    setTagDraft('');
    setImageState('idle');
    setDraftRestored(false);
    setDraftSavedAt(null);
    setErrors({});
    setSubmitError(null);
    setSubmitting(false);
    setSubmittedSuccess(false);
  };

  // Cancel a pending close-reset when the dialog is reopened.
  useEffect(() => {
    if (!open || !resetTimerRef.current) return;
    window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = null;
  }, [open]);

  // Editing starts from the saved listing, never from the browser draft.
  useEffect(() => {
    if (!open || !tool) return;
    setStage(1);
    setItemType(tool.item_type);
    setName(tool.name);
    setTagline(tool.tagline);
    setDescription(tool.description);
    setCategory(tool.category);
    setSource(tool.source);
    setSourceUrl(tool.source_url);
    setDocUrl(tool.documentation_url || '');
    setImageUrl(tool.image_url || '');
    setImageState(tool.image_url ? 'loading' : 'idle');
    setCommands(
      tool.install_commands && tool.install_commands.length > 0
        ? tool.install_commands
        : [{ label: defaultCommandLabel(tool.item_type, 0), command: tool.install_command || '' }]
    );
    setInstallInstructions(tool.install_instructions || '');
    setMagicPrompt(tool.magic_prompt || '');
    setTagsInput((tool.tags || []).join(', '));
    setCapabilitiesInput((tool.capabilities || []).join('\n'));
    setVersion(tool.version || '');
    setAuthorName(tool.author_name || '');
    setAuthorUrl(tool.author_url || '');
    setSlug(tool.slug);
    setSeoTitle(tool.seo_title || '');
    setSeoDescription(tool.seo_description || '');
    setAdminStatus(tool.status === 'approved' ? 'approved' : 'pending');
    setAdminFeatured(tool.featured);
    setAdminBadge(tool.badge || '');
    setAdminCoverColor(tool.cover_color || '#7B7BDC');
    setMdTab('write');
    setTagDraft('');
    setDraftRestored(false);
    setDraftSavedAt(null);
    setErrors({});
    setSubmitError(null);
    setSubmitting(false);
    setSubmittedSuccess(false);
  }, [open, tool]);

  // Each stage starts at the top of the scroll area.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [stage]);

  // Restore a browser-local draft when the dialog opens.
  useEffect(() => {
    if (!open || !userId || tool) return;
    const saved = loadToolDraft(userId);
    if (!saved) return;
    setItemType(saved.itemType);
    setName(saved.name);
    setTagline(saved.tagline);
    setDescription(saved.description);
    setCategory(saved.category);
    setSource(saved.source);
    setSourceUrl(saved.sourceUrl);
    setDocUrl(saved.docUrl);
    setImageUrl(saved.imageUrl);
    setImageState(saved.imageUrl.trim() ? 'loading' : 'idle');
    setCommands(saved.commands.length > 0 ? saved.commands : [{ label: defaultCommandLabel(saved.itemType, 0), command: '' }]);
    setInstallInstructions(saved.installInstructions);
    setMagicPrompt(saved.magicPrompt || '');
    setTagsInput(saved.tagsInput);
    setCapabilitiesInput(saved.capabilitiesInput);
    setVersion(saved.version);
    setAuthorName(saved.authorName || profile?.full_name || '');
    setAuthorUrl(saved.authorUrl || profile?.github || profile?.portfolio_url || '');
    setSlug(saved.slug);
    setSeoTitle(saved.seoTitle);
    setSeoDescription(saved.seoDescription);
    setAdminStatus(saved.adminStatus);
    setAdminFeatured(saved.adminFeatured);
    setAdminBadge(saved.adminBadge);
    setAdminCoverColor(saved.adminCoverColor);
    setDraftRestored(true);
    // Draft is loaded once per open; profile only supplies optional author defaults.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  // Autosave (debounced) so closing or reloading never silently loses work.
  useEffect(() => {
    if (!open || !userId || submittedSuccess || tool) return;
    const id = window.setTimeout(() => {
      if (isDraftEmpty(draft)) {
        clearToolDraft(userId);
        return;
      }
      if (saveToolDraft(userId, draft)) setDraftSavedAt(new Date());
    }, 800);
    return () => window.clearTimeout(id);
  }, [open, userId, draft, submittedSuccess, tool]);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!tagline.trim()) next.tagline = 'Tagline is required';
    if (!description.trim()) next.description = 'Description is required';
    const cleanSource = normalizeUrl(sourceUrl, source);
    if (!cleanSource) {
      next.sourceUrl = 'Source URL is required';
    } else if (!/^https?:\/\/.+/i.test(cleanSource)) {
      next.sourceUrl = 'Must be a valid URL';
    }
    if (imageUrl.trim() && !/^https?:\/\/.+/i.test(imageUrl.trim())) {
      next.imageUrl = 'Must be a valid http(s) URL';
    }
    const cleanSlug = slugify(slug || name);
    if (!cleanSlug) {
      next.slug = 'Add a URL slug using letters, numbers, and hyphens';
    } else if (cleanSlug.length < 2) {
      next.slug = 'Use at least 2 characters';
    }
    return next;
  };

  const clearError = (field: FieldKey) => {
    setErrors((previous) => (previous[field] ? { ...previous, [field]: undefined } : previous));
  };

  const generateSeo = () => {
    setSlug(derivedSlug);
    setSeoTitle(derivedSeoTitle);
    setSeoDescription(derivedSeoDescription);
    clearError('slug');
  };

  const handleSlugBlur = () => {
    const clean = slugify(slug);
    if (clean) setSlug(clean);
    clearError('slug');
  };

  const handleImageUrlChange = (value: string) => {
    setImageUrl(value);
    clearError('imageUrl');
    setImageState(value.trim() ? 'loading' : 'idle');
  };

  const goToStage = (next: Stage) => {
    if (next === 3) setErrors(validate());
    setSubmitError(null);
    setStage(next);
  };

  const continueFromBasics = () => {
    const next = validate();
    const basics: FieldErrors = { name: next.name, tagline: next.tagline, sourceUrl: next.sourceUrl };
    setErrors((previous) => ({ ...previous, ...basics }));
    if (basics.name || basics.tagline || basics.sourceUrl) {
      toast.error('Add the required basic details to continue');
      return;
    }
    setStage(2);
  };

  const formatDescription = (action: MarkdownAction) => {
    const element = descRef.current;
    const start = element?.selectionStart ?? description.length;
    const end = element?.selectionEnd ?? description.length;
    const result = applyMarkdownAction(description, start, end, action);
    setDescription(result.value);
    clearError('description');
    window.requestAnimationFrame(() => {
      if (!element) return;
      element.focus();
      element.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  const handleAddCommand = () => {
    setCommands((previous) => [...previous, { label: defaultCommandLabel(itemType, previous.length), command: '' }]);
  };

  const handleRemoveCommand = (index: number) => {
    setCommands((previous) => previous.filter((_, i) => i !== index));
  };

  const handleCommandChange = (index: number, field: 'label' | 'command', value: string) => {
    setCommands((previous) => {
      const next = [...previous];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const commitTag = () => {
    const tag = tagDraft.trim().replace(/^#/, '');
    setTagDraft('');
    if (!tag) return;
    if (previewTags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) return;
    setTagsInput([...previewTags, tag].join(', '));
  };

  const addTag = (tag: string) => {
    if (previewTags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) return;
    setTagsInput([...previewTags, tag].join(', '));
  };

  const removeTag = (tag: string) => {
    setTagsInput(previewTags.filter((existing) => existing !== tag).join(', '));
  };

  const handleSaveDraft = () => {
    if (!user || tool) return;
    if (saveToolDraft(user.id, draft)) {
      setDraftSavedAt(new Date());
      toast.success('Draft saved on this device');
    } else {
      toast.error('This browser blocked local storage, so the draft could not be saved');
    }
  };

  const handleStartOver = () => {
    if (user) clearToolDraft(user.id);
    resetForm();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    if (nextOpen) return;
    if (user && hasContent && !submittedSuccess && !tool) saveToolDraft(user.id, draft);
    resetTimerRef.current = window.setTimeout(() => {
      resetForm();
      resetTimerRef.current = null;
    }, 200);
  };

  const submitListing = async () => {
    if (!user) {
      toast.error('Please sign in to submit a tool or skill');
      return;
    }

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      setStage(3);
      setSubmitError('Some required details are missing or invalid. Review the checklist above.');
      toast.error('Please fix the highlighted fields');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const input: SubmitToolInput = {
        name: name.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        item_type: itemType,
        category,
        slug: effectiveSlug,
        seo_title: effectiveSeoTitle,
        seo_description: effectiveSeoDescription,
        tags: previewTags,
        source: source.trim(),
        source_url: normalizeUrl(sourceUrl, source),
        documentation_url: docUrl.trim() ? normalizeUrl(docUrl) : undefined,
        image_url: imageUrl.trim() || undefined,
        capabilities: previewCapabilities,
        install_command: validCommands[0]?.command || undefined,
        install_commands: validCommands.length > 0 ? validCommands : undefined,
        install_instructions: installInstructions.trim() || undefined,
        magic_prompt: magicPrompt.trim() || undefined,
        version: version.trim() || undefined,
        author_name: authorName.trim() || profile?.full_name || 'Community Builder',
        author_url: authorUrl.trim() ? normalizeUrl(authorUrl) : undefined,
        ...(isAdmin
          ? {
              status: adminStatus,
              featured: adminFeatured,
              badge: adminBadge.trim(),
              cover_color: adminCoverColor.trim(),
            }
          : {}),
      };

      if (tool) {
        await updateTool(tool.id, input);
        toast.success(
          isAdmin && adminStatus === 'approved'
            ? 'Listing updated and published live!'
            : 'Listing updated.'
        );
      } else {
        await submitTool(input, user.id);
        clearToolDraft(user.id);
        if (isAdmin && adminStatus === 'approved') {
          toast.success('Tool has been created and published live directly!');
        } else {
          toast.success('Your submission has been received and queued for moderation!');
        }
      }
      setSubmittedSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Submission error:', err);
      const message = err?.message || 'Failed to submit tool';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const onFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (stage === 1) {
      continueFromBasics();
    } else if (stage === 2) {
      goToStage(3);
    } else {
      submitListing();
    }
  };

  const stageItem = (id: Stage) => {
    const done = id < stage;
    return (
      <button
        key={id}
        type="button"
        onClick={() => goToStage(id)}
        aria-current={stage === id ? 'step' : undefined}
        className={`flex min-w-0 items-center gap-2 rounded-lg border px-2 py-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--zyro-accent)]/40 sm:px-3 ${
          stage === id
            ? 'border-[var(--zyro-accent)]/40 bg-[var(--zyro-accent-muted)]'
            : 'border-transparent hover:bg-muted/50'
        }`}
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${
            stage === id || done
              ? 'border-[var(--zyro-accent)] bg-[var(--zyro-accent)] text-white'
              : 'border-border text-muted-foreground'
          }`}
        >
          {done ? <Check className="h-3 w-3" strokeWidth={3} /> : id}
        </span>
        <span className="min-w-0">
          <span className={`block truncate text-xs font-semibold ${stage === id ? 'text-foreground' : 'text-muted-foreground'}`}>
            <span className="sm:hidden">{id === 1 ? 'Basics' : id === 2 ? 'Content' : 'Review'}</span>
            <span className="hidden sm:inline">{STAGES[id - 1].label}</span>
          </span>
          <span className="hidden truncate text-[10px] text-muted-foreground sm:block">{STAGES[id - 1].hint}</span>
        </span>
      </button>
    );
  };

  const draftBanner = !tool && draftRestored ? (
    <div className="flex items-start gap-2 rounded-lg border border-[var(--zyro-accent)]/25 bg-[var(--zyro-accent-muted)] px-3 py-2 text-[11px] text-foreground/90">
      <RotateCcw className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--zyro-accent)]" />
      <p className="flex-1">
        A draft saved in this browser was restored.{' '}
        <button type="button" onClick={handleStartOver} className="font-semibold underline underline-offset-2">
          Start over
        </button>
      </p>
      <button
        type="button"
        onClick={() => setDraftRestored(false)}
        className="rounded p-0.5 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss draft notice"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  ) : null;

  const previewProps: ListingPreviewProps = {
    draft,
    imageState,
    onImageLoad: () => setImageState('ok'),
    onImageError: () => setImageState('error'),
    badge: isAdmin ? adminBadge.trim() : tool?.badge || '',
    featured: isAdmin ? adminFeatured : tool?.featured ?? false,
    coverColor: isAdmin ? adminCoverColor : tool?.cover_color || undefined,
  };

  const reviewTitle = tool
    ? 'Review and save'
    : isAdmin && adminStatus === 'approved'
      ? 'Review and publish'
      : 'Review and submit';
  const finalActionLabel = tool
    ? isAdmin && adminStatus === 'approved'
      ? 'Save and publish'
      : 'Save changes'
    : isAdmin
      ? adminStatus === 'approved'
        ? 'Publish live'
        : 'Submit as pending'
      : 'Submit for review';

  const successLive = isAdmin && adminStatus === 'approved';
  const successTitle = tool ? 'Listing updated!' : successLive ? 'Tool published live!' : 'Submission queued!';
  const successBody = tool
    ? successLive
      ? 'Your changes are live in the ToolHub catalog.'
      : 'Your changes are saved and remain queued for moderator review.'
    : successLive
      ? 'Your tool or skill is now live in the ToolHub catalog and can be discovered immediately.'
      : 'Thank you for contributing! Once a moderator approves your listing, it will appear in the ToolHub catalog.';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[94vh] flex-col gap-0 overflow-hidden border-border/80 bg-card p-0 sm:max-w-6xl">
        <DialogHeader className="shrink-0 space-y-1.5 border-b border-border/60 bg-gradient-to-br from-[var(--zyro-accent-muted)] via-card to-card px-5 pb-3 pt-5 pr-14 text-left sm:px-7">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-md border border-[var(--zyro-accent)]/20 bg-[var(--zyro-accent-muted)] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--zyro-accent)]">
            <Sparkles className="h-3 w-3" />
            <span>Community Registry</span>
          </div>
          <DialogTitle className="font-sans text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {tool ? 'Edit Tool or Agent Skill' : 'Submit a Tool or Agent Skill'}
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {!user
              ? 'Sign in to publish a tool or skill to the ZYR0 directory.'
              : submittedSuccess
              ? successBody
              : tool
                ? 'Update the listing, then review the changes before saving.'
                : 'Three short steps: basics, listing content, then a final review before submitting.'}
          </DialogDescription>

          {user && !submittedSuccess && (
            <>
              <p className="pt-1 text-[10px] text-muted-foreground">
                <span className="text-red-500">*</span> Required field
              </p>
              <nav aria-label="Submission steps" className="grid grid-cols-3 gap-1">
                {STAGES.map((item) => stageItem(item.id))}
              </nav>
              <div className="h-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-[var(--zyro-accent)] transition-all duration-300"
                  style={{ width: `${(stage / 3) * 100}%` }}
                />
              </div>
            </>
          )}
        </DialogHeader>

        {!user ? (
          <div className="space-y-5 overflow-y-auto px-5 py-6 sm:px-7">
            <div className="rounded-xl border border-[var(--zyro-accent)]/25 bg-[var(--zyro-accent-muted)] p-5 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--zyro-accent)]/30 bg-[var(--zyro-accent)]/10">
                <Lock className="h-5 w-5 text-[var(--zyro-accent)]" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Sign in to submit your tool</h3>
              <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
                You need an active ZYR0 account to publish packages, verify ownership, and track moderation.
              </p>
              <div className="mx-auto mt-4 grid max-w-md grid-cols-1 gap-2 border-t border-border/60 pt-4 text-left text-xs sm:grid-cols-2">
                <span className="flex items-center gap-2 text-foreground/90">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                  Developer profile credit
                </span>
                <span className="flex items-center gap-2 text-foreground/90">
                  <UserCheck className="h-4 w-4 shrink-0 text-[var(--zyro-accent)]" />
                  Moderation tracking
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-end gap-2 sm:flex-row sm:items-center">
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} className="text-xs">
                Cancel
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/register?redirect=%2Ftools">Create free account</Link>
              </Button>
              <Button asChild className="gap-2 bg-[var(--zyro-accent)] text-white hover:bg-[var(--zyro-sapphire)]">
                <Link to="/login?redirect=%2Ftools">
                  Sign in to continue
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ) : submittedSuccess ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <CheckCircle2 className="h-14 w-14 text-emerald-500" />
            <h3 className="text-xl font-bold text-foreground">{successTitle}</h3>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{successBody}</p>
            <div className="flex gap-3 pt-3">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
              {!tool && <Button onClick={resetForm}>Submit another</Button>}
            </div>
          </div>
        ) : (
          <form onSubmit={onFormSubmit} className="flex min-h-0 flex-1 flex-col">
            <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
              {stage === 1 && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
                  <div className="min-w-0 space-y-5">
                    <StageHeading
                      title="Basic information"
                      description="Name it, describe it in one line, then point to the source."
                    />
                    {draftBanner}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <FieldLabel htmlFor="st-name" required>
                          Tool / Skill name
                        </FieldLabel>
                        <input
                          id="st-name"
                          type="text"
                          placeholder="e.g. Ripgrep or Claude Coder"
                          value={name}
                          onChange={(event) => {
                            setName(event.target.value);
                            clearError('name');
                          }}
                          aria-invalid={Boolean(errors.name)}
                          aria-describedby={errors.name ? 'st-name-error' : undefined}
                          className={`${inputCls} ${errors.name ? inputErrorCls : ''}`}
                        />
                        <FieldError id="st-name-error" msg={errors.name} />
                      </div>

                      <div className="space-y-1.5">
                        <FieldLabel htmlFor="st-category" required>
                          Category
                        </FieldLabel>
                        <select
                          id="st-category"
                          value={category}
                          onChange={(event) => setCategory(event.target.value as (typeof TOOL_FORM_CATEGORIES)[number])}
                          className={`${inputCls} cursor-pointer`}
                        >
                          {TOOL_FORM_CATEGORIES.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <FieldLabel htmlFor="st-tagline" required hint="One sentence">
                        Tagline
                      </FieldLabel>
                      <input
                        id="st-tagline"
                        type="text"
                        placeholder="A blazingly fast search tool for code and text"
                        value={tagline}
                        onChange={(event) => {
                          setTagline(event.target.value);
                          clearError('tagline');
                        }}
                        aria-invalid={Boolean(errors.tagline)}
                        aria-describedby={errors.tagline ? 'st-tagline-error' : undefined}
                        className={`${inputCls} ${errors.tagline ? inputErrorCls : ''}`}
                      />
                      <FieldError id="st-tagline-error" msg={errors.tagline} />
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground">
                        Item classification
                        <span aria-hidden="true" className="ml-0.5 text-red-500">*</span>
                        <span className="sr-only"> (required)</span>
                      </p>
                      <div role="radiogroup" aria-label="Item classification" aria-required="true" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {ITEM_TYPES.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            role="radio"
                            aria-checked={itemType === type.id}
                            onClick={() => setItemType(type.id)}
                            className={`rounded-xl border p-3 text-left transition-colors ${
                              itemType === type.id
                                ? 'border-[var(--zyro-accent)] bg-[var(--zyro-accent-muted)] ring-1 ring-[var(--zyro-accent)]'
                                : 'border-border/70 bg-card hover:bg-muted/40'
                            }`}
                          >
                            <span className="block text-xs font-semibold text-foreground">{type.label}</span>
                            <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{type.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
                      <div className="space-y-1.5">
                        <FieldLabel htmlFor="st-source" required>
                          Source platform
                        </FieldLabel>
                        <select
                          id="st-source"
                          value={source}
                          onChange={(event) => setSource(event.target.value)}
                          className={`${inputCls} cursor-pointer`}
                        >
                          {TOOL_FORM_SOURCES.map((option) => (
                            <option key={option} value={option}>
                              {option === 'ZYR0 Native' ? 'ZYR0 Native (Built-in)' : option === 'Web' ? 'Official website' : option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <FieldLabel htmlFor="st-source-url" required hint="GitHub shorthand like org/repo works">
                          Source URL
                        </FieldLabel>
                        <input
                          id="st-source-url"
                          type="text"
                          inputMode="url"
                          placeholder="https://github.com/org/repo"
                          value={sourceUrl}
                          onChange={(event) => {
                            setSourceUrl(event.target.value);
                            clearError('sourceUrl');
                          }}
                          aria-invalid={Boolean(errors.sourceUrl)}
                          aria-describedby={errors.sourceUrl ? 'st-source-url-error' : undefined}
                          className={`${inputCls} font-mono ${errors.sourceUrl ? inputErrorCls : ''}`}
                        />
                        <FieldError id="st-source-url-error" msg={errors.sourceUrl} />
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                          The repository, package, or official page this listing is based on.
                        </p>
                      </div>
                    </div>
                  </div>

                  <aside className="hidden lg:block">
                    <PreviewColumn {...previewProps} />
                  </aside>
                </div>
              )}

              {stage === 2 && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
                  <div className="min-w-0 space-y-5">
                    <StageHeading
                      title="Listing content"
                      description="Write the description, then add commands and the details that help people trust and find it."
                    />
                    {draftBanner}

                    <section className="space-y-2">
                      <div className="flex items-baseline justify-between gap-3">
                        <FieldLabel htmlFor="st-desc" required>
                          Detailed description
                        </FieldLabel>
                        <span className="shrink-0 text-[10px] font-mono text-muted-foreground">
                          {description.length} characters
                        </span>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-border bg-background/60 transition-shadow focus-within:border-[var(--zyro-accent)] focus-within:ring-2 focus-within:ring-[var(--zyro-accent)]/15">
                        <div className="flex flex-wrap items-center gap-0.5 border-b border-border/60 bg-muted/30 px-1.5 py-1">
                          {MARKDOWN_TOOLS.map((tool) => {
                            const Icon = tool.icon;
                            return (
                              <button
                                key={tool.label}
                                type="button"
                                onClick={() => formatDescription(tool.action)}
                                title={tool.label}
                                aria-label={tool.label}
                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zyro-accent)]/40"
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </button>
                            );
                          })}
                          <div className="ml-auto flex items-center gap-0.5 rounded-md border border-border/60 bg-background/70 p-0.5 md:hidden">                            <button
                              type="button"
                              onClick={() => setMdTab('write')}
                              aria-pressed={mdTab === 'write'}
                              className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium ${
                                mdTab === 'write' ? 'bg-muted text-foreground' : 'text-muted-foreground'
                              }`}
                            >
                              <Pencil className="h-3 w-3" />
                              Write
                            </button>
                            <button
                              type="button"
                              onClick={() => setMdTab('preview')}
                              aria-pressed={mdTab === 'preview'}
                              className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium ${
                                mdTab === 'preview' ? 'bg-muted text-foreground' : 'text-muted-foreground'
                              }`}
                            >
                              <Eye className="h-3 w-3" />
                              Preview
                            </button>
                          </div>
                          <span className="ml-auto hidden pr-1.5 text-[10px] text-muted-foreground md:block">
                            Markdown
                          </span>
                        </div>

                        <div className="md:grid md:grid-cols-2 md:divide-x md:divide-border/60">
                          <div className={mdTab === 'preview' ? 'hidden md:block' : ''}>
                            <textarea
                              id="st-desc"
                              ref={descRef}
                              rows={16}
                              placeholder={'Explain the problem this solves, how it works, and why developers should use it.\n\n## Highlights\n- Feature one\n- Feature two'}
                              value={description}
                              onChange={(event) => {
                                setDescription(event.target.value);
                                clearError('description');
                              }}
                              aria-invalid={Boolean(errors.description)}
                              aria-describedby={errors.description ? 'st-desc-help st-desc-error' : 'st-desc-help'}
                              className="min-h-[300px] w-full resize-y border-0 bg-transparent p-3.5 font-mono text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground md:min-h-[420px]"
                            />
                          </div>
                          <div className={mdTab === 'write' ? 'hidden md:block' : ''}>
                            <div className="h-full max-h-[520px] min-h-[300px] overflow-y-auto p-4 md:min-h-[420px]">
                              {description.trim() ? (
                                <MarkdownContent content={description} className="text-[13px]" />
                              ) : (
                                <p className="text-xs italic text-muted-foreground">
                                  Formatted Markdown appears here as you type.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <p id="st-desc-help" className="text-[11px] leading-relaxed text-muted-foreground">
                        Markdown supported: <span className="font-mono">**bold**</span>,{' '}
                        <span className="font-mono">*italic*</span>, <span className="font-mono">## headings</span>,{' '}
                        <span className="font-mono">- lists</span>, <span className="font-mono">`code`</span>, and{' '}
                        <span className="font-mono">[links](url)</span>. The original Markdown is saved as written.
                      </p>
                      <FieldError id="st-desc-error" msg={errors.description} />
                    </section>

                    <FormSection
                      icon={Terminal}
                      title="Commands"
                      hint="Install, update, run, or invoke"
                      summary={validCommands.length > 0 ? `${validCommands.length} command${validCommands.length > 1 ? 's' : ''}` : 'Optional'}
                      defaultOpen
                    >
                      <div>
                        <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold text-foreground">Command labels</p>
                            <p className="mt-0.5 max-w-md text-[11px] leading-relaxed text-muted-foreground">
                              Give each command a clear label. Labels become the public detail page tabs, so use Installation command, Update command, or Run command. Pick a suggestion or type your own.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddCommand}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--zyro-accent)] hover:underline"
                          >
                            <Plus className="h-3 w-3" />
                            Add command
                          </button>
                        </div>

                        <datalist id="command-labels">
                          {[
                            'Installation command',
                            'Update command',
                            'Run command',
                            'Invoke command',
                            'Setup command',
                            'Uninstall command',
                            'Build command',
                            'Test command',
                          ].map((label) => (
                            <option key={label} value={label} />
                          ))}
                        </datalist>

                        <div className="space-y-2.5">
                          {commands.map((command, index) => (
                            <div key={index} className="rounded-lg border border-border/70 bg-muted/20 p-2.5">
                              <div className="mb-1.5 flex items-center gap-2">
                                <input
                                  type="text"
                                  list="command-labels"
                                  value={command.label}
                                  onChange={(event) => handleCommandChange(index, 'label', event.target.value)}
                                  placeholder="Command type"
                                  aria-label={`Command ${index + 1} type`}
                                  className="w-full rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-foreground outline-none focus-visible:border-[var(--zyro-accent)] focus-visible:ring-2 focus-visible:ring-[var(--zyro-accent)]/20 sm:w-52"
                                />
                                {commands.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCommand(index)}
                                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                                    aria-label={`Remove command ${index + 1}`}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                              <textarea
                                rows={2}
                                value={command.command}
                                onChange={(event) => handleCommandChange(index, 'command', event.target.value)}
                                placeholder={commandPlaceholder(command.label)}
                                aria-label={`Command ${index + 1} text`}
                                className="w-full resize-y rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-2 font-mono text-xs text-emerald-300 outline-none placeholder:text-neutral-600 focus-visible:ring-2 focus-visible:ring-[var(--zyro-accent)]/40"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <FieldLabel htmlFor="st-install-notes" hint="Optional">
                          Install notes
                        </FieldLabel>
                        <textarea
                          id="st-install-notes"
                          rows={2}
                          placeholder="Requires Node 20+ and a GitHub token."
                          value={installInstructions}
                          onChange={(event) => setInstallInstructions(event.target.value)}
                          className={`${inputCls} resize-y`}
                        />
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <FieldLabel htmlFor="st-magic-prompt" hint="Optional AI Prompt">
                          Magic Agent Prompt
                        </FieldLabel>
                        <p className="text-[11px] text-muted-foreground">
                          Custom instruction for AI agents (Claude, Gemini, Cursor, etc.). Leave blank to automatically generate one from your listing details.
                        </p>
                        <textarea
                          id="st-magic-prompt"
                          rows={3}
                          placeholder="e.g. You are an expert AI assistant. Integrate and invoke this skill by..."
                          value={magicPrompt}
                          onChange={(event) => setMagicPrompt(event.target.value)}
                          className={`${inputCls} resize-y font-mono text-xs`}
                        />
                      </div>
                    </FormSection>

                    <FormSection
                      icon={Tag}
                      title="Discovery"
                      hint="Help people find this listing"
                      summary={previewTags.length > 0 ? `${previewTags.length} tag${previewTags.length > 1 ? 's' : ''}` : 'Optional'}
                    >
                      <div className="space-y-2">
                        <FieldLabel htmlFor="st-tags" hint="Optional">
                          Tags
                        </FieldLabel>
                        <div className="flex gap-2">
                          <input
                            id="st-tags"
                            type="text"
                            placeholder="Type a tag and press Enter"
                            value={tagDraft}
                            onChange={(event) => setTagDraft(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ',') {
                                event.preventDefault();
                                commitTag();
                              } else if (event.key === 'Backspace' && !tagDraft && previewTags.length > 0) {
                                removeTag(previewTags[previewTags.length - 1]);
                              }
                            }}
                            onBlur={commitTag}
                            className={inputCls}
                          />
                          <Button type="button" variant="outline" size="sm" onClick={commitTag} className="shrink-0">
                            Add
                          </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Use relevant tags only — duplicates are ignored.
                        </p>

                        {previewTags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {previewTags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 rounded-full border border-[var(--zyro-accent)]/25 bg-[var(--zyro-accent-muted)] py-0.5 pl-2 pr-1 text-[11px] text-foreground/90"
                              >
                                #{tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
                                  aria-label={`Remove tag ${tag}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        {QUICK_TAGS.some(
                          (tag) => !previewTags.some((existing) => existing.toLowerCase() === tag.toLowerCase())
                        ) && (
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            <span className="mr-0.5 text-[10px] text-muted-foreground">Suggestions:</span>
                            {QUICK_TAGS.filter(
                              (tag) => !previewTags.some((existing) => existing.toLowerCase() === tag.toLowerCase())
                            ).map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => addTag(tag)}
                                className="rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-[var(--zyro-accent)]/50 hover:text-[var(--zyro-accent)]"
                              >
                                +{tag}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormSection>

                    <FormSection
                      icon={FolderGit2}
                      title="Links & media"
                      hint="Docs, version, cover image"
                      summary={version.trim() || 'Optional'}
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <FieldLabel htmlFor="st-doc" hint="Optional">
                            Documentation URL
                          </FieldLabel>
                          <input
                            id="st-doc"
                            type="text"
                            inputMode="url"
                            placeholder="https://docs.example.com"
                            value={docUrl}
                            onChange={(event) => setDocUrl(event.target.value)}
                            className={`${inputCls} font-mono`}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <FieldLabel htmlFor="st-version" hint="Optional">
                            Version / release
                          </FieldLabel>
                          <input
                            id="st-version"
                            type="text"
                            placeholder="e.g. v1.2.0"
                            value={version}
                            onChange={(event) => setVersion(event.target.value)}
                            className={`${inputCls} font-mono`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <FieldLabel htmlFor="st-image" hint="Optional">
                          <span className="inline-flex items-center gap-1.5">
                            <ImageIcon className="h-3.5 w-3.5 text-[var(--zyro-accent)]" />
                            Cover image URL
                          </span>
                        </FieldLabel>
                        <input
                          id="st-image"
                          type="text"
                          inputMode="url"
                          placeholder="https://example.com/preview.png"
                          value={imageUrl}
                          onChange={(event) => handleImageUrlChange(event.target.value)}
                          aria-invalid={Boolean(errors.imageUrl)}
                          aria-describedby={errors.imageUrl ? 'st-image-error' : undefined}
                          className={`${inputCls} font-mono ${errors.imageUrl ? inputErrorCls : ''}`}
                        />
                        <FieldError id="st-image-error" msg={errors.imageUrl} />
                        {imageUrl.trim() && (
                          <div className="relative mt-1 aspect-video w-full max-w-[220px] overflow-hidden rounded-lg border border-border/70 bg-muted/40">
                            {imageState === 'loading' && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              </div>
                            )}
                            {imageState === 'error' ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-muted/60 text-[10px] text-amber-600 dark:text-amber-400">
                                <AlertCircle className="h-4 w-4" />
                                <span>Image failed to load</span>
                              </div>
                            ) : (
                              <img
                                src={imageUrl}
                                alt="Cover image preview"
                                onLoad={() => setImageState('ok')}
                                onError={() => setImageState('error')}
                                className={`h-full w-full object-cover ${imageState === 'ok' ? '' : 'opacity-0'}`}
                              />
                            )}
                            {imageState === 'ok' && (
                              <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-white">
                                Preview OK
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </FormSection>

                    <FormSection
                      icon={UserRound}
                      title="Creator & capabilities"
                      hint="Who made it and what it can do"
                      summary={authorName.trim() || 'Optional'}
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <FieldLabel htmlFor="st-author" hint="Optional">
                            Author / organization name
                          </FieldLabel>
                          <input
                            id="st-author"
                            type="text"
                            placeholder="Author or maintainer"
                            value={authorName}
                            onChange={(event) => setAuthorName(event.target.value)}
                            className={inputCls}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <FieldLabel htmlFor="st-author-url" hint="Optional">
                            Author profile URL
                          </FieldLabel>
                          <input
                            id="st-author-url"
                            type="text"
                            inputMode="url"
                            placeholder="https://github.com/username"
                            value={authorUrl}
                            onChange={(event) => setAuthorUrl(event.target.value)}
                            className={`${inputCls} font-mono`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <FieldLabel htmlFor="st-caps" hint="One per line, optional">
                          Key capabilities
                        </FieldLabel>
                        <textarea
                          id="st-caps"
                          rows={4}
                          placeholder={'Agents - 71\nSkills - 302\nOpenAI-compatible drop-in server'}
                          value={capabilitiesInput}
                          onChange={(event) => setCapabilitiesInput(event.target.value)}
                          className={`${inputCls} resize-y`}
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Tip: use "Feature - Metric" pairs (e.g. Agents - 71) or plain feature bullets.
                        </p>
                      </div>
                    </FormSection>

                    <FormSection
                      icon={Search}
                      title="SEO settings"
                      hint="Search title, meta description, and URL"
                      summary={`/tools/${effectiveSlug || '…'}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="max-w-md text-[11px] leading-relaxed text-muted-foreground">
                          Generated from your listing details. Edit only if you need a different search phrase —
                          never add claims the listing does not support.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generateSeo}
                          disabled={!name.trim()}
                          className="h-7 shrink-0 gap-1.5 text-[11px]"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Generate from listing
                        </Button>
                      </div>

                      <div className="space-y-1.5">
                        <FieldLabel
                          htmlFor="st-seo-title"
                          hint={`${effectiveSeoTitle.length}/${SEO_TITLE_MAX} recommended`}
                        >
                          SEO page title
                        </FieldLabel>
                        <input
                          id="st-seo-title"
                          type="text"
                          value={seoTitle || derivedSeoTitle}
                          onChange={(event) => setSeoTitle(event.target.value)}
                          className={inputCls}
                        />
                        {effectiveSeoTitle.length > SEO_TITLE_MAX && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400">
                            Search engines may shorten this title.
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <FieldLabel
                          htmlFor="st-seo-description"
                          hint={`${effectiveSeoDescription.length}/${SEO_DESCRIPTION_MAX} recommended`}
                        >
                          Meta description
                        </FieldLabel>
                        <textarea
                          id="st-seo-description"
                          rows={3}
                          value={seoDescription || derivedSeoDescription}
                          onChange={(event) => setSeoDescription(event.target.value)}
                          className={`${inputCls} resize-y`}
                        />
                        {effectiveSeoDescription.length > SEO_DESCRIPTION_MAX && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400">
                            Search engines may truncate this description.
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <FieldLabel htmlFor="st-slug" hint="Lowercase letters, numbers, hyphens">
                          URL slug
                        </FieldLabel>
                        <div className={`flex items-stretch overflow-hidden rounded-lg border bg-background/60 focus-within:ring-2 focus-within:ring-[var(--zyro-accent)]/20 ${errors.slug ? inputErrorCls : 'border-border focus-within:border-[var(--zyro-accent)]'}`}>
                          <span className="flex items-center border-r border-border/60 bg-muted/40 px-2.5 font-mono text-[11px] text-muted-foreground">
                            /tools/
                          </span>
                          <input
                            id="st-slug"
                            type="text"
                            value={slug || derivedSlug}
                            onChange={(event) => {
                              setSlug(event.target.value);
                              clearError('slug');
                            }}
                            onBlur={handleSlugBlur}
                            placeholder="your-listing"
                            aria-invalid={Boolean(errors.slug)}
                            aria-describedby={errors.slug ? 'st-slug-error' : undefined}
                            className="min-w-0 flex-1 border-0 bg-transparent px-2.5 py-2 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
                          />
                        </div>
                        <FieldError id="st-slug-error" msg={errors.slug} />
                        <p className="text-[10px] text-muted-foreground">
                          Page H1 stays the official listing name: <span className="font-medium text-foreground">{name.trim() || 'your listing name'}</span>
                        </p>
                      </div>

                      <div className="rounded-xl border border-border/70 bg-background p-3">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Search engine preview
                        </p>
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                            <Globe className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {SEARCH_PREVIEW_DOMAIN} › tools › {effectiveSlug || 'your-listing'}
                            </span>
                          </p>
                          <p className="line-clamp-2 break-words text-[15px] font-medium leading-snug text-[#1a0dab] dark:text-blue-400">
                            {effectiveSeoTitle}
                          </p>
                          <p className="line-clamp-2 break-words text-[12px] leading-relaxed text-muted-foreground">
                            {effectiveSeoDescription}
                          </p>
                        </div>
                      </div>
                    </FormSection>
                  </div>

                  <aside className="hidden lg:block">
                    <PreviewColumn {...previewProps} />
                  </aside>
                </div>
              )}

              {stage === 3 && (
                <div className="space-y-5">
                  <StageHeading
                    title={reviewTitle}
                    description={
                      tool
                        ? 'Check the updated listing, fix anything flagged, then save your changes.'
                        : 'Check completeness, fix anything flagged, then confirm the final listing.'
                    }
                  />
                  {draftBanner}

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-[330px_minmax(0,1fr)]">
                    <div className="min-w-0 space-y-4">
                      <section className="rounded-xl border border-border/70 bg-card p-4">
                        <div className="flex items-baseline justify-between gap-3">
                          <h4 className="text-xs font-semibold text-foreground">Listing completeness</h4>
                          <span className="text-2xl font-semibold tracking-tight text-foreground">{completeness}%</span>
                        </div>
                        <Progress
                          value={completeness}
                          className="mt-2 h-1.5 bg-muted [&_[data-slot=progress-indicator]]:bg-[var(--zyro-accent)]"
                        />
                        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                          {requiredDone} of 4 required details · {optionalDone} of 8 optional details
                        </p>
                      </section>

                      <section className="space-y-2 rounded-xl border border-border/70 bg-card p-4">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-semibold text-foreground">SEO metadata</h4>
                          <button
                            type="button"
                            onClick={() => setStage(2)}
                            className="text-[11px] font-medium text-[var(--zyro-accent)] hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                        <dl className="space-y-1 text-[11px]">
                          <div className="flex items-baseline justify-between gap-3">
                            <dt className="text-muted-foreground">Title</dt>
                            <dd className={effectiveSeoTitle.length > SEO_TITLE_MAX ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}>
                              {effectiveSeoTitle.length} chars
                            </dd>
                          </div>
                          <div className="flex items-baseline justify-between gap-3">
                            <dt className="text-muted-foreground">Meta description</dt>
                            <dd className={effectiveSeoDescription.length > SEO_DESCRIPTION_MAX ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}>
                              {effectiveSeoDescription.length} chars
                            </dd>
                          </div>
                          <div className="flex items-baseline justify-between gap-3">
                            <dt className="shrink-0 text-muted-foreground">URL</dt>
                            <dd className="truncate text-right font-mono text-foreground">/tools/{effectiveSlug || '—'}</dd>
                          </div>
                        </dl>
                      </section>

                      <section className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {tool
                            ? 'Before you save'
                            : isAdmin && adminStatus === 'approved'
                              ? 'Before you publish'
                              : 'Before you submit'}
                        </h4>
                        {missingRequired.length === 0 ? (
                          <p className="flex items-start gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 text-[11px] text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0" />
                            All required fields are in place.
                          </p>
                        ) : (
                          <ul className="space-y-1.5">
                            {missingRequired.map((item) => (
                              <li key={item.label}>
                                <button
                                  type="button"
                                  onClick={() => setStage(item.stage)}
                                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-left text-[11px] text-amber-700 transition-colors hover:bg-amber-500/10 dark:text-amber-400"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                    {item.label} is required
                                  </span>
                                  <span className="font-semibold">Add</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}

                        {validationErrors.length > 0 && (
                          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-red-600 dark:text-red-400">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Validation errors
                            </p>
                            <ul className="list-disc space-y-0.5 pl-4 text-[11px] text-red-600/90 dark:text-red-400/90">
                              {validationErrors.map(([field, message]) => (
                                <li key={field}>
                                  {errorLabels[field]}: {message}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {submitError && (
                          <p className="flex items-start gap-1.5 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-[11px] text-red-600 dark:text-red-400">
                            <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
                            {submitError}
                          </p>
                        )}
                      </section>

                      <section className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
                        <p>
                          {tool
                            ? isAdmin && adminStatus === 'approved'
                              ? 'Your changes publish immediately when you save.'
                              : 'Your changes stay queued for moderator review until approved.'
                            : isAdmin && adminStatus === 'approved'
                              ? 'Your listing publishes immediately. Your work is also saved as a draft on this device while you edit.'
                              : 'Submissions are reviewed by moderators before appearing publicly. Your work is also saved as a draft on this device while you edit.'}
                          {draftSavedAt && ` Last saved ${draftSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`}
                        </p>
                      </section>

                      {isAdmin && (
                        <section className="space-y-4 rounded-xl border border-blue-500/25 bg-blue-500/5 p-4">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-blue-500" />
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                              Administrator publishing controls
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-xs font-semibold text-foreground">Publication status</span>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setAdminStatus('approved')}
                                aria-pressed={adminStatus === 'approved'}
                                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                                  adminStatus === 'approved'
                                    ? 'border-emerald-500 bg-emerald-500/10 font-bold text-emerald-600 dark:text-emerald-400'
                                    : 'border-border/70 bg-card text-muted-foreground hover:bg-muted/40'
                                }`}
                              >
                                Publish live
                              </button>
                              <button
                                type="button"
                                onClick={() => setAdminStatus('pending')}
                                aria-pressed={adminStatus === 'pending'}
                                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                                  adminStatus === 'pending'
                                    ? 'border-amber-500 bg-amber-500/10 font-bold text-amber-600 dark:text-amber-400'
                                    : 'border-border/70 bg-card text-muted-foreground hover:bg-muted/40'
                                }`}
                              >
                                Save as pending
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <FieldLabel htmlFor="st-badge" hint="Optional">
                              Custom badge
                            </FieldLabel>
                            <input
                              id="st-badge"
                              type="text"
                              placeholder="e.g. Verified, Official, Staff Pick"
                              value={adminBadge}
                              onChange={(event) => setAdminBadge(event.target.value)}
                              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-[var(--zyro-accent)]/20"
                            />
                            <div className="flex flex-wrap items-center gap-1 pt-0.5">
                              {['Verified', 'Official', 'Staff Pick', 'Trending', 'Popular', 'Beta'].map((badge) => (
                                <button
                                  key={badge}
                                  type="button"
                                  onClick={() => setAdminBadge(badge)}
                                  className={`rounded border px-1.5 py-0.5 text-[10px] transition-colors ${
                                    adminBadge === badge
                                      ? 'border-[var(--zyro-accent)] bg-[var(--zyro-accent)] font-semibold text-white'
                                      : 'border-border/70 bg-card text-muted-foreground hover:bg-muted/40'
                                  }`}
                                >
                                  {badge}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <FieldLabel htmlFor="st-cover-color" hint="Gradient when no cover image">
                              Card hero color
                            </FieldLabel>
                            <div className="flex items-center gap-2">
                              <input
                                id="st-cover-color"
                                type="color"
                                value={adminCoverColor}
                                onChange={(event) => setAdminCoverColor(event.target.value)}
                                className="h-9 w-10 cursor-pointer rounded-lg border border-border bg-card p-1"
                              />
                              <input
                                type="text"
                                value={adminCoverColor}
                                onChange={(event) => setAdminCoverColor(event.target.value)}
                                placeholder="#7B7BDC"
                                aria-label="Card hero color hex"
                                className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 font-mono text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-[var(--zyro-accent)]/20"
                              />
                              <button
                                type="button"
                                onClick={() => setAdminCoverColor('#7B7BDC')}
                                className="shrink-0 rounded-lg border border-border/70 bg-card px-2.5 py-2 text-[11px] font-medium text-muted-foreground hover:bg-muted/40"
                              >
                                Reset
                              </button>
                            </div>
                          </div>

                          <label className="flex cursor-pointer items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={adminFeatured}
                              onChange={(event) => setAdminFeatured(event.target.checked)}
                              className="mt-0.5 h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs">
                              <span className="font-semibold text-foreground">Featured flagship tool</span>
                              <span className="ml-1 text-muted-foreground">(pin to the curated showcase on /tools)</span>
                            </span>
                          </label>
                        </section>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Directory card preview
                        </span>
                        <span className="text-right text-[10px] text-muted-foreground">How your card appears in ToolHub</span>
                      </div>
                      <ListingPreview {...previewProps} />
                      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                        Your public detail page is generated from these same fields.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-border/60 bg-muted/20 px-5 py-3 sm:px-7">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleOpenChange(false)}
                disabled={submitting}
                className="h-9 text-xs text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSaveDraft}
                disabled={!hasContent || submitting}
                className={`h-9 gap-1.5 text-xs ${tool ? 'hidden' : ''}`}
              >
                <Save className="h-3.5 w-3.5" />
                Save draft
              </Button>
              {draftSavedAt && (
                <span className="hidden text-[10px] text-muted-foreground sm:inline">
                  Saved {draftSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}

              <div className="ml-auto flex w-full items-center gap-2 sm:w-auto">
                {stage > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStage((stage - 1) as Stage)}
                    disabled={submitting}
                    className="h-9 flex-1 gap-1 text-xs sm:flex-none"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Back
                  </Button>
                )}
                {stage < 3 ? (
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-10 flex-1 gap-1.5 px-5 text-sm font-semibold shadow-sm bg-[var(--zyro-accent)] text-white hover:bg-[var(--zyro-sapphire)] sm:flex-none"
                  >
                    {stage === 1 ? 'Continue' : tool ? 'Review changes' : 'Review listing'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-10 flex-1 gap-2 px-5 text-sm font-semibold shadow-sm bg-[var(--zyro-accent)] text-white hover:bg-[var(--zyro-sapphire)] sm:flex-none"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {tool ? 'Saving...' : isAdmin && adminStatus === 'approved' ? 'Publishing...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        {tool ? <Pencil className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                        {finalActionLabel}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </footer>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
