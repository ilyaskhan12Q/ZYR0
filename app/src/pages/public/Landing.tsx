import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, FileCheck, ClipboardList, Users, Award, Briefcase,
  UserPlus, Send, BookOpen, CheckCircle2, Building2, GraduationCap,
  ArrowRight, Star, Quote, TrendingUp, Globe, Zap, Target
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { BASE_URL } from '@/config/seo';

const homepageStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` }],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'ZYR0',
    'url': `${BASE_URL}/`,
    'description': 'Structured internship platform for students, companies, and mentors.',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${BASE_URL}/internships?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'ZYR0',
    'url': `${BASE_URL}/`,
    'logo': `${BASE_URL}/zyro-logo.png`,
    'description': 'ZYR0 is a professional internship platform connecting students, companies, and mentors for structured, verifiable internship experiences.',
    'sameAs': [
      'https://github.com/ilyaskhan12Q/ZYR0',
      'https://linkedin.com/company/zyr0-platform'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'email': 'support@zyr0.com',
      'contactType': 'customer support',
      'availableLanguage': 'English'
    }
  }
];

const features = [
  { icon: Search, title: 'Curated Sourcing', desc: 'Find internships in Pakistan matching your background and career goals.', color: 'bg-blue-100 text-blue-600' },
  { icon: FileCheck, title: 'Application Transparency', desc: 'Track the status of your applications from submission to final acceptance in real time.', color: 'bg-emerald-100 text-emerald-600' },
  { icon: ClipboardList, title: 'Milestone Coordination', desc: 'Manage internship tasks with clear deliverables, timeline tracking, and milestone reviews.', color: 'bg-purple-100 text-purple-600' },
  { icon: Users, title: 'Professional Mentorship', desc: 'Get matched with industry mentors who review your work and provide structured guidance.', color: 'bg-orange-100 text-orange-600' },
  { icon: Award, title: 'Verified Achievements', desc: 'Earn secure completion certificates that employers can instantly authenticate.', color: 'bg-yellow-100 text-yellow-600' },
  { icon: Briefcase, title: 'Professional Portfolios', desc: 'Accumulate a permanent, structured history of your completed milestones, feedback, and skills.', color: 'bg-teal-100 text-teal-600' },
];

const steps = [
  { num: '01', icon: UserPlus, title: 'Set up your profile', desc: 'Highlight your skills, background, and career focus.' },
  { num: '02', icon: Send, title: 'Apply to listings', desc: 'Submit your profile directly to structured internship positions.' },
  { num: '03', icon: BookOpen, title: 'Collaborate and complete', desc: 'Receive guidance, complete milestone tasks, and log your progress.' },
  { num: '04', icon: Award, title: 'Claim certification', desc: 'Verify your completion and share your accomplishments with hiring networks.' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Computer Science Student', quote: 'The structured task progress and mentor feedback helped me grow far faster than a standard internship. Having a clear roadmap kept me aligned.', avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { name: 'Michael Rodriguez', role: 'Senior Engineer & Mentor', quote: 'As a mentor, ZYR0 gives me a structured framework to evaluate work, track multiple interns, and provide actionable feedback without administrative overhead.', avatar: 'https://i.pravatar.cc/150?u=michael' },
  { name: 'TechFlow Inc.', role: 'Employer Partner', quote: 'Using ZYR0 to hire and manage our interns has streamlined our entire process. The quality of candidate tracking and verification has been exceptional.', avatar: 'https://ui-avatars.com/api/?name=TechFlow&background=3B82F6&color=fff' },
];

const stats = [
  { value: '10,000+', label: 'Active Students', icon: GraduationCap },
  { value: '500+', label: 'Partner Companies', icon: Building2 },
  { value: '50+', label: 'Universities', icon: Globe },
  { value: '25,000+', label: 'Completed Tasks', icon: Award },
];

const checkFeatures = [
  'Publish detail-rich internship listings',
  'Centralize applications in one unified pipeline',
  'Organize cohort tasks and monitor overall progress',
  'Generate verified completion certificates',
  'Access cohort performance statistics',
];

const roles = [
  {
    icon: GraduationCap,
    title: 'Students',
    desc: 'Build experience that employers recognize.',
    color: 'text-blue-500 bg-blue-500/10'
  },
  {
    icon: Building2,
    title: 'Companies',
    desc: 'Develop future professionals through structured internships.',
    color: 'text-emerald-500 bg-emerald-500/10'
  },
  {
    icon: Users,
    title: 'Mentors',
    desc: 'Guide the next generation with measurable impact.',
    color: 'text-orange-500 bg-orange-500/10'
  },
  {
    icon: Globe,
    title: 'Universities',
    desc: 'Bridge education with industry experience.',
    color: 'text-purple-500 bg-purple-500/10'
  }
];

const confidenceCards = [
  {
    icon: Award,
    title: 'Verified Certificates',
    desc: 'Every certificate issued is tamper-proof and instantly verifiable online by any prospective employer.',
    color: 'text-yellow-500 bg-yellow-500/10'
  },
  {
    icon: ClipboardList,
    title: 'Structured Internship Lifecycle',
    desc: 'From initial application to daily tasks, feedback, and final sign-off, every stage follows a consistent process.',
    color: 'text-blue-500 bg-blue-500/10'
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    desc: 'Granular access controls ensure students, mentors, employers, and administrators only access permitted data.',
    color: 'text-emerald-500 bg-emerald-500/10'
  },
  {
    icon: FileCheck,
    title: 'Privacy First',
    desc: 'All personal profiles, evaluations, feedback logs, and workspace documents remain secure and under user control.',
    color: 'text-purple-500 bg-purple-500/10'
  },
  {
    icon: TrendingUp,
    title: 'Transparent Progress',
    desc: 'Every assigned task, supervisor review, and milestone update is transparently documented in a single timeline.',
    color: 'text-orange-500 bg-orange-500/10'
  },
  {
    icon: Globe,
    title: 'Built to Grow',
    desc: 'Flexible architecture that serves single student placements as efficiently as university-wide internship cohorts.',
    color: 'text-teal-500 bg-teal-500/10'
  }
];

const PARTICLE_PRESETS = [
  { left: '12%', top: '45%', duration: 4.2, delay: 0.5 },
  { left: '25%', top: '15%', duration: 3.8, delay: 1.2 },
  { left: '38%', top: '78%', duration: 4.9, delay: 0.1 },
  { left: '50%', top: '30%', duration: 3.5, delay: 1.8 },
  { left: '62%', top: '85%', duration: 4.7, delay: 0.8 },
  { left: '78%', top: '22%', duration: 3.9, delay: 1.4 },
  { left: '88%', top: '65%', duration: 4.4, delay: 0.3 },
  { left: '5%', top: '88%', duration: 4.1, delay: 1.6 },
  { left: '92%', top: '12%', duration: 3.6, delay: 0.9 },
  { left: '45%', top: '60%', duration: 4.8, delay: 0.4 },
  { left: '18%', top: '72%', duration: 3.7, delay: 1.1 },
  { left: '30%', top: '50%', duration: 4.5, delay: 0.7 },
  { left: '55%', top: '10%', duration: 3.4, delay: 1.5 },
  { left: '70%', top: '75%', duration: 4.6, delay: 0.2 },
  { left: '82%', top: '55%', duration: 4.0, delay: 1.3 },
  { left: '15%', top: '28%', duration: 3.3, delay: 1.7 },
  { left: '28%', top: '90%', duration: 4.3, delay: 0.6 },
  { left: '60%', top: '40%', duration: 4.1, delay: 1.0 },
  { left: '75%', top: '95%', duration: 4.9, delay: 0.3 },
  { left: '85%', top: '35%', duration: 3.5, delay: 1.9 },
];

export default function Landing() {
  return (
    <div>
      <SEO
        title="ZYR0 — Structured Internship Platform for Students & Employers"
        description="ZYR0 is a professional internship platform connecting students, companies, and mentors. Track student internships, verify completion certificates, and coordinate mentor feedback on a structured platform."
        path="/"
        keywords="internship platform, internship management, student internships, internships in Pakistan, internship tracking, internship certificates, mentor feedback, internship workflow, companies hiring interns"
        structuredData={homepageStructuredData}
      />

      {/* Hero Section — fills the true visible viewport on mobile (dvh) and desktop (100vh fallback) */}
      <section
        aria-label="Platform introduction"
        className="relative flex items-center justify-center overflow-hidden hero-gradient hero-full-height"
      >
        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {PARTICLE_PRESETS.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: particle.left,
                top: particle.top,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
              }}
            />
          ))}
        </div>

        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-20 pb-10 sm:pt-24 sm:pb-16 lg:pt-28 lg:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 text-xs sm:text-sm text-white/90 mb-6 sm:mb-8"
          >
            <Star className="w-4 h-4 text-yellow-400" />
            Structured internships for students and employers
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight text-balance"
          >
            One Platform.
            <br />
            <span className="text-accent">Every Internship.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-4 sm:mt-6 text-base sm:text-lg text-white/70 max-w-2xl mx-auto text-balance"
          >
            From application to certification, ZYR0 gives students, companies, and mentors a structured way to manage internships from start to finish.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
          >
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-accent text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-medium hover:bg-accent/90 transition-all duration-200 shadow-lg shadow-accent/25"
            >
              Start Your Internship
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-medium hover:bg-white/20 transition-all duration-200"
            >
              For Companies
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.0 }}
            className="mt-10 sm:mt-16 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-white/50 text-xs sm:text-sm"
          >
            {[
              { icon: Building2, text: '500+ Partner Companies' },
              { icon: Users, text: '10,000+ Active Students' },
              { icon: GraduationCap, text: '50+ Universities' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <item.icon className="w-4 h-4" />
                {item.text}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section 1 — Every Career Starts Somewhere */}
      <section className="py-14 lg:py-20 px-4 bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Heading and Paragraph */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 space-y-6"
            >
              <span className="text-accent text-sm font-semibold uppercase tracking-wider">Our Purpose</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
                Every career starts somewhere.
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed font-normal">
                Every industry leader was once a beginner, and every meaningful journey begins with a first opportunity. At ZYR0, we believe student internships are more than temporary roles—they are the foundation for long-term career growth.
              </p>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                We connect students looking for professional experience with companies hiring interns to build their future teams. By bringing structure, mentorship, and clear milestones to the process, we help universities bridge academic learning with industry demands. We make internship opportunities measurable, transparent, and structured for career development.
              </p>
            </motion.div>

            {/* Right: Four Elegant Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {roles.map((role, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-card rounded-xl border border-border p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20"
                >
                  <div className={`w-10 h-10 ${role.color} rounded-xl flex items-center justify-center`}>
                    <role.icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{role.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{role.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-14 lg:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">Capabilities</span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-balance">Built for accountability and clear outcomes</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Every tool you need to track progress, align goals, and verify experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="feature-card"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 lg:py-20 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">The Path</span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-balance">How it works</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 relative">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center relative"
              >
                <span className="text-5xl font-bold text-accent/15">{step.num}</span>
                <div className="mt-4 w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto">
                  <step.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-16 right-0 w-1/2 border-t-2 border-dashed border-border" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Companies */}
      <section className="py-14 lg:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-accent text-sm font-semibold uppercase tracking-wider">For Employers</span>
              <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Run your internship programs with confidence</h2>
              <p className="mt-4 text-muted-foreground">
                Manage cohorts of any size from one structured dashboard. Review candidate profiles, structure milestone tasks, assign industry mentors, and issue verified completion certificates.
              </p>
              <div className="mt-8 space-y-4">
                {checkFeatures.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </motion.div>
                ))}
              </div>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 mt-8 bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition-all"
              >
                Post an Internship
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary to-accent dark:from-slate-900 dark:to-accent/50 rounded-2xl p-8 shadow-2xl">
                <div className="bg-card rounded-xl p-6 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Cohort Size</p>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-emerald-500 rounded-full" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <p className="text-lg font-bold">156</p>
                      <p className="text-xs text-muted-foreground">Applicants</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">89%</p>
                      <p className="text-xs text-muted-foreground">Completion</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">4.8</p>
                      <p className="text-xs text-muted-foreground">Feedback</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-card/90 backdrop-blur rounded-xl p-4 shadow-lg flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Cohort activity up 32%</p>
                    <p className="text-xs text-muted-foreground">Compared to last month</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2 — Built on Transparency. Designed for Confidence. */}
      <section className="py-14 lg:py-20 px-4 bg-muted/30 border-t border-b border-border/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">System Credibility</span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Built on transparency. Designed for confidence.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
              A reliable internship management platform requires clear guardrails. We align student internships and internship workflow processes to ensure credibility at every step of career development.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {confidenceCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20"
              >
                <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{card.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-14 lg:py-20 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">Reviews</span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Verified experiences from our community</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-6 shadow-md"
              >
                <Quote className="w-8 h-8 text-accent/20" />
                <p className="mt-3 text-foreground italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <img src={t.avatar} alt={`${t.name} avatar`} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 lg:py-16 px-4 bg-primary dark:bg-slate-950 border-y border-border/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-2xl xs:text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <stat.icon className="w-4 h-4 text-white/50" />
                  <p className="text-sm text-white/60">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-14 lg:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-accent rounded-2xl p-6 sm:p-10 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-balance">Ready to start your next internship?</h2>
              <p className="mt-4 text-white/80 max-w-xl mx-auto">
                Join the students, mentors, and companies building verified professional experience on ZYR0.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-white text-accent px-8 py-3.5 rounded-lg font-medium hover:bg-white/90 transition-all shadow-lg"
                >
                  Start Your Internship
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-transparent text-white border border-white/30 px-8 py-3.5 rounded-lg font-medium hover:bg-white/10 transition-all"
                >
                  For Companies
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
