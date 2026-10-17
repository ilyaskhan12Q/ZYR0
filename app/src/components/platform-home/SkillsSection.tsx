import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlusCircle, Wrench } from 'lucide-react';
import { Blog8 } from '@/components/ui/blog8';
import { Button } from '@/components/ui/button';
import Reveal from './Reveal';
import { getAllPublicTools } from '@/services/tools';
import type { ToolItem } from '@/data/tools';

export default function SkillsSection() {
  const [skills, setSkills] = useState<ToolItem[]>([]);

  useEffect(() => {
    let mounted = true;
    getAllPublicTools().then((tools) => {
      if (!mounted) return;
      const skillItems = tools
        .filter((t) => t.item_type === 'skill' || t.item_type === 'tool_skill')
        .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
        .slice(0, 4);
      setSkills(skillItems);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const posts = skills.map((s) => ({
    id: s.id,
    title: s.name,
    summary: s.tagline || s.description,
    label: s.category,
    author: s.author?.name || s.source,
    published: s.featured ? 'Featured' : 'Skill',
    url: `/tools?type=skill&q=${encodeURIComponent(s.name)}`,
    image: s.imageUrl,
    coverColor: s.coverColor,
    tags: [s.category, s.featured ? 'Featured' : 'Community', s.source],
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
