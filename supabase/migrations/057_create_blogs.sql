-- Migration: 057_create_blogs.sql
-- Description: Create blogs table with RLS policies, tags, view tracking, and performance indexes.

CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'ZYR0 Team',
  author_avatar TEXT,
  category TEXT NOT NULL DEFAULT 'Engineering',
  tags TEXT[] DEFAULT '{}',
  read_time_minutes INT DEFAULT 5,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  views_count INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON public.blogs(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs(category);

-- Enable RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can view published blogs
DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
CREATE POLICY "Public can view published blogs"
  ON public.blogs FOR SELECT
  USING (is_published = true);

-- Policy 2: Admins have full CRUD access
DROP POLICY IF EXISTS "Admins have full access to blogs" ON public.blogs;
CREATE POLICY "Admins have full access to blogs"
  ON public.blogs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Function to increment blog views safely
CREATE OR REPLACE FUNCTION increment_blog_views(blog_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.blogs
  SET views_count = views_count + 1
  WHERE slug = blog_slug;
END;
$$;
