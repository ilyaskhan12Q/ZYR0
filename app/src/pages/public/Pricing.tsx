import { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import BillingToggle, { type BillingInterval } from '@/components/pricing/BillingToggle';
import PricingCard, { type PricingCardData } from '@/components/pricing/PricingCard';
import BookDemoModal from '@/components/pricing/BookDemoModal';
import {
  Check,
  Minus,
  Sparkles,
  Building2,
  ChevronDown,
} from 'lucide-react';

export default function Pricing() {
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const cards: PricingCardData[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Essential access to ZYR0 Work internships, standard AI research, and interactive developer tools.',
      monthlyPrice: '$0',
      yearlyPrice: '$0',
      ctaLabel: 'Get Started Free',
      ctaHref: '/register',
      features: [
        { text: 'ZYR0 Work: Browse and apply to verified internships' },
        { text: 'ZYR0 Work: PR-style task submission workspace' },
        { text: 'ZYR0 Work: Verifiable cryptographic certificates' },
        { text: 'ZYR0 Research: Standard research queries & synthesis' },
        { text: 'ZYR0 Research: Verified academic & web citations' },
        { text: 'ZYR0 Research: Standard AI limits (20 req/min)' },
        { text: 'ZYR0 Studio: Interactive prompt-to-app simulator' },
        { text: 'ZYR0 ToolHub: Curated developer utilities catalog' },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      badge: 'Most Popular',
      highlighted: true,
      description: 'High-depth research reasoning, extended agent capabilities, and priority builder tool access.',
      monthlyPrice: '$9.99',
      yearlyPrice: '$7.99',
      yearlySubtext: '$95.90 billed annually (Save ~20%)',
      ctaLabel: 'Choose Pro',
      ctaHref: '/register?plan=pro',
      features: [
        { text: 'Everything in Free' },
        { text: 'ZYR0 Research: Deep multi-step research synthesis' },
        { text: 'ZYR0 Research: Priority queue during peak demand' },
        { text: 'ZYR0 Research: Unlimited session history & PDF exports' },
        { text: 'ZYR0 Studio: VIP early access to full app builder', badge: 'Early Access' },
        { text: 'ZYR0 Studio: Clean React 19 + TypeScript code exports', badge: 'Early Access' },
        { text: 'ZYR0 Work: Highlighted candidate profile badge', badge: 'In Rollout' },
        { text: 'Unified cross-product subscription coverage', badge: 'In Rollout' },
      ],
    },
    {
      id: 'custom',
      name: 'Custom',
      badge: 'Enterprise & Institutions',
      description: 'Comprehensive company intern management, team governance, and SchoolOS institutional deployments.',
      monthlyPrice: 'Custom',
      yearlyPrice: 'Custom',
      yearlySubtext: 'Tailored institutional agreement',
      ctaLabel: 'Book a Demo',
      onCtaClick: () => setDemoModalOpen(true),
      features: [
        { text: 'ZYR0 Work: Unlimited internship postings & screening' },
        { text: 'ZYR0 Work: End-to-end applicant reviews & code grading' },
        { text: 'ZYR0 Work: Cryptographic offer letters & certificates' },
        { text: 'ZYR0 Work: Company team roles (Owner, Admin, Member)' },
        { text: 'ZYR0 SchoolOS: Full school management deployment', badge: 'In Rollout' },
        { text: 'ZYR0 SchoolOS: Principal, Teacher & Parent portals', badge: 'In Rollout' },
        { text: 'Dedicated account manager & customized SLAs' },
        { text: 'Annual invoicing, purchase orders & custom terms' },
      ],
    },
  ];

  const comparisonCategories = [
    {
      category: 'ZYR0 Work (Internships & Workforce)',
      rows: [
        { feature: 'Internship discovery & search filters', free: true, pro: true, custom: true, status: 'Live' },
        { feature: 'Direct internship applications & tracking', free: true, pro: true, custom: true, status: 'Live' },
        { feature: 'PR-style task submission workspace', free: true, pro: true, custom: true, status: 'Live' },
        { feature: 'Cryptographic completion certificates', free: true, pro: true, custom: true, status: 'Live' },
        { feature: 'Featured applicant profile placement', free: false, pro: 'In Rollout', custom: true, status: 'In Rollout' },
        { feature: 'Company internship posting & applicant review', free: false, pro: false, custom: true, status: 'Live' },
        { feature: 'Company multi-member team permissions', free: false, pro: false, custom: true, status: 'Live' },
      ],
    },
    {
      category: 'ZYR0 Research (Autonomous AI Agent)',
      rows: [
        { feature: 'Standard research chat & question answering', free: true, pro: true, custom: true, status: 'Live' },
        { feature: 'Verifiable citations (OpenAlex, arXiv, PubMed)', free: true, pro: true, custom: true, status: 'Live' },
        { feature: 'Markdown & PDF report export', free: true, pro: true, custom: true, status: 'Live' },
        { feature: 'AI request rate limits', free: '20 req/min', pro: 'Priority / High', custom: 'Dedicated', status: 'Live' },
        { feature: 'Deep multi-step research synthesis', free: 'Standard', pro: 'Deep Reasoning', custom: 'Custom Models', status: 'Live' },
        { feature: 'Priority model compute during peak hours', free: false, pro: true, custom: true, status: 'Live' },
      ],
    },
    {
      category: 'ZYR0 Studio (AI Web & App Builder)',
      rows: [
        { feature: 'Interactive prompt-to-code simulator', free: true, pro: true, custom: true, status: 'Live' },
        { feature: 'Curated preset architecture templates', free: true, pro: true, custom: true, status: 'Live' },
        { feature: 'Autonomous prompt-to-app generator', free: 'Waitlist', pro: 'VIP Early Access', custom: 'Private Cloud', status: 'Early Access' },
        { feature: 'Clean TypeScript/Vite/Tailwind code export', free: false, pro: 'Early Access', custom: 'Full Export', status: 'Early Access' },
        { feature: '1-click cloud deployment & custom domains', free: false, pro: 'Early Access', custom: 'Enterprise CDN', status: 'Early Access' },
      ],
    },
    {
      category: 'ZYR0 SchoolOS (Education Operating System)',
      rows: [
        { feature: 'Interactive role perspective switcher & tour', free: true, pro: true, custom: true, status: 'Live' },
        { feature: 'Time & revenue ROI calculator', free: true, pro: true, custom: true, status: 'Live' },
        { feature: 'Institutional demo walkthrough session', free: false, pro: false, custom: true, status: 'Live' },
        { feature: 'Attendance, grading & timetable management', free: false, pro: false, custom: 'Institutional', status: 'In Rollout' },
        { feature: 'Multi-campus administrative governance', free: false, pro: false, custom: 'Institutional', status: 'In Rollout' },
      ],
    },
    {
      category: 'Support & Administration',
      rows: [
        { feature: 'Community support & help documentation', free: true, pro: true, custom: true, status: 'Live' },
        { feature: 'Priority email developer support', free: false, pro: true, custom: true, status: 'Live' },
        { feature: 'Dedicated account manager & SLA', free: false, pro: false, custom: true, status: 'Live' },
        { feature: 'Invoicing & purchase order contracting', free: false, pro: false, custom: true, status: 'Live' },
      ],
    },
  ];

  const faqs = [
    {
      q: 'How does the unified Pro subscription work across products?',
      a: 'One ZYR0 Pro subscription covers eligible benefits across all four product verticals — ZYR0 Research, Studio, SchoolOS, and Work. You do not need to purchase separate accounts for different tools.',
    },
    {
      q: 'Can I cancel or switch billing intervals anytime?',
      a: 'Yes. You can cancel your subscription at any time with no lock-in. If you choose annual billing, you pay $95.90 for 12 months of coverage, saving approximately 20% compared to paying monthly.',
    },
    {
      q: 'What is included in the Free tier?',
      a: 'The Free tier is free forever. It includes full access to ZYR0 Work for discovering and applying to internships, completing tasks, earning verifiable digital certificates, running standard AI research queries, and using the Studio interactive simulator.',
    },
    {
      q: 'What features in ZYR0 Studio are live today versus early access?',
      a: 'Today, ZYR0 Studio features a live interactive simulator that lets you test prompt-to-app workflows. Pro subscribers receive priority early-access enrollment as full code generation and 1-click cloud deployments roll out.',
    },
    {
      q: 'How do companies and schools get started with Custom plans?',
      a: 'Companies hiring interns can register and start managing internships immediately. Schools, colleges, and larger organizations can click "Book a Demo" to schedule a personalized 30-minute walkthrough tailored to institutional needs.',
    },
  ];

  return (
    <div
      className="min-h-screen transition-colors duration-200 overflow-x-clip"
      style={{
        background: 'var(--zyro-bg)',
        color: 'var(--zyro-text)',
      }}
    >
      <SEO
        title="Pricing & Plans — ZYR0 Ecosystem"
        description="Transparent pricing for students, builders, and organizations. Start free with ZYR0 Work & Research, unlock high-depth Pro, or scale with Custom institutional plans."
        path="/pricing"
      />

      <main className="pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase border border-border bg-muted text-muted-foreground mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent Ecosystem Pricing
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-foreground leading-[1.1]">
            One Platform.{' '}
            <span className="italic" style={{ color: 'var(--zyro-accent)' }}>
              Every Tier of Ambition.
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Start free as a student or individual researcher. Upgrade to Pro for high-depth AI research and builder tools. Scale with Custom for company intern management and institutional deployments.
          </p>

          {/* Billing Frequency Switch */}
          <div className="mt-8">
            <BillingToggle interval={interval} onChange={setInterval} />
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-24 max-w-6xl mx-auto items-stretch">
          {cards.map((card) => (
            <PricingCard key={card.id} card={card} interval={interval} />
          ))}
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
                  <col className="w-[46%]" />
                  <col className="w-[18%]" />
                  <col className="w-[18%]" />
                  <col className="w-[18%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="py-3.5 px-4 sm:px-6 font-semibold text-foreground text-left">
                      Capability
                    </th>
                    <th className="py-3.5 px-3 sm:px-4 font-semibold text-foreground text-center">
                      Free ($0)
                    </th>
                    <th className="py-3.5 px-3 sm:px-4 font-semibold text-accent text-center">
                      Pro ($9.99/mo)
                    </th>
                    <th className="py-3.5 px-3 sm:px-4 font-semibold text-foreground text-center">
                      Custom
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonCategories.map((cat, catIdx) => (
                    <Fragment key={catIdx}>
                      <tr className="bg-muted/50 border-t border-b border-border">
                        <td
                          colSpan={4}
                          className="py-2.5 px-4 sm:px-6 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          {cat.category}
                        </td>
                      </tr>
                      {cat.rows.map((row, rowIdx) => (
                        <tr
                          key={`row-${catIdx}-${rowIdx}`}
                          className="border-b border-border/50 hover:bg-muted/15 transition-colors"
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
                          <td className="py-3 px-3 sm:px-4 text-center align-middle">
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
                          <td className="py-3 px-3 sm:px-4 text-center align-middle">
                            <div className="flex items-center justify-center">
                              {typeof row.pro === 'boolean' ? (
                                row.pro ? (
                                  <Check className="w-4 h-4 text-accent" />
                                ) : (
                                  <Minus className="w-4 h-4 text-muted-foreground/30" />
                                )
                              ) : (
                                <span className="font-mono text-[11px] text-accent font-medium">
                                  {row.pro}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-center align-middle">
                            <div className="flex items-center justify-center">
                              {typeof row.custom === 'boolean' ? (
                                row.custom ? (
                                  <Check className="w-4 h-4 text-foreground" />
                                ) : (
                                  <Minus className="w-4 h-4 text-muted-foreground/30" />
                                )
                              ) : (
                                <span className="font-mono text-[11px] text-foreground font-medium">
                                  {row.custom}
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
                    <div className="px-5 pb-4 text-xs leading-relaxed text-muted-foreground border-t border-border/50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Institutional Walkthrough Callout Banner */}
        <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 text-center relative overflow-hidden shadow-sm max-w-5xl mx-auto">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border border-border bg-muted text-muted-foreground">
              <Building2 className="w-3 h-3 text-foreground" />
              Institutions & Enterprise
            </div>
            <h3 className="text-2xl sm:text-4xl font-serif font-normal text-foreground">
              Looking for a campus deployment or high-volume hiring setup?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              We provide tailored deployments for schools, universities, and enterprise hiring guilds with custom invoicing, student imports, and dedicated SLAs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-all cursor-pointer"
              >
                Book Institutional Demo
              </button>
              <Link
                to="/contact?subject=partnership"
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-medium border border-border text-foreground hover:bg-muted transition-all"
              >
                Contact Sales Team
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Book a Demo Modal */}
      <BookDemoModal open={demoModalOpen} onOpenChange={setDemoModalOpen} />
    </div>
  );
}
