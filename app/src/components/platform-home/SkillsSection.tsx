import { Link } from 'react-router-dom';
import { ArrowRight, PlusCircle } from 'lucide-react';
import { Blog8 } from '@/components/ui/blog8';
import Reveal from './Reveal';

const skills = [
  {
    id: 'saas-scaffold',
    title: 'Full-Stack SaaS Generator',
    summary:
      'Autonomous scaffold generating React 19 frontend, Supabase multi-tenant auth, and Stripe billing in 60 seconds.',
    author: 'ZYR0 Core Team',
    official: true,
    category: 'Studio Builder',
    installs: '2.4k',
    rating: '4.9',
    image:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'school-grades',
    title: 'Smart Gradebook & Invoicing',
    summary:
      'Automates batch semester GPA computations, fee balance warnings, and parent WhatsApp/Email report card dispatches.',
    author: 'ZYR0 Edu',
    official: true,
    category: 'School OS',
    installs: '1.1k',
    rating: '4.8',
    image:
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'arxiv-agent',
    title: 'Deep Literature Synthesizer',
    summary:
      'Crawls arXiv, CrossRef, and PubMed to construct cited meta-analysis summaries and verified LaTeX mathematical proofs.',
    author: 'ArXiv Agent Labs',
    official: false,
    category: 'Research AI',
    installs: '3.8k',
    rating: '5.0',
    image:
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'pr-reviewer',
    title: 'Automated PR Gatekeeper',
    summary:
      'Reviews student and developer GitHub pull requests against OWASP Top 10 guidelines before code gets approved.',
    author: 'CloudSec Guild',
    official: false,
    category: 'Work & Code',
    installs: '1.9k',
    rating: '4.9',
    image:
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80',
  },
];

const posts = skills.map((s) => ({
  id: s.id,
  title: s.title,
  summary: s.summary,
  label: s.category,
  author: s.author,
  published: `${s.installs} installs`,
  url: '/skills',
  image: s.image,
  tags: [s.category, s.official ? 'Official' : 'Community', `★ ${s.rating}`],
}));

export default function SkillsSection() {
  return (
    <section id="skills">
      <Reveal>
        <Blog8
          heading="Publish & install autonomous skills."
          description="Supercharge ZYR0 Studio, School OS, and the Research Agent. Whether you are an individual developer or an enterprise, build and publish skills for the entire network."
          actions={
            <>
              <Link
                to="/register?redirect=%2Fskills"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all duration-200 cursor-pointer"
                style={{
                  borderColor: 'var(--zyro-border)',
                  color: 'var(--zyro-text)',
                  background: 'var(--zyro-surface)',
                }}
              >
                <PlusCircle className="w-4 h-4 text-[#7B7BDC]" />
                <span>Publish a Skill</span>
              </Link>
              <Link
                to="/skills"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 cursor-pointer hover:opacity-90"
                style={{ background: 'var(--zyro-accent)' }}
              >
                <span>Browse Skills Hub</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          }
          posts={posts}
        />
      </Reveal>
    </section>
  );
}
