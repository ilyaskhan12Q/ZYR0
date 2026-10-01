export type ToolSource = 'ZYR0 Native' | 'GitHub' | 'Hugging Face' | 'Web';

export type ToolItemType = 'tool' | 'skill' | 'tool_skill';

export type ToolCategory = 'All' | 'ZYR0 Native' | 'AI & Agents' | 'Developer Tools' | 'Research & Docs' | 'Productivity';

export interface ToolItem {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  item_type?: ToolItemType;
  category: Exclude<ToolCategory, 'All' | 'ZYR0 Native'>;
  tags: string[];
  source: ToolSource;
  sourceUrl: string;
  documentationUrl?: string;
  imageUrl?: string;
  badge?: string; // 'Official', 'Trending', 'Popular', 'Beta'
  featured?: boolean;
  capabilities: string[];
  installCommand?: string;
  installInstructions?: string;
  version?: string;
  author?: {
    name: string;
    url?: string;
  };
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  'All',
  'ZYR0 Native',
  'AI & Agents',
  'Developer Tools',
  'Research & Docs',
  'Productivity',
];

export const TOOLS_DATA: ToolItem[] = [];
