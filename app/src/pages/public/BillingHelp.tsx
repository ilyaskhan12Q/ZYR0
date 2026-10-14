import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import {
  CreditCard,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  HelpCircle,
  FileText,
  Clock,
  Building2,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Mail,
  Zap,
} from 'lucide-react';

interface PolicySection {
  id: string;
  title: string;
  icon: React.ElementType;
  summary: string;
  points: {
    heading: string;
    body: string;
  }[];
}

const POLICY_SECTIONS: PolicySection[] = [
  {
    id: 'refunds-compute',
    title: 'Refund Policy & AI Compute Consumption',
    icon: RotateCcw,
    summary:
      'Because ZYR0 provides real-time access to high-performance AI inference compute and reasoning models, all digital consumption is immediate and non-refundable.',
    points: [
      {
        heading: 'Immediate Compute Incurrence',
        body: 'When you execute research syntheses, generate multi-step reasoning outputs, export academic citations, or initiate Studio app builds, real-time computational infrastructure and model inference costs are permanently incurred by ZYR0. Consequently, all paid subscription fees (ZYR0 GO and ZYR0 PLUS) are strictly non-refundable once compute or premium features have been accessed.',
      },
      {
        heading: 'No Partial-Period or Prorated Refunds',
        body: 'ZYR0 does not offer prorated refunds, credits, or fee adjustments for partially used monthly or annual subscription periods. If you cancel your subscription midway through a paid term, you retain full access to your plan benefits until the end of your prepaid period.',
      },
      {
        heading: 'Exceptional Billing Inquiries',
        body: 'If you believe an erroneous duplicate charge occurred due to a technical error, you must notify our billing team within fourteen (14) calendar days of the transaction at billing@zyroo.org with your transaction identifier. Verified technical duplicate charges will be refunded in full.',
      },
    ],
  },
  {
    id: 'cancellation-lifecycle',
    title: 'Subscription Lifecycle & Auto-Renewal',
    icon: Clock,
    summary:
      'Subscriptions auto-renew at the end of each billing cycle to maintain uninterrupted service. You can cancel at any time with no lock-in or cancellation penalties.',
    points: [
      {
        heading: 'Self-Service 1-Click Cancellation',
        body: 'You may cancel your recurring subscription at any time directly through your account dashboard or billing portal. There are zero cancellation fees, lock-in periods, or phone calls required.',
      },
      {
        heading: 'Access Through Paid Period End',
        body: 'Upon cancellation, your subscription will not renew at the next billing date. You will continue to have uninterrupted access to all plan capabilities (including priority queue compute, report exports, and candidate placement status) until the final second of your active prepaid period.',
      },
      {
        heading: 'Safe Downgrade to Free Tier',
        body: 'When your paid period concludes following a cancellation, your account automatically transitions to the Free tier. None of your saved research history, verifiable certificates, or submitted projects are deleted or held hostage.',
      },
    ],
  },
  {
    id: 'annual-commitments',
    title: 'Annual Billing & 20% Discount Terms',
    icon: Sparkles,
    summary:
      'Annual plans offer approximately 20% savings in exchange for a committed 12-month billing period.',
    points: [
      {
        heading: 'Upfront Annual Charge',
        body: 'Selecting annual billing bills your payment method for the full 12-month term upfront ($47.90/year for ZYR0 GO; $95.90/year for ZYR0 PLUS), securing a discounted effective monthly rate.',
      },
      {
        heading: 'Commitment Term & Non-Refundability',
        body: 'The discounted annual rate is granted expressly in consideration of the 12-month commitment. Annual subscriptions cannot be refunded or converted retroactively to monthly rates once the 12-month term has begun.',
      },
      {
        heading: 'Renewal Notification',
        body: 'You will receive an automated email notice prior to annual renewal to confirm your renewal date and billing method, ensuring complete transparency before any subsequent charge.',
      },
    ],
  },
  {
    id: 'fair-use-licensing',
    title: 'Single-User Licensing & Fair Use Policy',
    icon: ShieldCheck,
    summary:
      'Personal plans are strictly single-user licenses. Account sharing, credential pooling, automated botting, and compute resale are prohibited.',
    points: [
      {
        heading: 'Non-Transferable Personal Licenses',
        body: 'Each ZYR0 Free, GO, and PLUS subscription is licensed exclusively for one natural person. Sharing account credentials, setting up multi-user proxy endpoints, or redistributing account access violates ZYR0 Terms of Service.',
      },
      {
        heading: 'Anti-Abuse & Automated Scraping',
        body: 'Automated scraping, bot-driven batch harvesting, reverse engineering of model prompts, or bypassing rate limits via script automation is monitored in real-time. Accounts exhibiting abusive traffic patterns may be immediately throttled or suspended without refund.',
      },
      {
        heading: 'High-Volume Commercial Use',
        body: 'If your organization requires multi-user seats, shared departmental access, or dedicated API rate limits, you must contact our team for a Custom organizational agreement.',
      },
    ],
  },
  {
    id: 'plan-specifics',
    title: 'Plan-Specific Terms & Defensibility',
    icon: Zap,
    summary:
      'Specific contractual conditions and operational boundaries governing each tier in the ZYR0 ecosystem.',
    points: [
      {
        heading: 'Free Tier ($0/month)',
        body: 'Provided entirely on an "as-is" and "as-available" basis. Standard AI limits (20 req/min) apply. ZYR0 reserves the right to adjust resource allocations, rate limits, or feature availability on the free tier to maintain platform health.',
      },
      {
        heading: 'ZYR0 GO ($4.99/month)',
        body: 'Grants 5× faster synthesis throughput and report exports for individual academic, student, and creator usage. Candidate priority status highlights applications on verified boards, but does not guarantee employment or interview offers from third-party companies.',
      },
      {
        heading: 'ZYR0 PLUS ($9.99/month)',
        body: 'Deep reasoning models utilize multi-step inference chains. Peak-hour priority queue access grants prioritized compute slot allocation. Upcoming features labeled "Early Access" (Studio app builder, code export) are actively evolving developer previews.',
      },
      {
        heading: 'Teams ($0/month for Companies)',
        body: 'Companies may post verified listings and review candidate submissions free of charge. However, ZYR0 strictly requires that all internship postings represent genuine, verifiable educational or professional opportunities. ZYR0 reserves the right to remove fraudulent listings, ban bad actors, and revoke invalid cryptographic certificates without liability.',
      },
      {
        heading: 'Custom / Enterprise Tiers',
        body: 'Custom institutional deployments for SchoolOS, multi-campus academies, and enterprise hiring guilds are governed by tailored Master Services Agreements (MSAs), custom SLAs, and verified Purchase Orders.',
      },
    ],
  },
  {
    id: 'payment-failures-grace',
    title: 'Failed Payments & Grace Periods',
    icon: AlertTriangle,
    summary:
      'We provide a 3-day grace period to resolve payment method issues before any account downgrade occurs.',
    points: [
      {
        heading: '3-Day Payment Grace Period',
        body: 'If a recurring renewal payment fails (e.g., due to an expired card, insufficient funds, or bank fraud blocks), our billing system will automatically notify you and retry the transaction over a 3-calendar-day grace period.',
      },
      {
        heading: 'Preservation of Work',
        body: 'During the grace period, your premium benefits remain active while you update your payment information. If the charge cannot be settled by the end of day 3, your account gently transitions to the Free tier with all your projects, research vaults, and certificates intact.',
      },
    ],
  },
  {
    id: 'dispute-chargebacks',
    title: 'Chargeback & Dispute Resolution Protocol',
    icon: FileText,
    summary:
      'Mandatory good-faith notice requires contacting ZYR0 support before filing payment disputes with credit card issuers.',
    points: [
      {
        heading: 'Mandatory Prior Contact',
        body: 'You agree to contact ZYR0 Billing Support at billing@zyroo.org and allow five (5) business days for an amicable resolution before initiating any chargeback, payment dispute, or reversal with your bank or card processor.',
      },
      {
        heading: 'Fraudulent & Unsubstantiated Chargebacks',
        body: 'Initiating an unsubstantiated chargeback or filing a dispute without prior notice constitutes a material breach of our service agreement. Accounts associated with fraudulent chargebacks are subject to immediate permanent suspension, forfeiture of active licenses, and potential dispute recovery processing fees.',
      },
      {
        heading: 'Legitimate Billing Corrections',
        body: 'We are committed to correcting legitimate billing errors quickly and transparently. Reaching out directly is always faster and simpler than a formal bank dispute.',
      },
    ],
  },
  {
    id: 'taxes-invoicing',
    title: 'Taxes, Currencies & Official Invoices',
    icon: Building2,
    summary:
      'Transparent digital VAT/GST compliance and automated receipt delivery for every billing event.',
    points: [
      {
        heading: 'Digital Goods Tax Compliance',
        body: 'All subscription prices are listed in United States Dollars (USD) unless explicitly stated otherwise. Applicable state sales taxes, VAT, or GST will be calculated and collected at checkout based on your registered billing address in compliance with local jurisdictions.',
      },
      {
        heading: 'Automated VAT / GST Invoices',
        body: 'A downloadable PDF invoice receipt containing our registered entity details, transaction timestamps, and itemized tax breakdowns is emailed automatically after every successful charge.',
      },
      {
        heading: 'Institutional Purchase Orders',
        body: 'Organizations qualifying for Custom plans can request direct net-30 invoicing, purchase order contracting, and institutional wire transfer settlements through our sales department.',
      },
    ],
  },
];

