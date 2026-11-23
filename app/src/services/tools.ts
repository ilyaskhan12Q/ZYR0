import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/slug';
import { type ToolItem, type ToolItemType, type ToolSubcategory } from '@/data/tools';
import type { DbTool, ToolSubmissionStatus, ToolInstallCommand } from '@/lib/database.types';
import { getCachedData, setCachedData, clearCache } from '@/lib/cache';
import { dedupRequest, createRequestKey } from '@/lib/cache/requestRegistry';

export interface SubmitToolInput {
  name: string;
  tagline: string;
  description: string;
  item_type: ToolItemType;
  category: 'AI & Agents' | 'Developer Tools' | 'Research & Docs' | 'Productivity';
  subcategory?: ToolSubcategory | null;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  tags: string[];
  source: string;
  source_url: string;
  documentation_url?: string;
  image_url?: string;
  cover_color?: string;
  capabilities: string[];
  install_command?: string;
  install_commands?: ToolInstallCommand[];
  install_instructions?: string;
  magic_prompt?: string;
  version?: string;
  author_name: string;
  author_url?: string;
  status?: ToolSubmissionStatus;
  featured?: boolean;
  badge?: string;
}

/**
 * Maps a database tool row into the ToolItem representation used across Discovery components.
 */
export function mapDbToolToToolItem(dbTool: DbTool): ToolItem {
  const installCommands = (dbTool.install_commands && Array.isArray(dbTool.install_commands) && dbTool.install_commands.length > 0)
    ? dbTool.install_commands
    : dbTool.install_command
    ? [{ label: 'Install', command: dbTool.install_command }]
    : [];

  return {
    id: dbTool.id,
    slug: dbTool.slug,
    name: dbTool.name,
    tagline: dbTool.tagline,
    description: dbTool.description,
    item_type: dbTool.item_type,
    category: dbTool.category,
    subcategory: (dbTool.subcategory as ToolSubcategory) || null,
    tags: dbTool.tags || [],
    source: (dbTool.source as any) || 'Web',
    sourceUrl: dbTool.source_url,
    documentationUrl: dbTool.documentation_url || undefined,
    imageUrl: dbTool.image_url || undefined,
    coverColor: dbTool.cover_color || undefined,
    badge: dbTool.badge || undefined,
    featured: dbTool.featured,
    capabilities: dbTool.capabilities || [],
    installCommand: dbTool.install_command || installCommands[0]?.command || undefined,
    installCommands: installCommands.length > 0 ? installCommands : undefined,
    installInstructions: dbTool.install_instructions || undefined,
    magicPrompt: dbTool.magic_prompt || undefined,
    version: dbTool.version || undefined,
    seoTitle: dbTool.seo_title || undefined,
    seoDescription: dbTool.seo_description || undefined,
    author: {
      name: dbTool.author_name,
      url: dbTool.author_url || undefined,
    },
  };
}

/**
 * Fetch all approved community tools from Supabase.
 * Falls back gracefully to empty array if table or network is unavailable.
 */
async function getApprovedCommunityTools(): Promise<ToolItem[]> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Note: Supabase approved tools check:', error.message);
      return [];
    }

    return (data || []).map((row) => mapDbToolToToolItem(row as DbTool));
  } catch (err) {
    console.warn('Error fetching community tools:', err);
    return [];
  }
}

/**
 * Fetches all approved public tools with request deduplication and memory caching.
 */
export async function getAllPublicTools(useCache = true): Promise<ToolItem[]> {
  const cacheKey = createRequestKey('public_tools', 'all');
  if (useCache) {
    const cached = getCachedData<ToolItem[]>(cacheKey);
    if (cached) return cached;
  }

  const fetchFn = async () => {
    const communityTools = await getApprovedCommunityTools();
    return communityTools || [];
  };

  const res = await dedupRequest(cacheKey, fetchFn);
  if (Array.isArray(res)) {
    setCachedData(cacheKey, res);
  }
  return res || [];
}

/**
 * Pure recommendation ranking algorithm:
 * Weights:
 * - featured: +10
 * - official/verified badge: +5; trending/popular: +4; other badge: +2
 * - actionable execution (commands / magic prompt): +3
 * - preferredType match (e.g. 'skill' or 'tool_skill'): +3
 * - rich metadata (capabilities count up to +2)
 *
 * Applies category diversity so recommendations represent multiple domains.
 */
