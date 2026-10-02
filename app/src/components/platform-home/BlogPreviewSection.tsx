import { Blog7 } from '@/components/ui/blog7';
import Reveal from './Reveal';

const posts = [
  {
    id: 'post-1',
    title: 'Building Autonomous AI Systems with Deterministic Guardrails',
    summary:
      'How ZYR0 Studio transforms natural language prompts into production-ready React 19 code without hallucinations or broken dependencies.',
    label: 'Engineering',
    author: 'ZYR0 Editorial',
    published: 'Sep 21, 2026',
    url: '/blog/autonomous-web-generation-guardrails',
    image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'post-2',
    title: 'The Future of Institutional Management: Beyond Legacy Portals',
    summary:
      'Why modern educational institutions need unified biometric attendance, automated fee ledgering, and intelligent timetable scheduling.',
    label: 'EdTech',
    author: 'ZYR0 Editorial',
    published: 'Sep 18, 2026',
    url: '/blog/modern-school-operating-system',
    image:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'post-3',
    title: 'Why Cryptographically Verifiable Internships Matter for Modern Hiring',
    summary:
      'How tamper-proof certificates and verified GitHub pull-request submissions eliminate credential inflation and accelerate engineering recruitment.',
    label: 'Careers',
    author: 'ZYR0 Editorial',
    published: 'Sep 14, 2026',
    url: '/blog/cryptographic-proof-of-work-internships',
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function BlogPreviewSection() {
  return (
    <section id="blog">
      <Reveal>
        <Blog7
          tagline="Editorial & Insights"
          heading="Latest from the blog."
          description="Engineering notes, EdTech deep dives, and career research from the team building the ZYR0 ecosystem."
          buttonText="View all articles"
          buttonUrl="/blog"
          posts={posts}
        />
      </Reveal>
    </section>
  );
}
