import type { ToolItemType } from '@/data/tools';
import type { ToolInstallCommand } from '@/lib/database.types';

type ToolFormCategory = 'AI & Agents' | 'Developer Tools' | 'Research & Docs' | 'Productivity';

export const TOOL_FORM_CATEGORIES: ToolFormCategory[] = [
  'AI & Agents',
  'Developer Tools',
  'Research & Docs',
  'Productivity',
];

export const TOOL_FORM_SOURCES = ['GitHub', 'Hugging Face', 'ZYR0 Native', 'GitLab', 'Web'] as const;

/**
 * Normalizes URLs: handles missing https:// and GitHub short repo names (e.g. "org/repo").
 */
export function normalizeUrl(url: string, platform?: string): string {
  const clean = url.trim();
  if (!clean) return '';
  if (platform === 'GitHub' && !clean.includes('github.com') && !clean.startsWith('http')) {
    const parts = clean.split('/').map((s) => s.trim()).filter(Boolean);
    if (parts.length === 2 && !clean.includes('.')) {
      return `https://github.com/${clean}`;
    }
  }
  if (clean.startsWith('github.com/')) {
    return `https://${clean}`;
  }
  if (!/^https?:\/\//i.test(clean)) {
    return `https://${clean}`;
  }
  return clean;
}

