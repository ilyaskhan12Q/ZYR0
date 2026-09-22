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
  tags: string[];
}

const featuredSkills: SkillItem[] = [
  {
    id: 'saas-scaffold',
    name: 'Full-Stack SaaS Generator',
    author: 'ZYR0 Core Team',
    authorType: 'official',
    category: 'Studio Builder',
    description: 'Autonomous scaffold generating React 19 frontend, Supabase multi-tenant auth, and Stripe billing in 60 seconds.',
    installs: '2.4k',
    rating: '4.9',
    tags: ['React 19', 'Supabase', 'Stripe'],
  },
  {
    id: 'school-grades',
    name: 'Smart Gradebook & Invoicing',
    author: 'ZYR0 Edu',
    authorType: 'official',
    category: 'School OS',
    description: 'Automates batch semester GPA computations, fee balance warnings, and parent WhatsApp/Email report card dispatches.',
    installs: '1.1k',
    rating: '4.8',
    tags: ['School OS', 'Fee Billing', 'Reports'],
  },
  {
    id: 'arxiv-agent',
    name: 'Deep Literature Synthesizer',
    author: 'ArXiv Agent Labs',
    authorType: 'community',
    category: 'Research AI',
    description: 'Crawls arXiv, CrossRef, and PubMed to construct cited meta-analysis summaries and verified LaTeX mathematical proofs.',
    installs: '3.8k',
    rating: '5.0',
    tags: ['Autonomous AI', 'LaTeX', 'Citations'],
  },
  {
    id: 'pr-reviewer',
    name: 'Automated PR Gatekeeper',
    author: 'CloudSec Guild',
    authorType: 'community',
    category: 'Work & Code',
    description: 'Reviews student and developer GitHub pull requests against OWASP Top 10 guidelines before code gets approved.',
    installs: '1.9k',
    rating: '4.9',
    tags: ['GitHub', 'Code Review', 'Security'],
  },
];

export default function SkillsSection() {
  return (
    <section id="skills" className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-[1264px] mx-auto px-6 md:px-16">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
            <div className="max-w-2xl">
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
                className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold tracking-tight mb-4"
                style={{ color: 'var(--zyro-text)' }}
              >
                Publish & install autonomous skills.
              </h2>
              <p
                className="text-base sm:text-lg leading-relaxed"
                style={{ color: 'var(--zyro-text-secondary)' }}
              >
                Supercharge ZYR0 Studio, School OS, and the Research Agent. Whether you are an individual developer or an enterprise, build and publish skills for the entire network.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/register?redirect=%2Fskills"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all duration-200"
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
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white transition-all duration-200"
                style={{ background: 'var(--zyro-accent)' }}
              >
                <span>Browse Skills Hub</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Reveal>

        {/* 4 Skill Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {featuredSkills.map((skill, index) => (
            <Reveal key={skill.id} delay={index * 0.08}>
              <div
                className="group relative rounded-2xl border p-5 sm:p-6 h-full flex flex-col justify-between transition-all duration-300 hover:border-[#7B7BDC]/50 hover:shadow-lg"
                style={{
                  background: 'var(--zyro-surface)',
                  borderColor: 'var(--zyro-border)',
                }}
              >
                <div>
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border"
                      style={{
                        background: 'var(--zyro-elevated)',
                        borderColor: 'var(--zyro-border)',
                        color: 'var(--zyro-text-muted)',
                      }}
                    >
                      {skill.category}
                    </span>
                    {skill.authorType === 'official' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Official
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Community
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    className="text-base font-semibold transition-colors mb-1.5"
                    style={{ color: 'var(--zyro-text)' }}
                  >
                    {skill.name}
                  </h3>

                  <p
                    className="text-xs mb-3 font-mono"
                    style={{ color: 'var(--zyro-text-muted)' }}
                  >
                    by {skill.author}
                  </p>

                  <p
                    className="text-xs leading-relaxed mb-4 line-clamp-3"
                    style={{ color: 'var(--zyro-text-secondary)' }}
                  >
                    {skill.description}
                  </p>
                </div>

                <div>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {skill.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded font-mono border"
                        style={{
                          background: 'var(--zyro-elevated)',
                          borderColor: 'var(--zyro-border)',
                          color: 'var(--zyro-text-secondary)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Metrics Footer */}
                  <div
                    className="pt-3 border-t flex items-center justify-between text-xs"
                    style={{
                      borderColor: 'var(--zyro-border)',
                      color: 'var(--zyro-text-muted)',
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" />
                      <span className="font-mono text-[11px]">{skill.installs}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-mono text-[11px]">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{skill.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bottom Banner callout */}
        <Reveal delay={0.35}>
          <div
            className="mt-6 rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{
              background: 'var(--zyro-surface)',
              borderColor: 'var(--zyro-border)',
            }}
          >
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-8 h-8 rounded-lg bg-[#7B7BDC]/15 border border-[#7B7BDC]/30 flex items-center justify-center text-[#7B7BDC] shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <p
                className="text-xs sm:text-sm leading-relaxed"
                style={{ color: 'var(--zyro-text-secondary)' }}
              >
                <span className="font-semibold" style={{ color: 'var(--zyro-text)' }}>
                  Open Developer Registry:
                </span>{' '}
                Build skills locally with the ZYR0 CLI, submit for automated verification, and distribute to thousands of institutions.
              </p>
            </div>
            <Link
              to="/contact"
              className="text-xs font-semibold text-[#7B7BDC] hover:underline transition-colors shrink-0 flex items-center gap-1"
            >
              <span>Developer SDK Docs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
