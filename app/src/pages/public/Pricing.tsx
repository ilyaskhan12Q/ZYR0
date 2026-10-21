import { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import AudienceToggle, { type AudienceType } from '@/components/pricing/AudienceToggle';
import BillingToggle, { type BillingInterval } from '@/components/pricing/BillingToggle';
import PricingCard, { type PricingCardData } from '@/components/pricing/PricingCard';
import BookDemoModal from '@/components/pricing/BookDemoModal';
import UpgradePlanModal from '@/components/pricing/UpgradePlanModal';
import { useAuth } from '@/contexts/AuthContext';
import {
  Check,
  Minus,
  Sparkles,
  Building2,
  ChevronDown,
  CreditCard,
  ArrowRight,
} from 'lucide-react';

export default function Pricing() {
  const { user, profile } = useAuth();
  const [audience, setAudience] = useState<AudienceType>('personal');
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [targetUpgradePlan, setTargetUpgradePlan] = useState<'go' | 'plus'>('plus');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleOpenUpgrade = (plan: 'go' | 'plus') => {
    setTargetUpgradePlan(plan);
    setUpgradeModalOpen(true);
  };

  const personalCards: PricingCardData[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Essential toolkit to kickstart your research, build developer skills, and apply to tech roles.',
      monthlyPrice: '$0',
      yearlyPrice: '$0',
      ctaLabel: user ? 'Current Plan' : 'Get Started Free',
      ctaHref: user ? (profile?.role ? `/${profile.role}/dashboard` : '/student/workspace') : '/register',
      features: [
        { highlight: 'Verified internships:', text: 'Browse and apply with PR-style workspaces' },
        { highlight: 'Cryptographic credentials:', text: 'Earn tamper-proof completion certificates (SHA-256)' },
        { highlight: 'AI research agent:', text: 'Standard synthesis with verified citations (20 req/min)' },
        { highlight: 'Studio sandbox:', text: 'Interactive prompt-to-app simulation playground' },
        { highlight: 'Developer ToolHub:', text: 'Curated library of open-source utilities and helpers' },
        { highlight: 'Community support:', text: 'Public documentation and active builder forums' },
      ],
    },
    {
      id: 'go',
      name: 'ZYR0 GO',
      description: 'For ambitious students & active creators wanting faster research throughput and priority job applications.',
      monthlyPrice: '$4.99',
      yearlyPrice: '$3.99',
      yearlySubtext: '$47.90 billed annually (Save ~20%)',
      ctaLabel: 'Upgrade to GO',
      ctaHref: user ? undefined : '/register?plan=go',
      onCtaClick: user ? () => handleOpenUpgrade('go') : undefined,
      ctaVariant: 'soft-accent',
      features: [
        { text: 'Everything in Free, plus:' },
        { highlight: '5× faster synthesis:', text: 'Expanded context capacity with lower latency' },
        { highlight: 'One-click exports:', text: 'Download comprehensive research to Markdown & PDF' },
        { highlight: 'Multi-source citations:', text: 'Direct export from arXiv, PubMed & OpenAlex' },
        { highlight: 'Priority candidate status:', text: 'Highlighted profile on active company job boards' },
        { highlight: 'Studio architecture presets:', text: 'Pre-built full-stack components and layouts' },
      ],
    },
    {
      id: 'plus',
      name: 'ZYR0 PLUS',
      badge: 'Most Popular',
      highlighted: true,
      description: 'The flagship power experience with deep multi-step AI reasoning and priority Studio builder access.',
      monthlyPrice: '$9.99',
      yearlyPrice: '$7.99',
      yearlySubtext: '$95.90 billed annually (Save ~20%)',
      ctaLabel: 'Upgrade to PLUS',
      ctaHref: user ? undefined : '/register?plan=plus',
      onCtaClick: user ? () => handleOpenUpgrade('plus') : undefined,
      features: [
        { text: 'Everything in ZYR0 GO, plus:' },
        { highlight: 'Deep reasoning models:', text: 'Multi-step evidence synthesis for complex queries' },
        { highlight: 'Zero queue delays:', text: 'Dedicated priority compute queue during peak traffic' },
        { highlight: 'Persistent research vault:', text: 'Unlimited session history & cross-topic memory' },
        { highlight: 'VIP Studio builder:', text: 'Early access to the autonomous prompt-to-app engine', badge: 'Early Access' },
        { highlight: 'Production code export:', text: 'Clean React 19 + TypeScript + Tailwind source code', badge: 'Early Access' },
        { highlight: 'All-in-one ecosystem pass:', text: 'One subscription covers all current and upcoming tools', badge: 'In Rollout' },
      ],
    },
  ];

  const businessCards: PricingCardData[] = [
    {
      id: 'teams',
      name: 'Teams',
      description: 'For startups, engineering guilds, and hiring managers posting verified internships and evaluating candidate code.',
      monthlyPrice: '$0',
      yearlyPrice: '$0',
      periodText: '/month',
      ctaLabel: 'Start Hiring Free',
      ctaHref: '/register/company',
      features: [
        { highlight: 'Zero platform fees:', text: 'Post unlimited verified internship listings with custom screening' },
        { highlight: 'PR evaluation suite:', text: 'Review candidate GitHub pull requests, code & portfolios' },
        { highlight: 'Cryptographic offers:', text: 'Issue signed, downloadable offer letters and contracts' },
        { highlight: 'Tamper-proof credentials:', text: 'Award cryptographic completion certificates (SHA-256)' },
        { highlight: 'Hiring team roles:', text: 'Granular permissions for Owners, Admins, and Reviewers' },
        { highlight: 'Real-time telemetry:', text: 'Live applicant pipeline dashboards and scoring analytics' },
      ],
    },
    {
      id: 'custom',
      name: 'Custom',
      badge: 'Organization',
      highlighted: true,
      topProducts: ['ZYR0 SchoolOS', 'ZYR0 Studio', 'ZYR0 Work', 'ZYR0 Research'],
      description: 'Comprehensive institutional deployment for schools, universities, multi-campus academies, and enterprise hiring guilds.',
      monthlyPrice: 'Custom',
      yearlyPrice: 'Custom',
      periodText: '',
      yearlySubtext: 'Tailored institutional & enterprise agreements',
      ctaLabel: 'Contact Sales',
      ctaIcon: Building2,
      onCtaClick: () => setDemoModalOpen(true),
      features: [
        { highlight: 'SchoolOS deployment:', text: 'Enterprise engine for attendance, grading & timetable scheduling', badge: 'In Rollout' },
        { highlight: 'Multi-role portals:', text: 'Tailored dashboards for Principals, Faculty, Students & Parents', badge: 'In Rollout' },
        { highlight: 'Private cloud Studio:', text: 'Self-hosted AI builder environment with custom design tokens' },
        { highlight: 'Campus placement networks:', text: 'Automated student cohort scoring and employer matching' },
        { highlight: 'Enterprise governance:', text: 'Dedicated account manager, customized SLAs & SSO security' },
        { highlight: 'Institutional billing:', text: 'Annual purchase orders, custom invoicing, and direct contracting' },
      ],
    },
  ];

  const comparisonCategories = [
    {
      category: 'ZYR0 Work (Internships & Workforce)',
      rows: [
        { feature: 'Internship discovery & search filters', free: true, go: true, plus: true, teams: true, ent: true, status: 'Live' },
        { feature: 'Direct internship applications & tracking', free: true, go: true, plus: true, teams: true, ent: true, status: 'Live' },
        { feature: 'PR-style task submission workspace', free: true, go: true, plus: true, teams: true, ent: true, status: 'Live' },
        { feature: 'Cryptographic completion certificates', free: true, go: true, plus: true, teams: true, ent: true, status: 'Live' },
        { feature: 'Featured applicant profile placement', free: false, go: true, plus: true, teams: false, ent: true, status: 'Live' },
        { feature: 'Company internship posting & applicant review', free: false, go: false, plus: false, teams: true, ent: true, status: 'Live' },
        { feature: 'Company multi-member team permissions', free: false, go: false, plus: false, teams: true, ent: true, status: 'Live' },
      ],
    },
    {
      category: 'ZYR0 Research (Autonomous AI Agent)',
      rows: [
        { feature: 'Standard research chat & question answering', free: true, go: true, plus: true, teams: true, ent: true, status: 'Live' },
        { feature: 'Verifiable citations (OpenAlex, arXiv, PubMed)', free: true, go: true, plus: true, teams: true, ent: true, status: 'Live' },
        { feature: 'Markdown & PDF report export', free: true, go: true, plus: true, teams: true, ent: true, status: 'Live' },
        { feature: 'AI request rate limits', free: '20 req/min', go: 'High', plus: 'Priority', teams: 'Standard', ent: 'Dedicated', status: 'Live' },
        { feature: 'Deep multi-step research synthesis', free: 'Standard', go: 'Extended', plus: 'Deep Reasoning', teams: 'Standard', ent: 'Custom Models', status: 'Live' },
        { feature: 'Priority model compute during peak hours', free: false, go: false, plus: true, teams: false, ent: true, status: 'Live' },
      ],
    },
    {
      category: 'ZYR0 Studio (AI Web & App Builder)',
      rows: [
        { feature: 'Interactive prompt-to-code simulator', free: true, go: true, plus: true, teams: true, ent: true, status: 'Live' },
        { feature: 'Curated preset architecture templates', free: true, go: true, plus: true, teams: true, ent: true, status: 'Live' },
        { feature: 'Autonomous prompt-to-app generator', free: 'Waitlist', go: 'Waitlist', plus: 'VIP Early Access', teams: 'Waitlist', ent: 'Private Cloud', status: 'Early Access' },
        { feature: 'Clean TypeScript/Vite/Tailwind code export', free: false, go: false, plus: 'Early Access', teams: false, ent: 'Full Export', status: 'Early Access' },
        { feature: '1-click cloud deployment & custom domains', free: false, go: false, plus: 'Early Access', teams: false, ent: 'Enterprise CDN', status: 'Early Access' },
      ],
    },
    {
      category: 'ZYR0 SchoolOS (Education Operating System)',
      rows: [
        { feature: 'Interactive role perspective switcher & tour', free: true, go: true, plus: true, teams: true, ent: true, status: 'Live' },
        { feature: 'Time & revenue ROI calculator', free: true, go: true, plus: true, teams: true, ent: true, status: 'Live' },
        { feature: 'Institutional demo walkthrough session', free: false, go: false, plus: false, teams: false, ent: true, status: 'Live' },
        { feature: 'Attendance, grading & timetable management', free: false, go: false, plus: false, teams: false, ent: 'Institutional', status: 'In Rollout' },
        { feature: 'Multi-campus administrative governance', free: false, go: false, plus: false, teams: false, ent: 'Institutional', status: 'In Rollout' },
      ],
    },
    {
      category: 'Support & Administration',
      rows: [
        { feature: 'Community support & help documentation', free: true, go: true, plus: true, teams: true, ent: true, status: 'Live' },
        { feature: 'Priority email developer support', free: false, go: false, plus: true, teams: true, ent: true, status: 'Live' },
        { feature: 'Dedicated account manager & SLA', free: false, go: false, plus: false, teams: false, ent: true, status: 'Live' },
        { feature: 'Invoicing & purchase order contracting', free: false, go: false, plus: false, teams: false, ent: true, status: 'Live' },
      ],
    },
  ];

  const faqs = [
    {
      q: 'What is the difference between ZYR0 GO and ZYR0 PLUS?',
      a: 'ZYR0 GO ($4.99/mo) is designed for students and creators who want expanded research capacity, faster synthesis, and verified application status. ZYR0 PLUS ($9.99/mo) is the full flagship tier with deep multi-step reasoning, priority compute queues, unlimited session history, and VIP early access to the upcoming ZYR0 Studio autonomous app builder and code exports.',
    },
    {
      q: 'Is the Teams plan really $0/month?',
      a: 'Yes. Companies, engineering guilds, and startups can sign up, post internship listings, review applicants, assign PR-style tasks, and issue cryptographic certificates completely free of charge.',
    },
    {
      q: 'What is included in the Custom tier?',
      a: 'The Custom tier provides tailored organizational deployments covering SchoolOS (admissions, attendance, grading engine, timetable scheduler), enterprise ZYR0 Studio private cloud hosting, custom hiring pipelines, dedicated SLAs, and institutional invoicing.',
    },
    {
      q: 'Can I cancel or switch billing intervals anytime?',
      a: 'Yes. You can cancel your subscription at any time with no lock-in. Annual billing saves approximately 20% compared to paying monthly.',
    },
    {
      q: 'How does the unified subscription work across products?',
      a: 'A single ZYR0 PLUS subscription covers eligible benefits across all products in the ecosystem. You do not need to buy separate accounts for Research, Studio, or Work.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 overflow-x-clip">
      <SEO
        title="Pricing & Plans — ZYR0 Ecosystem"
        description="Transparent pricing for students, creators, and organizations. Start free with ZYR0 Work & Research, unlock ZYR0 GO ($4.99) or ZYR0 PLUS ($9.99), or scale with Teams and Custom solutions."
        path="/pricing"
      />

      <main className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase border border-border bg-muted text-muted-foreground mb-4">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Transparent Ecosystem Pricing
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-foreground leading-[1.1]">
            One Platform.{' '}
            <span className="italic" style={{ color: 'var(--zyro-accent)' }}>
              Every Tier of Ambition.
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Choose Personal plans for individual students, researchers, and creators — or Business plans for hiring teams, schools, and enterprise deployments.
          </p>

          {/* Audience Switcher (Personal vs Business) */}
          <div className="mt-8 flex justify-center">
            <AudienceToggle audience={audience} onChange={setAudience} />
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mb-24">
          {audience === 'personal' ? (
            <div className="max-w-6xl mx-auto">
              {/* Billing Toggle aligned to left above Free card + Link to Billing Help on right */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <BillingToggle interval={interval} onChange={setInterval} />
                <Link
                  to="/billing-help"
                  className="text-[11px] font-mono text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>See billing help & policies</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
                {personalCards.map((card) => (
                  <PricingCard key={card.id} card={card} interval={interval} />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto items-stretch">
              {businessCards.map((card) => (
                <PricingCard key={card.id} card={card} interval={interval} />
              ))}
            </div>
          )}
        </div>

        {/* Feature Comparison Section */}
        <div className="mb-24 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
              Detailed Breakdown
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-normal text-foreground mt-2">
              Compare Features Across Tiers
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Complete transparency on live capabilities versus upcoming rollout features.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-left text-xs border-collapse">
                <colgroup>
                  <col className="w-[40%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border bg-muted/60">
                    <th className="py-3.5 px-4 sm:px-6 font-semibold text-foreground text-left">
                      Capability
                    </th>
                    <th className="py-3.5 px-2 font-semibold text-foreground text-center">
                      Free
                    </th>
                    <th className="py-3.5 px-2 font-semibold text-foreground text-center">
                      GO ($4.99)
                    </th>
                    <th className="py-3.5 px-2 font-semibold text-accent text-center">
                      PLUS ($9.99)
                    </th>
                    <th className="py-3.5 px-2 font-semibold text-foreground text-center">
                      Teams
                    </th>
                    <th className="py-3.5 px-2 font-semibold text-foreground text-center">
                      Custom
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonCategories.map((cat, catIdx) => (
                    <Fragment key={catIdx}>
                      <tr className="bg-muted/40 border-t border-b border-border">
                        <td
                          colSpan={6}
                          className="py-2.5 px-4 sm:px-6 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          {cat.category}
                        </td>
                      </tr>
                      {cat.rows.map((row, rowIdx) => (
                        <tr
                          key={`row-${catIdx}-${rowIdx}`}
                          className="border-b border-border/60 hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-3 px-4 sm:px-6 text-foreground font-medium align-middle">
                            <div className="flex items-center gap-2">
                              <span>{row.feature}</span>
                              {row.status !== 'Live' && (
                                <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                                  ({row.status})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center align-middle">
                            <div className="flex items-center justify-center">
                              {typeof row.free === 'boolean' ? (
                                row.free ? (
                                  <Check className="w-4 h-4 text-foreground" />
                                ) : (
                                  <Minus className="w-4 h-4 text-muted-foreground/30" />
                                )
                              ) : (
                                <span className="font-mono text-[11px] text-muted-foreground">
                                  {row.free}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center align-middle">
                            <div className="flex items-center justify-center">
                              {typeof row.go === 'boolean' ? (
                                row.go ? (
                                  <Check className="w-4 h-4 text-foreground" />
                                ) : (
                                  <Minus className="w-4 h-4 text-muted-foreground/30" />
                                )
                              ) : (
                                <span className="font-mono text-[11px] text-muted-foreground">
                                  {row.go}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center align-middle bg-accent/[0.02]">
                            <div className="flex items-center justify-center">
                              {typeof row.plus === 'boolean' ? (
                                row.plus ? (
                                  <Check className="w-4 h-4 text-accent" />
                                ) : (
                                  <Minus className="w-4 h-4 text-muted-foreground/30" />
                                )
                              ) : (
                                <span className="font-mono text-[11px] text-accent font-medium">
                                  {row.plus}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center align-middle">
                            <div className="flex items-center justify-center">
                              {typeof row.teams === 'boolean' ? (
                                row.teams ? (
                                  <Check className="w-4 h-4 text-foreground" />
                                ) : (
                                  <Minus className="w-4 h-4 text-muted-foreground/30" />
                                )
                              ) : (
                                <span className="font-mono text-[11px] text-foreground font-medium">
                                  {row.teams}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center align-middle">
                            <div className="flex items-center justify-center">
                              {typeof row.ent === 'boolean' ? (
                                row.ent ? (
                                  <Check className="w-4 h-4 text-foreground" />
                                ) : (
                                  <Minus className="w-4 h-4 text-muted-foreground/30" />
                                )
                              ) : (
                                <span className="font-mono text-[11px] text-foreground font-medium">
                                  {row.ent}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="mb-24 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-foreground mt-2">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-card overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full py-4 px-5 flex items-center justify-between text-left gap-4 hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-foreground">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-accent' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs leading-relaxed text-muted-foreground border-t border-border/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* See Billing Help Callout Banner */}
          <div className="mt-8 p-5 rounded-2xl border border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left space-y-1">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-accent" />
                Questions about payments, renewals, or compute refunds?
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Review our complete, transparent subscription lifecycle, compute consumption terms, and fair use guidelines.
              </p>
            </div>
            <Link
              to="/billing-help"
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 shrink-0"
            >
              <span>See billing help & policies</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Upgrade to Business Modal */}
      <BookDemoModal open={demoModalOpen} onOpenChange={setDemoModalOpen} />

      {/* In-App Plan Upgrade Modal */}
      <UpgradePlanModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        initialPlan={targetUpgradePlan}
        interval={interval}
        onIntervalChange={setInterval}
      />
    </div>
  );
}