export function rankRecommendedTools(
  tools: ToolItem[],
  maxItems = 4,
  preferredType: 'skill' | 'tool' | 'all' = 'skill'
): ToolItem[] {
  if (!tools || tools.length === 0) return [];

  const scored = tools.map((tool) => {
    let score = 0;

    // 1. Featured status (highest weight)
    if (tool.featured) score += 10;

    // 2. Verified / Official / Trending badges
    if (tool.badge) {
      const b = tool.badge.toLowerCase();
      if (b.includes('official') || b.includes('verified')) score += 5;
      else if (b.includes('trending') || b.includes('popular')) score += 4;
      else score += 2;
    }

    // 3. Execution readiness: ready commands or magic prompt
    if (tool.installCommands?.length || tool.installCommand || tool.magicPrompt) {
      score += 3;
    }

    // 4. Type relevance
    if (preferredType === 'skill') {
      if (tool.item_type === 'skill') score += 4;
      else if (tool.item_type === 'tool_skill') score += 3;
      else score += 1;
    } else if (preferredType === 'tool') {
      if (tool.item_type === 'tool') score += 4;
      else if (tool.item_type === 'tool_skill') score += 3;
      else score += 1;
    } else {
      score += 2;
    }

    // 5. Metadata depth
    if (tool.capabilities?.length) {
      score += Math.min(tool.capabilities.length * 0.25, 2);
    }
    if (tool.description && tool.description.length > 100) {
      score += 1;
    }

    return { tool, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Diverse category pass: pick highest scoring per category first
  const selected: ToolItem[] = [];
  const seenCategories = new Set<string>();

  for (const item of scored) {
    if (!seenCategories.has(item.tool.category) && selected.length < maxItems) {
      selected.push(item.tool);
      seenCategories.add(item.tool.category);
    }
  }

  // Fill remaining slots
  for (const item of scored) {
    if (selected.length >= maxItems) break;
    if (!selected.some((s) => s.id === item.tool.id)) {
      selected.push(item.tool);
    }
  }

  return selected;
}

/**
 * Fetch top recommended tools using the ranking algorithm.
 */
export async function getRecommendedTools(
  maxItems = 4,
  preferredType: 'skill' | 'tool' | 'all' = 'skill',
  useCache = true
): Promise<ToolItem[]> {
  const cacheKey = createRequestKey('recommended_tools', `${preferredType}:${maxItems}`);
  if (useCache) {
    const cached = getCachedData<ToolItem[]>(cacheKey);
    if (cached) return cached;
  }

  const all = await getAllPublicTools(useCache);
  const ranked = rankRecommendedTools(all, maxItems, preferredType);

  setCachedData(cacheKey, ranked);
  return ranked;
}

/**
 * Fetch a single approved tool by its URL slug for the detail page.
 * Returns null if the tool does not exist or is not approved (prevents detail pages for pending/rejected).
 */
export async function getToolBySlug(slug: string, useCache = true): Promise<ToolItem | null> {
  const cacheKey = createRequestKey('tool_by_slug', slug);
  if (useCache) {
    const cached = getCachedData<ToolItem | null>(cacheKey);
    if (cached !== null) return cached;
  }

  const fetchFn = async () => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'approved')
        .single();

      if (error || !data) return null;
      return mapDbToolToToolItem(data as DbTool);
    } catch {
      return null;
    }
  };

  const res = await dedupRequest(cacheKey, fetchFn);
  if (res) {
    setCachedData(cacheKey, res);
  }
  return res;
}

/** Shared field mapping so inserts and edits cannot drift apart. */
function buildToolPayload(input: SubmitToolInput, forInsert: boolean): Partial<DbTool> {
  const hasCommands = Boolean(input.install_commands && input.install_commands.length > 0);

  return {
    name: input.name.trim(),
    tagline: input.tagline.trim(),
    description: input.description.trim(),
    item_type: input.item_type,
    category: input.category,
    subcategory: input.subcategory || null,
    tags: input.tags,
    source: input.source.trim(),
    source_url: input.source_url.trim(),
    documentation_url: input.documentation_url?.trim() || null,
    image_url: input.image_url?.trim() || null,
    seo_title: input.seo_title?.trim() || null,
    seo_description: input.seo_description?.trim() || null,
    capabilities: input.capabilities,
    install_command: hasCommands ? input.install_commands![0].command : input.install_command?.trim() || null,
    install_commands: hasCommands ? input.install_commands : null,
    install_instructions: input.install_instructions?.trim() || null,
    magic_prompt: input.magic_prompt?.trim() || null,
    version: input.version?.trim() || null,
    author_name: input.author_name.trim(),
    author_url: input.author_url?.trim() || null,
    ...(forInsert ? { status: input.status || 'pending', featured: input.featured ?? false } : {}),
    ...(!forInsert && input.status !== undefined ? { status: input.status } : {}),
    ...(!forInsert && input.featured !== undefined ? { featured: input.featured } : {}),
    ...(forInsert || input.badge !== undefined ? { badge: input.badge?.trim() || null } : {}),
    ...(input.cover_color !== undefined ? { cover_color: input.cover_color.trim() || null } : {}),
  };
}

