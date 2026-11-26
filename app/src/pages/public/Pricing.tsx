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
  Plus,
  Building2,
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
        title="Pricing & Plans | ZYR0 Ecosystem"
        description="Transparent pricing for students, creators, and organizations. Start free with ZYR0 Work & Research, unlock ZYR0 GO ($4.99) or ZYR0 PLUS ($9.99), or scale with Teams and Custom solutions."
        path="/pricing"
      />

      <main className="pt-14 sm:pt-20 lg:pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mx-auto max-w-4xl mb-16 text-center sm:mb-20">
          <h1 className="font-serif text-5xl font-normal leading-[1.02] tracking-tight text-foreground sm:text-7xl">
            Pricing
          </h1>

          <div className="mt-8 flex justify-center">
            <AudienceToggle audience={audience} onChange={setAudience} />
          </div>
          <Link
            to="/billing-help"
            className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-accent"
          >
            <span>Billing help</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mb-24 sm:mb-32">
          {audience === 'personal' ? (
            <div className="mx-auto max-w-6xl">
              <div className="grid grid-cols-1 items-stretch gap-6 sm:gap-8 lg:grid-cols-3">
                {personalCards.map((card) => (
                  <PricingCard key={card.id} card={card} interval={interval} />
                ))}
              </div>
              <div className="mt-10 flex justify-center">
                <BillingToggle interval={interval} onChange={setInterval} />
              </div>
            </div>
          ) : (
            <div className="mx-auto grid max-w-4xl grid-cols-1 items-stretch gap-6 sm:gap-8 md:grid-cols-2">
              {businessCards.map((card) => (
                <PricingCard key={card.id} card={card} interval={interval} />
              ))}
            </div>
          )}
        </div>

        {/* Feature Comparison Section */}
        <div className="mb-24 sm:mb-32 max-w-5xl mx-auto">
          <div className="mb-8 flex items-end justify-between gap-4 border-b border-border pb-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Detailed breakdown
              </span>
              <h2 className="mt-2 font-serif text-2xl font-normal text-foreground sm:text-3xl">
                Compare features across tiers
              </h2>
            </div>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:block">
              Spec sheet / 02
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed border-collapse border-t-2 border-foreground text-left text-xs">
                <colgroup>
                  <col className="w-[40%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3.5 px-4 sm:px-6 font-mono text-[9px] uppercase tracking-[0.12em] font-semibold text-muted-foreground text-left">
                      Capability
                    </th>
                    <th className="py-3.5 px-2 font-mono text-[9px] uppercase tracking-[0.12em] font-semibold text-muted-foreground text-center">
                      Free
                    </th>
                    <th className="py-3.5 px-2 font-mono text-[9px] uppercase tracking-[0.12em] font-semibold text-muted-foreground text-center">
                      GO ($4.99)
                    </th>
                    <th className="py-3.5 px-2 font-mono text-[9px] uppercase tracking-[0.12em] font-semibold text-accent text-center bg-accent/[0.04]">
                      PLUS ($9.99)
                    </th>
                    <th className="py-3.5 px-2 font-mono text-[9px] uppercase tracking-[0.12em] font-semibold text-muted-foreground text-center">
                      Teams
                    </th>
                    <th className="py-3.5 px-2 font-mono text-[9px] uppercase tracking-[0.12em] font-semibold text-muted-foreground text-center">
                      Custom
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonCategories.map((cat, catIdx) => (
                    <Fragment key={catIdx}>
                      <tr className="border-t border-border">
                        <td
                          colSpan={6}
                          className="py-2.5 px-4 sm:px-6 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
                        >
                          {cat.category}
                        </td>
                      </tr>
                      {cat.rows.map((row, rowIdx) => (
                        <tr
                          key={`row-${catIdx}-${rowIdx}`}
                          className="border-b border-border hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-3 px-4 sm:px-6 text-[12.5px] text-foreground font-medium align-middle">
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
                          <td className="py-3 px-2 text-center align-middle bg-accent/[0.04]">
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

        {/* FAQ Accordion Section */}
        <div className="mb-24 sm:mb-32 max-w-4xl mx-auto">
          <div className="mb-2 flex items-end justify-between gap-4 border-b border-border pb-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                FAQ / 03
              </span>
              <h2 className="mt-2 font-serif text-2xl font-normal text-foreground sm:text-3xl">
                Questions
              </h2>
            </div>
          </div>

          <div>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border-b border-border">
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left cursor-pointer"
                  >
                    <span className="font-serif text-lg leading-snug text-foreground sm:text-xl">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <Minus className="h-4 w-4 shrink-0 text-accent" />
                    ) : (
                      <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="max-w-2xl pb-5 text-sm leading-relaxed text-muted-foreground">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* See Billing Help Callout Banner */}
          <div className="mt-10 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <CreditCard className="h-3.5 w-3.5 text-accent" />
                Questions about payments, renewals, or compute refunds?
              </span>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Review our complete subscription lifecycle, compute consumption terms, and fair use guidelines.
              </p>
            </div>
            <Link
              to="/billing-help"
              className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-accent hover:underline"
            >
              <span>Billing help</span>
              <ArrowRight className="h-3.5 w-3.5" />
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
