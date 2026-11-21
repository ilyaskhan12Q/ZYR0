import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlusCircle, Wrench } from 'lucide-react';
import { Blog8 } from '@/components/ui/blog8';
import { Button } from '@/components/ui/button';
import Reveal from './Reveal';
import { getRecommendedTools } from '@/services/tools';
import type { ToolItem } from '@/data/tools';

/**
 * Resilient destination builder:
 * Directs directly to the canonical detail page /tools/:slug when available.
 * Gracefully falls back to /tools?type=skill or /tools if slug is missing.
 */
function getToolDestination(tool?: Partial<ToolItem> | null): string {
  if (tool?.slug && tool.slug.trim().length > 0) {
    return `/tools/${encodeURIComponent(tool.slug.trim())}`;
  }
  if (tool?.item_type === 'skill') {
    return '/tools?type=skill';
  }
  return '/tools';
}

function getActionLabel(itemType?: string): string {
  if (itemType === 'skill') return 'Inspect skill';
  if (itemType === 'tool_skill') return 'Inspect skill & tool';
  return 'Inspect tool';
}

// Resilient fallback posts in the rare event of offline state or empty initial database
const FALLBACK_SHOWCASE_TOOLS: ToolItem[] = [
  {
    id: 'fallback-ecc',
    slug: 'ecc-redu',
    name: 'ECC (Engineering Capability Cortex)',
    tagline: 'Plans before it builds, verifies changes with tests, and turns repeated wins into reusable agent skills.',
    description: 'ECC gives AI coding agents a coordinated engineering system with 71 agents and 300+ skills.',
    item_type: 'skill',
    category: 'AI & Agents',
    tags: ['Agent', 'Skills', 'DeveloperTools'],
    source: 'GitHub',
    sourceUrl: 'https://github.com/affaan-m/ecc',
    badge: 'Verified',
    featured: true,
    capabilities: ['71 Specialized Agents', '302 Production Skills', 'AgentShield Scanning'],
    author: { name: 'Affan Mustafa' },
  },
  {
    id: 'fallback-rea',
    slug: 'rea-reverse-engineer-anything-8bcq',
    name: 'REA (Reverse Engineer Anything)',
    tagline: 'Connects AI coding agents to local reverse engineering tools over Model Context Protocol (MCP).',
    description: 'Reverse engineer native binaries, Electron apps, .NET assemblies, and Android APKs with complete evidence.',
    item_type: 'tool',
    category: 'Developer Tools',
    tags: ['Reverse Engineering', 'MCP Server', 'Claude Code'],
    source: 'GitHub',
    sourceUrl: 'https://github.com/morluto/rea',
    badge: 'Trending',
    featured: true,
    capabilities: ['Native Binary Analysis', 'JavaScript & Electron Analysis', 'MCP Server Integration'],
    author: { name: 'morluto' },
  },
];

export default function SkillsSection() {
  const [tools, setTools] = useState<ToolItem[]>([]);

  useEffect(() => {
    let mounted = true;

    getRecommendedTools(4, 'skill').then((items) => {
      if (!mounted) return;
      if (items && items.length > 0) {
        setTools(items);
      } else {
        // Fallback to static items if DB has zero approved records
        setTools(FALLBACK_SHOWCASE_TOOLS);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const displayItems = tools.length > 0 ? tools : FALLBACK_SHOWCASE_TOOLS;

  const posts = displayItems.map((s) => ({
    id: s.id,
    title: s.name,
    summary: s.tagline || s.description,
    label: s.category,
    author: s.author?.name || s.source,
    published: s.featured ? 'Featured' : s.badge || (s.item_type === 'skill' ? 'Skill' : 'Tool'),
    url: getToolDestination(s),
    actionLabel: getActionLabel(s.item_type),
    image: s.imageUrl,
    coverColor: s.coverColor,
    tags: [s.category, s.featured ? 'Featured' : 'Verified', s.source],
  }));

  return (
    <section id="skills">
      <Reveal>
        <Blog8
          heading="Publish & install autonomous skills."
          headingClassName="font-serif font-normal text-3xl md:text-5xl tracking-tight text-[var(--zyro-text)]"
          description="Supercharge ZYR0 Studio, School OS, and the Research Agent. Whether you are an individual developer or an enterprise, build and publish skills for the entire network."
          actions={
            <>
              <Link to="/tools?type=skill">
                <Button
                  className="rounded-full px-6 py-2.5 text-sm font-semibold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                  style={{
                    background: 'var(--zyro-accent)',
                    color: '#fff',
                  }}
                >
                  <span>Browse Skills</span>
                  <ArrowRight className="ml-1.5 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/tools">
                <Button
                  variant="ghost"
                  className="rounded-full px-6 py-2.5 text-sm font-medium border transition-all"
                  style={{
                    borderColor: 'var(--zyro-border)',
                    color: 'var(--zyro-text-secondary)',
                    background: 'var(--zyro-surface)',
                  }}
                >
                  <Wrench className="mr-1.5 w-4 h-4 text-[var(--zyro-accent)]" />
                  <span>Browse Tools</span>
                </Button>
              </Link>
              <Link to="/tools?submit=1">
                <Button
                  variant="ghost"
                  className="rounded-full px-6 py-2.5 text-sm font-medium border transition-all"
                  style={{
                    borderColor: 'var(--zyro-border)',
                    color: 'var(--zyro-text-secondary)',
                    background: 'var(--zyro-surface)',
                  }}
                >
                  <PlusCircle className="mr-1.5 w-4 h-4 text-[var(--zyro-accent)]" />
                  <span>Publish a Skill</span>
                </Button>
              </Link>
            </>
          }
          posts={posts}
        />
      </Reveal>
    </section>
  );
}
