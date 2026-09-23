import { Link } from 'react-router-dom';
import { Download, Star, ArrowRight, PlusCircle, CheckCircle2, Blocks, Shield } from 'lucide-react';
import Reveal from './Reveal';

interface SkillItem {
  id: string;
  name: string;
  author: string;
  authorType: 'official' | 'community';
  category: string;
  description: string;
  installs: string;
  rating: string;
}

const featuredSkills: SkillItem[] = [
  {
    id: 'saas-scaffold',
    name: 'Full-Stack SaaS Generator',
    author: 'ZYR0 Core Team',
    authorType: 'official',
    category: 'Studio Builder',
    description:
      'Autonomous scaffold generating React 19 frontend, Supabase multi-tenant auth, and Stripe billing in 60 seconds.',
    installs: '2.4k',
    rating: '4.9',
  },
  {
    id: 'school-grades',
    name: 'Smart Gradebook & Invoicing',
    author: 'ZYR0 Edu',
    authorType: 'official',
    category: 'School OS',
    description:
      'Automates batch semester GPA computations, fee balance warnings, and parent WhatsApp/Email report card dispatches.',
    installs: '1.1k',
    rating: '4.8',
  },
  {
    id: 'arxiv-agent',
    name: 'Deep Literature Synthesizer',
    author: 'ArXiv Agent Labs',
    authorType: 'community',
    category: 'Research AI',
    description:
      'Crawls arXiv, CrossRef, and PubMed to construct cited meta-analysis summaries and verified LaTeX mathematical proofs.',
    installs: '3.8k',
    rating: '5.0',
  },
  {
    id: 'pr-reviewer',
    name: 'Automated PR Gatekeeper',
    author: 'CloudSec Guild',
    authorType: 'community',
    category: 'Work & Code',
    description:
      'Reviews student and developer GitHub pull requests against OWASP Top 10 guidelines before code gets approved.',
    installs: '1.9k',
    rating: '4.9',
  },
];

// ponytail: monogram = name initials; swap for real skill icons when an asset set exists
const monogram = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

export default function SkillsSection() {
  return (
    <section id="skills" className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-[1264px] mx-auto px-6 md:px-16">
        <div className="grid gap-10 md:gap-12 md:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] items-start">
          {/* Left rail: header + CTAs + registry note */}
          <Reveal>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 border"
              style={{
                color: 'var(--zyro-accent)',
                borderColor: 'var(--zyro-border)',
                background: 'var(--zyro-accent-muted)',
              }}
            >
              <Blocks className="w-3.5 h-3.5" />
              <span>Extensible Ecosystem</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-[2.75rem] font-display font-semibold tracking-tight mb-4"
              style={{ color: 'var(--zyro-text)' }}
            >
              Publish & install autonomous skills.
            </h2>
            <p
              className="text-base leading-relaxed mb-6"
              style={{ color: 'var(--zyro-text-secondary)' }}
            >
              Supercharge ZYR0 Studio, School OS, and the Research Agent. Whether you are an
              individual developer or an enterprise, build and publish skills for the entire
              network.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Link
                to="/register?redirect=%2Fskills"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all duration-200 cursor-pointer"
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
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white transition-all duration-200 cursor-pointer hover:opacity-90"
                style={{ background: 'var(--zyro-accent)' }}
              >
                <span>Browse Skills Hub</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div
              className="flex gap-3 rounded-xl border p-4"
              style={{
                background: 'var(--zyro-surface)',
                borderColor: 'var(--zyro-border)',
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-[#7B7BDC]/15 border border-[#7B7BDC]/30 flex items-center justify-center text-[#7B7BDC] shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--zyro-text-secondary)' }}
              >
                <span className="font-semibold" style={{ color: 'var(--zyro-text)' }}>
                  Open Developer Registry:
                </span>{' '}
                Build skills locally with the ZYR0 CLI, submit for automated verification, and
                distribute to thousands of institutions.{' '}
                <Link
                  to="/contact"
                  className="font-semibold text-[#7B7BDC] hover:underline transition-colors"
                >
                  Developer SDK Docs →
                </Link>
              </p>
            </div>
          </Reveal>

          {/* Right: 2×2 skill card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            {featuredSkills.map((skill, index) => (
              <Reveal key={skill.id} delay={index * 0.08}>
                <Link
                  to="/skills"
                  aria-label={`${skill.name} by ${skill.author} — view in Skills Hub`}
                  className="group h-full flex flex-col rounded-2xl border p-5 sm:p-6 cursor-pointer transition-all duration-200 bg-[var(--zyro-surface)] border-[var(--zyro-border)] hover:border-[#7B7BDC]/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B7BDC] focus-visible:ring-offset-2"
                >
                  {/* Header: monogram + category + trust */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-9 h-9 rounded-lg border flex items-center justify-center text-[11px] font-semibold shrink-0"
                      style={{
                        background: 'var(--zyro-elevated)',
                        borderColor: 'var(--zyro-border)',
                        color: 'var(--zyro-text-secondary)',
                      }}
                    >
                      {monogram(skill.name)}
                    </div>
                    <span
                      className="text-[11px] font-medium uppercase tracking-wider"
                      style={{ color: 'var(--zyro-text-muted)' }}
                    >
                      {skill.category}
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-sky-500">
                      {skill.authorType === 'official' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {skill.authorType === 'official' ? 'Official' : 'Community'}
                    </span>
                  </div>

                  <h3
                    className="text-lg font-display font-semibold mb-1.5 leading-snug"
                    style={{ color: 'var(--zyro-text)' }}
                  >
                    {skill.name}
                  </h3>
                  <p
                    className="text-[11px] mb-3 font-mono"
                    style={{ color: 'var(--zyro-text-muted)' }}
                  >
                    by {skill.author}
                  </p>
                  <p
                    className="text-sm leading-relaxed mb-5 line-clamp-2"
                    style={{ color: 'var(--zyro-text-secondary)' }}
                  >
                    {skill.description}
                  </p>

                  {/* Footer: stats + arrow affordance */}
                  <div
                    className="mt-auto pt-3 border-t flex items-center justify-between text-xs"
                    style={{
                      borderColor: 'var(--zyro-border)',
                      color: 'var(--zyro-text-muted)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                        <Download className="w-3.5 h-3.5" />
                        {skill.installs}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {skill.rating}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#7B7BDC]" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.2}>
          <p className="mt-8 text-center sm:text-right">
            <Link
              to="/skills"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#7B7BDC] hover:underline transition-colors cursor-pointer"
            >
              <span>Browse all skills</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