/**
 * Submit a tool or skill by an authenticated student or company user.
 */
export async function submitTool(input: SubmitToolInput, ownerId: string): Promise<DbTool> {
  const requestedSlug = slugify(input.slug?.trim() || '');
  const generatedSlug = slugify(input.name) || 'listing';
  // Callers that provide a slug get a clean URL; older callers keep the collision-resistant suffix.
  const slug = requestedSlug || `${generatedSlug}-${Math.random().toString(36).substring(2, 6)}`;

  const payload: Partial<DbTool> = {
    ...buildToolPayload(input, true),
    slug,
    owner_id: ownerId,
  };

  const { data, error } = await supabase
    .from('tools')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    if ((error as { code?: string }).code === '23505' && /slug/i.test(error.message)) {
      throw new Error('That URL slug is already in use. Choose a different one under SEO settings.');
    }
    throw new Error(error.message || 'Failed to submit tool for review');
  }

  clearCache('public_tools');
  clearCache('recommended_tools');
  return data as DbTool;
}

/**
 * Update an existing listing. RLS decides who may edit:
 * owners can update pending submissions, admins can update any listing.
 */
export async function updateTool(toolId: string, input: SubmitToolInput): Promise<DbTool> {
  const slug = slugify(input.slug?.trim() || input.name) || 'listing';

  const { data, error } = await supabase
    .from('tools')
    .update({
      ...buildToolPayload(input, false),
      slug,
      updated_at: new Date().toISOString(),
    })
    .eq('id', toolId)
    .select('*')
    .single();

  if (error) {
    const code = (error as { code?: string }).code;
    if (code === '23505' && /slug/i.test(error.message)) {
      throw new Error('That URL slug is already in use. Choose a different one under SEO settings.');
    }
    if (code === 'PGRST116') {
      throw new Error('This listing is no longer editable. Refresh the page and try again.');
    }
    throw new Error(error.message || 'Failed to update listing');
  }

  clearCache('public_tools');
  clearCache('recommended_tools');
  clearCache(createRequestKey('tool_by_slug', slug));
  return data as DbTool;
}

/**
 * Fetch submissions owned by the currently logged-in user.
 */
export async function getMyToolSubmissions(userId: string): Promise<DbTool[]> {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load user tool submissions:', error);
    return [];
  }

  return (data || []) as DbTool[];
}

/**
 * Admin: Fetch all tool submissions with optional status filter.
 */
export async function getAllToolsAdmin(status?: ToolSubmissionStatus): Promise<DbTool[]> {
  let query = supabase
    .from('tools')
    .select('*, owner:profiles!tools_owner_id_fkey(*)')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message || 'Failed to load tools moderation queue');
  }

  return (data || []) as DbTool[];
}

/**
 * Admin: Update tool status (Approve, Reject, Feature, or add Moderator Note).
 */
export async function updateToolStatusAdmin(
  toolId: string,
  status: ToolSubmissionStatus,
  moderatorNote?: string,
  featured?: boolean
): Promise<DbTool> {
  const updates: Partial<DbTool> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (moderatorNote !== undefined) {
    updates.moderator_note = moderatorNote;
  }
  if (featured !== undefined) {
    updates.featured = featured;
  }

  const { data, error } = await supabase
    .from('tools')
    .update(updates)
    .eq('id', toolId)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to update tool status');
  }

  clearCache('public_tools');
  clearCache('recommended_tools');
  return data as DbTool;
}

/**
 * Admin: Delete a tool submission.
 */
export async function deleteToolAdmin(toolId: string): Promise<void> {
  const { error } = await supabase
    .from('tools')
    .delete()
    .eq('id', toolId);

  if (error) {
    throw new Error(error.message || 'Failed to delete tool');
  }

  clearCache('public_tools');
  clearCache('recommended_tools');
}