/** Comma string -> unique tags, leading "#" stripped, case-insensitive duplicates removed. */
export function parseTags(value: string): string[] {
  const seen = new Set<string>();
  return value
    .split(',')
    .map((tag) => tag.trim().replace(/^#/, ''))
    .filter((tag) => {
      if (!tag) return false;
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/** Newline string -> trimmed, non-empty lines. */
export function parseLines(value: string): string[] {
  return value.split('\n').map((line) => line.trim()).filter(Boolean);
}

export const SEO_TITLE_MAX = 60;
export const SEO_DESCRIPTION_MAX = 160;

function seoTypePhrase(itemType: ToolItemType): string {
  if (itemType === 'skill') return 'Agent Skill';
  if (itemType === 'tool_skill') return 'Developer Tool & Agent Skill';
  return 'Developer Tool';
}

/** Search-facing title from verified listing fields only: name, type, category, ZYR0. */
export function buildSeoTitle(name: string, category: string, itemType: ToolItemType): string {
  const cleanName = name.trim() || 'Untitled listing';
  const audience = category === 'Developer Tools' ? '' : ` for ${category}`;
  return `${cleanName} — ${seoTypePhrase(itemType)}${audience} | ZYR0`;
}

/** Meta description from the submitted tagline plus listing facts. No invented claims. */
export function buildSeoDescription(
  name: string,
  tagline: string,
  category: string,
  itemType: ToolItemType
): string {
  const cleanName = name.trim() || 'This listing';
  const cleanTagline = tagline.trim().replace(/[.!?]+$/, '');
  const kind = seoTypePhrase(itemType).toLowerCase();
  const article = /^[aeiou]/.test(kind) ? 'an' : 'a';
  const intro = cleanTagline ? `${cleanTagline}.` : '';
  return `${intro} ${cleanName} is ${article} ${kind} listed in ZYR0's ${category} directory.`.trim();
}

export type MarkdownAction =
  | { kind: 'inline'; before: string; after: string; placeholder: string }
  | { kind: 'line'; prefix: string };

/** Inserts a Markdown snippet at the cursor/selection and returns the new selection. */
export function applyMarkdownAction(
  value: string,
  start: number,
  end: number,
  action: MarkdownAction
): { value: string; selectionStart: number; selectionEnd: number } {
  if (action.kind === 'line') {
    const lineStart = start === 0 ? 0 : value.lastIndexOf('\n', start - 1) + 1;
    const nextBreak = value.indexOf('\n', end);
    const lineEnd = nextBreak === -1 ? value.length : nextBreak;
    const block = value.slice(lineStart, lineEnd);
    const prefixed = block
      .split('\n')
      .map((line) => (line.trim() ? action.prefix + line : line))
      .join('\n');
    return {
      value: value.slice(0, lineStart) + prefixed + value.slice(lineEnd),
      selectionStart: lineStart + action.prefix.length,
      selectionEnd: lineStart + prefixed.length,
    };
  }

  const selected = value.slice(start, end);
  const content = selected || action.placeholder;
  return {
    value: value.slice(0, start) + action.before + content + action.after + value.slice(end),
    selectionStart: start + action.before.length,
    selectionEnd: start + action.before.length + content.length,
  };
}

export interface ToolDraft {
  itemType: ToolItemType;
  name: string;
  tagline: string;
  description: string;
  category: ToolFormCategory;
  source: string;
  sourceUrl: string;
  docUrl: string;
  imageUrl: string;
  commands: ToolInstallCommand[];
  installInstructions: string;
  tagsInput: string;
  capabilitiesInput: string;
  version: string;
  authorName: string;
  authorUrl: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  adminStatus: 'approved' | 'pending';
  adminFeatured: boolean;
  adminBadge: string;
  adminCoverColor: string;
}

const draftKey = (userId: string) => `zyro:tool-draft:${userId}`;

/** A draft is only worth storing once it has real content (not just default choices). */
export function isDraftEmpty(draft: ToolDraft): boolean {
  return (
    !draft.name.trim() &&
    !draft.tagline.trim() &&
    !draft.description.trim() &&
    !draft.sourceUrl.trim() &&
    !draft.docUrl.trim() &&
    !draft.imageUrl.trim() &&
    !draft.version.trim() &&
    !draft.installInstructions.trim() &&
    !draft.authorUrl.trim() &&
    !draft.slug.trim() &&
    !draft.seoTitle.trim() &&
    !draft.seoDescription.trim() &&
    !draft.adminBadge.trim() &&
    parseTags(draft.tagsInput).length === 0 &&
    parseLines(draft.capabilitiesInput).length === 0 &&
    !draft.commands.some((command) => command.command.trim()) &&
    draft.itemType === 'tool' &&
    draft.category === 'AI & Agents' &&
    draft.source === 'GitHub' &&
    !draft.adminFeatured &&
    draft.adminCoverColor === '#7B7BDC'
  );
}

export function saveToolDraft(userId: string, draft: ToolDraft): boolean {
  try {
    localStorage.setItem(draftKey(userId), JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearToolDraft(userId: string): void {
  try {
    localStorage.removeItem(draftKey(userId));
  } catch {
    // Storage can be unavailable (private mode); drafts are best-effort.
  }
}

export function loadToolDraft(userId: string): ToolDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(userId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const data = parsed as Record<string, unknown>;
    const text = (key: keyof ToolDraft, fallback = '') =>
      typeof data[key] === 'string' ? (data[key] as string) : fallback;

    const commands = Array.isArray(data.commands)
      ? data.commands.filter(
          (command): command is ToolInstallCommand =>
            Boolean(command) &&
            typeof command === 'object' &&
            typeof (command as ToolInstallCommand).label === 'string' &&
            typeof (command as ToolInstallCommand).command === 'string'
        )
      : [];

    const category = TOOL_FORM_CATEGORIES.includes(data.category as ToolFormCategory)
      ? (data.category as ToolFormCategory)
      : 'AI & Agents';
    const source = typeof data.source === 'string' && (TOOL_FORM_SOURCES as readonly string[]).includes(data.source)
      ? data.source
      : 'GitHub';

    return {
      itemType: data.itemType === 'skill' || data.itemType === 'tool_skill' ? data.itemType : 'tool',
      name: text('name'),
      tagline: text('tagline'),
      description: text('description'),
      category,
      source,
      sourceUrl: text('sourceUrl'),
      docUrl: text('docUrl'),
      imageUrl: text('imageUrl'),
      commands: commands.length > 0 ? commands : [{ label: 'CLI', command: '' }],
      installInstructions: text('installInstructions'),
      tagsInput: text('tagsInput'),
      capabilitiesInput: text('capabilitiesInput'),
      version: text('version'),
      authorName: text('authorName'),
      authorUrl: text('authorUrl'),
      slug: text('slug'),
      seoTitle: text('seoTitle'),
      seoDescription: text('seoDescription'),
      adminStatus: data.adminStatus === 'pending' ? 'pending' : 'approved',
      adminFeatured: data.adminFeatured === true,
      adminBadge: text('adminBadge'),
      adminCoverColor: text('adminCoverColor', '#7B7BDC'),
    };
  } catch {
    return null;
  }
}
