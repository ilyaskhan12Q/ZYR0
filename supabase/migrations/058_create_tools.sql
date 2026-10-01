-- Migration: 058_create_tools.sql
-- Description: Create tools table with RLS policies, submission workflows, item types, and search indexes.

CREATE TABLE IF NOT EXISTS public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'tool' CHECK (item_type IN ('tool', 'skill', 'tool_skill')),
  category TEXT NOT NULL CHECK (category IN ('AI & Agents', 'Developer Tools', 'Research & Docs', 'Productivity')),
  tags TEXT[] DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'Web',
  source_url TEXT NOT NULL,
  documentation_url TEXT,
  image_url TEXT,
  badge TEXT,
  featured BOOLEAN DEFAULT false,
  capabilities TEXT[] DEFAULT '{}',
  install_command TEXT,
  install_instructions TEXT,
  version TEXT,
  author_name TEXT NOT NULL DEFAULT 'Community Builder',
  author_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  moderator_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning-fast queries & filtering
CREATE INDEX IF NOT EXISTS idx_tools_slug ON public.tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_status ON public.tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_category ON public.tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_item_type ON public.tools(item_type);
CREATE INDEX IF NOT EXISTS idx_tools_owner_id ON public.tools(owner_id);
CREATE INDEX IF NOT EXISTS idx_tools_featured ON public.tools(featured) WHERE status = 'approved';

-- Enable Row Level Security
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can view approved tools
DROP POLICY IF EXISTS "Public can view approved tools" ON public.tools;
CREATE POLICY "Public can view approved tools"
  ON public.tools FOR SELECT
  USING (status = 'approved');

-- Policy 2: Authenticated users can view their own submissions
DROP POLICY IF EXISTS "Users can view own tools" ON public.tools;
CREATE POLICY "Users can view own tools"
  ON public.tools FOR SELECT
  USING (auth.uid() = owner_id);

-- Policy 3: Authenticated users can insert their own tool submissions (status defaults to pending)
DROP POLICY IF EXISTS "Authenticated users can submit tools" ON public.tools;
CREATE POLICY "Authenticated users can submit tools"
  ON public.tools FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() = owner_id AND
    status = 'pending'
  );

-- Policy 4: Tool owners can update their pending submissions
DROP POLICY IF EXISTS "Users can edit pending submissions" ON public.tools;
CREATE POLICY "Users can edit pending submissions"
  ON public.tools FOR UPDATE
  USING (auth.uid() = owner_id AND status = 'pending')
  WITH CHECK (auth.uid() = owner_id AND status = 'pending');

-- Policy 5: Admins have full CRUD access over all tools
DROP POLICY IF EXISTS "Admins have full access to tools" ON public.tools;
CREATE POLICY "Admins have full access to tools"
  ON public.tools FOR ALL
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
