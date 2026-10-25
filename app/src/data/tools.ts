import type { ToolInstallCommand } from '@/lib/database.types';

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
  coverColor?: string; // Admin-picked hex for the gradient card hero (no image case)
  badge?: string; // 'Official', 'Trending', 'Popular', 'Beta'
  featured?: boolean;
  capabilities: string[];
  installCommand?: string;
  installCommands?: ToolInstallCommand[];
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

/**
 * Gradient background for card/preview heroes. Custom admin color wins when valid;
 * otherwise the branded twilight → periwinkle → sapphire ramp.
 */
export function coverGradient(coverColor?: string): string {
  if (coverColor && /^#[0-9a-fA-F]{3,8}$/.test(coverColor.trim())) {
    const c = coverColor.trim();
    return `linear-gradient(135deg, ${c} 0%, ${c}dd 55%, #120159 135%)`;
  }
  return 'linear-gradient(135deg, #120159 0%, rgba(123,123,220,0.85) 55%, #0051C3 110%)';
}
