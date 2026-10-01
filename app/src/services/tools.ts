import { supabase } from '@/lib/supabase';
import { TOOLS_DATA, type ToolItem, type ToolCategory, type ToolItemType } from '@/data/tools';
import type { DbTool, ToolSubmissionStatus } from '@/lib/database.types';

export interface SubmitToolInput {
  name: string;
  tagline: string;
  description: string;
  item_type: ToolItemType;
  category: 'AI & Agents' | 'Developer Tools' | 'Research & Docs' | 'Productivity';
  tags: string[];
  source: string;
  source_url: string;
  documentation_url?: string;
  image_url?: string;
  capabilities: string[];
  install_command?: string;
  install_instructions?: string;
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
  return {
    id: dbTool.id,
    slug: dbTool.slug,
    name: dbTool.name,
    tagline: dbTool.tagline,
    description: dbTool.description,
    item_type: dbTool.item_type,
    category: dbTool.category,
    tags: dbTool.tags || [],
    source: (dbTool.source as any) || 'Web',
    sourceUrl: dbTool.source_url,
    documentationUrl: dbTool.documentation_url || undefined,
    imageUrl: dbTool.image_url || undefined,
    badge: dbTool.badge || undefined,
    featured: dbTool.featured,
    capabilities: dbTool.capabilities || [],
    installCommand: dbTool.install_command || undefined,
    installInstructions: dbTool.install_instructions || undefined,
    version: dbTool.version || undefined,
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
export async function getApprovedCommunityTools(): Promise<ToolItem[]> {
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
 * Fetches all approved public tools directly from Supabase.
 */
export async function getAllPublicTools(): Promise<ToolItem[]> {
  const communityTools = await getApprovedCommunityTools();
  return communityTools || [];
}

/**
 * Submit a tool or skill by an authenticated student or company user.
 */
export async function submitTool(input: SubmitToolInput, ownerId: string): Promise<DbTool> {
  const slug = input.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

  const payload: Partial<DbTool> = {
    slug,
    name: input.name.trim(),
    tagline: input.tagline.trim(),
    description: input.description.trim(),
    item_type: input.item_type,
    category: input.category,
    tags: input.tags,
    source: input.source.trim(),
    source_url: input.source_url.trim(),
    documentation_url: input.documentation_url?.trim() || null,
    image_url: input.image_url?.trim() || null,
    capabilities: input.capabilities,
    install_command: input.install_command?.trim() || null,
    install_instructions: input.install_instructions?.trim() || null,
    version: input.version?.trim() || null,
    author_name: input.author_name.trim(),
    author_url: input.author_url?.trim() || null,
    status: input.status || 'pending',
    owner_id: ownerId,
    featured: input.featured ?? false,
    badge: input.badge?.trim() || null,
  };

  const { data, error } = await supabase
    .from('tools')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to submit tool for review');
  }

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
}
