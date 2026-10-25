import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { m } from 'framer-motion';
import {
  Building2, Users, CheckCircle2, ArrowRight, ShieldCheck,
  Award, Briefcase, Sparkles, Terminal, FileCheck2, Compass,
  ChevronRight, HelpCircle
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';

export default function Join() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <SEO
        title="Join ZYR0 — Onboarding Guide for Employers & Mentors"
        description="Run structured internship cohorts, mentor emerging talent, and issue cryptographically verified certificates with ZYR0."
        path="/join"
      />

      {/* Header / Intro */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-muted/50 text-xs font-medium text-muted-foreground mb-6">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Partners & Mentorship Ecosystem</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-foreground max-w-3xl mx-auto leading-tight sm:leading-[1.15]">
            Empower talent. <br className="hidden sm:inline" />
            Ship real software. Verify proof of work.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            ZYR0 connects ambitious builders with verified companies and industry mentors through milestone-based internship programs and cryptographic credentials.
          </p>

          {/* Quick jump anchor pill */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#employers"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/80 bg-card hover:border-accent hover:bg-accent/5 text-sm font-medium transition-all shadow-2xs"
            >
              <Building2 className="w-4 h-4 text-accent" />
              <span>For Employers & Companies</span>
            </a>
            <a
              href="#mentors"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/80 bg-card hover:border-accent hover:bg-accent/5 text-sm font-medium transition-all shadow-2xs"
            >
              <Users className="w-4 h-4 text-emerald-500" />
              <span>For Industry Mentors</span>
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 1: For Employers */}
      <section id="employers" className="py-20 border-b border-border/40 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent mb-3">
                <Building2 className="w-4 h-4" />
                <span>Organizations & Companies</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                Run structured internship cohorts at scale
              </h2>
              <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
                Replace unvetted resume stacks with transparent milestone tasks. Test candidates on actual work, track progress in real-time, and issue tamper-proof certificates.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <Link
                to="/register?role=company"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-accent hover:bg-accent/90 shadow-sm hover:shadow-md transition-all active:scale-98"
              >
                <span>Register as Employer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl border border-border/60 bg-card/60 hover:border-border transition-all">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">Milestone-Based Tasks</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Define clear acceptance criteria for project tasks. Interns submit real repositories, test runs, and live deployments rather than hollow claims.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/60 bg-card/60 hover:border-border transition-all">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">Cryptographic Credentials</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Issue tamper-proof certificates with public cryptographic verification IDs that students and future employers can independently verify at any time.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/60 bg-card/60 hover:border-border transition-all">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">Unified Cohort Dashboard</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Track submissions, assign internal or guest mentors, review code deliverables, and approve milestone payouts or certificates from one clean interface.
              </p>
            </div>
          </div>

          {/* How it works for employers */}
          <div className="mt-12 p-6 sm:p-8 rounded-2xl border border-border/80 bg-muted/30">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
              Company Onboarding Journey
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <span className="w-7 h-7 rounded-lg bg-background border border-border text-foreground text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <h5 className="text-sm font-semibold text-foreground">Create Company Account</h5>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Sign up in seconds and specify your hiring needs, industries, and logo.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-7 h-7 rounded-lg bg-background border border-border text-foreground text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <h5 className="text-sm font-semibold text-foreground">Post Project or Role</h5>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Outline milestones, technical stack requirements, and task expectations.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-7 h-7 rounded-lg bg-background border border-border text-foreground text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <h5 className="text-sm font-semibold text-foreground">Review & Certify</h5>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Review intern pull requests and issue verified completion credentials.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: For Mentors */}
      <section id="mentors" className="py-20 border-b border-border/40 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-500 mb-3">
                <Users className="w-4 h-4" />
                <span>Industry Mentorship</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                Guide emerging builders. Establish leadership proof.
              </h2>
              <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
                Share your industry expertise with dedicated students. Review real-world code, provide structured evaluations, and build an authentic track record as a technical leader.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <Link
                to="/register?role=mentor"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm hover:shadow-md transition-all active:scale-98"
              >
                <span>Apply as a Mentor</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl border border-border/60 bg-card/60 hover:border-border transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">Verified Leadership Track Record</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Receive verifiable mentorship endorsements and recommendations that you can showcase on LinkedIn, your portfolio, and senior promotion reviews.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/60 bg-card/60 hover:border-border transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">Asynchronous & Flexible</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Commit just 1–2 hours weekly at your own schedule. Review milestone PRs, provide asynchronous code suggestions, and conduct structured milestone evaluations.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/60 bg-card/60 hover:border-border transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">Direct Talent Sourcing</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Get first-look access to high-aptitude developers and researchers before they hit the open job market, making recruiting for your own company effortless.
              </p>
            </div>
          </div>

          {/* How it works for mentors */}
          <div className="mt-12 p-6 sm:p-8 rounded-2xl border border-border/80 bg-muted/30">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
              Mentor Onboarding Journey
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <span className="w-7 h-7 rounded-lg bg-background border border-border text-foreground text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <h5 className="text-sm font-semibold text-foreground">Submit Mentor Profile</h5>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Share your domain expertise (Frontend, AI, Full-Stack, Cloud) and availability.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-7 h-7 rounded-lg bg-background border border-border text-foreground text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <h5 className="text-sm font-semibold text-foreground">Matched with Interns</h5>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Get assigned to student cohorts actively working on real company milestones.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-7 h-7 rounded-lg bg-background border border-border text-foreground text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <h5 className="text-sm font-semibold text-foreground">Review & Evaluate</h5>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Provide constructive feedback and sign off on verified completion milestones.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: FAQ */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              <HelpCircle className="w-4 h-4 text-accent" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
              Clear answers for partners and mentors
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-border/60 bg-card">
              <h3 className="text-sm sm:text-base font-semibold text-foreground">Is there any fee for companies to join and post internships?</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                Standard company registration and posting structured internships on ZYR0 is free. For enterprise cohorts needing custom branding, dedicated talent vetting, and bulk automated certificate workflows, enterprise plans are available.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-card">
              <h3 className="text-sm sm:text-base font-semibold text-foreground">How does cryptographic certificate verification work?</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                Each certificate issued by a company generates a unique verification code and ECDSA digital signature. Anyone can inspect and verify the issuing organization, intern details, milestone proofs, and date directly on the public <Link to="/verify" className="text-accent underline font-medium">Verify portal</Link>.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-card">
              <h3 className="text-sm sm:text-base font-semibold text-foreground">What is the expected time commitment for mentors?</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                Most mentors spend approximately 1 to 2 hours per week. All feedback and code review is handled asynchronously through the mentor dashboard, letting you fit evaluations around your primary professional schedule.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-card">
              <h3 className="text-sm sm:text-base font-semibold text-foreground">Can companies hire interns directly after cohort completion?</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                Yes, absolutely. ZYR0 encourages direct hiring without any placement fees. The platform exists to validate skills and connect qualified candidates directly with forward-thinking organizations.
              </p>
            </div>
          </div>

          {/* Bottom Direct CTA */}
          <div className="mt-16 p-8 rounded-2xl border border-border bg-gradient-to-b from-card to-muted/20 text-center">
            <h3 className="text-xl sm:text-2xl font-display font-bold text-foreground">
              Ready to partner with ZYR0?
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
              Join dozens of organizations and mentors creating structured pathways for the next generation of engineers.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/register?role=company"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-accent hover:bg-accent/90 transition-all shadow-sm"
              >
                Register as a Company
              </Link>
              <Link
                to="/register?role=mentor"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-foreground border border-border hover:bg-muted transition-all"
              >
                Apply as a Mentor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
