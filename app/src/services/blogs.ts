import { supabase } from '@/lib/supabase';
import type { BlogPost } from '@/lib/database.types';

export interface BlogFilterOptions {
  category?: string;
  tag?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Fetch published blog posts for the public blog with optional filters.
 */
export async function getPublishedBlogs(options: BlogFilterOptions = {}): Promise<{ posts: BlogPost[]; count: number }> {
  let query = supabase
    .from('blogs')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('published_at', { ascending: false, nullsFirst: false });

  if (options.category && options.category !== 'All') {
    query = query.eq('category', options.category);
  }

  if (options.tag) {
    query = query.contains('tags', [options.tag]);
  }

  if (options.search && options.search.trim()) {
    const term = options.search.trim();
    query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`);
  }

  if (options.limit) {
    const from = options.offset || 0;
    const to = from + options.limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Failed to fetch published blogs:', error.message);
    return { posts: [], count: 0 };
  }

  return { posts: (data as BlogPost[]) ?? [], count: count ?? 0 };
}

/**
 * Fetch the featured blog post for the hero spot.
 */
export async function getFeaturedBlog(): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch featured blog:', error.message);
    return null;
  }

  return (data as BlogPost) ?? null;
}

/**
 * Fetch a single published post by slug, and increment views count.
 */
export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !data) {
    console.error('Failed to fetch blog post by slug:', error?.message);
    return null;
  }

  // Fire-and-forget view count increment via RPC or fallback update
  try {
    await supabase.rpc('increment_blog_views', { blog_slug: slug });
  } catch (err) {
    console.warn('Could not call increment_blog_views RPC:', err);
  }

  return data as BlogPost;
}

/**
 * Fetch related posts by category.
 */
export async function getRelatedBlogs(category: string, currentSlug: string, limit = 3): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('is_published', true)
    .eq('category', category)
    .neq('slug', currentSlug)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch related blogs:', error.message);
    return [];
  }

  return (data as BlogPost[]) ?? [];
}

/**
 * ADMIN: Get all posts including drafts and unlisted.
 */
export async function getAllBlogsAdmin(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as BlogPost[]) ?? [];
}

export interface UpsertBlogInput {
  slug: string;
  title: string;
  excerpt?: string | null;
  content: string;
  cover_image?: string | null;
  author_name: string;
  author_avatar?: string | null;
  category: string;
  tags?: string[];
  read_time_minutes?: number;
  is_published?: boolean;
  is_featured?: boolean;
  published_at?: string | null;
}

/**
 * ADMIN: Create blog post.
 */
export async function createBlogAdmin(input: UpsertBlogInput): Promise<BlogPost> {
  const publishedAt = input.is_published ? (input.published_at || new Date().toISOString()) : null;

  const { data, error } = await supabase
    .from('blogs')
    .insert({
      ...input,
      published_at: publishedAt,
    })
    .select()
    .single();

  if (error) throw error;
  return data as BlogPost;
}

/**
 * ADMIN: Update blog post.
 */
export async function updateBlogAdmin(id: string, input: Partial<UpsertBlogInput>): Promise<BlogPost> {
  const updatePayload: Record<string, any> = { ...input, updated_at: new Date().toISOString() };

  if (input.is_published === true && !input.published_at) {
    updatePayload.published_at = new Date().toISOString();
  } else if (input.is_published === false) {
    updatePayload.published_at = null;
  }

  const { data, error } = await supabase
    .from('blogs')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as BlogPost;
}

/**
 * ADMIN: Delete blog post.
 */
export async function deleteBlogAdmin(id: string): Promise<void> {
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