export default function BillingHelp() {
  const [activeTab, setActiveTab] = useState<string>('refunds-compute');

  const activeSection =
    POLICY_SECTIONS.find((s) => s.id === activeTab) || POLICY_SECTIONS[0];
  const ActiveIcon = activeSection.icon;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <SEO
        title="Billing Help & Subscription Policies — ZYR0 Ecosystem"
        description="Transparent and legally defensible billing policies for ZYR0 plans. Learn about AI compute non-refundability, cancellation workflows, fair use terms, and annual billing."
        path="/billing-help"
      />

      <main className="pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Pricing & Plans</span>
          </Link>
        </div>

        {/* Hero Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase border border-border bg-muted text-muted-foreground mb-4">
            <CreditCard className="w-3.5 h-3.5 text-accent" />
            Billing & Subscription Policies
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-foreground leading-[1.15]">
            Transparent Terms.{' '}
            <span className="italic" style={{ color: 'var(--zyro-accent)' }}>
              Defensible by Design.
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Everything you need to know about how ZYR0 manages subscriptions, compute consumption, renewals, cancellations, and enterprise agreements.
          </p>
        </div>

        {/* Two-Column Layout: Sidebar Navigation + Content Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <nav
            aria-label="Billing policy sections"
            className="lg:col-span-4 rounded-2xl border border-border bg-card p-2 sm:p-3 space-y-1 shadow-sm sticky top-28"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold px-3 py-2 block">
              Policy Index
            </span>
            {POLICY_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isSelected = sec.id === activeTab;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveTab(sec.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-accent text-white font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{sec.title}</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      isSelected ? 'opacity-100' : 'opacity-30'
                    }`}
                  />
                </button>
              );
            })}

            {/* Quick Contact Box in Sidebar */}
            <div className="mt-4 pt-4 border-t border-border/70 px-3 pb-2">
              <span className="text-[11px] font-semibold text-foreground block mb-1">
                Need billing support?
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                Our support team is available Monday–Friday to assist with invoice and account inquiries.
              </p>
              <a
                href="mailto:billing@zyroo.org"
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold border border-border bg-muted/60 hover:bg-muted text-foreground flex items-center justify-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-accent" />
                <span>billing@zyroo.org</span>
              </a>
            </div>
          </nav>

          {/* Active Policy Content Card */}
          <div className="lg:col-span-8 rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm space-y-8">
            <div className="space-y-3 pb-6 border-b border-border/70">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-accent/10 border border-accent/25 text-accent font-medium">
                <ActiveIcon className="w-3.5 h-3.5" />
                <span>Section Overview</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-foreground">
                {activeSection.title}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {activeSection.summary}
              </p>
            </div>

            {/* Detailed Points */}
            <div className="space-y-6">
              {activeSection.points.map((pt, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-border bg-muted/40 p-5 space-y-2"
                >
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-muted text-muted-foreground font-mono text-[10px] flex items-center justify-center font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span>{pt.heading}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-7">
                    {pt.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Cross Links to Legal Terms */}
            <div className="pt-6 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-accent shrink-0" />
                <span>For complete contractual terms, refer to our legal notices:</span>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  to="/terms"
                  className="underline hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  to="/privacy"
                  className="underline hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/contact"
                  className="underline hover:text-foreground transition-colors"
                >
                  Contact Legal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
