import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import {
  Search, FileCheck, ClipboardList, Users, Award, Briefcase,
  UserPlus, Send, BookOpen, CheckCircle2, Building2, GraduationCap,
  ArrowRight, Quote, TrendingUp, Globe, Zap, Target, Sparkles
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { BASE_URL } from '@/config/seo';
import { toast } from 'sonner';
import { SITE_CONFIG } from '@/config/site';
import { WhatsAppIcon, LinkedInIcon } from '@/components/icons/BrandIcons';
import { TextRotate } from '@/components/fancy/text/TextRotate';
import { JourneySection } from '@/components/landing/JourneySection/JourneySection';
import AnimatedSearchMockup from '@/components/landing/AnimatedSearchMockup';
import StatsBand from '@/components/landing/StatsBand';
import LogoMarquee from '@/components/landing/LogoMarquee';
import AudienceSplit from '@/components/landing/AudienceSplit';
import RoleChips from '@/components/landing/RoleChips';
import { BlobCard } from '@/components/ui/blob-card';

const homepageStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'ZYR0 Work', item: `${BASE_URL}/internships` },
    ],
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
        'urlTemplate': `${BASE_URL}/internships/browse?search={search_term_string}`
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
      'https://linkedin.com/company/zyr0-co'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'email': 'support@zyroo.org',
      'contactType': 'customer support',
      'availableLanguage': 'English'
    }
  }
];

const features = [
  { icon: Search, title: 'Curated Sourcing', desc: 'Find internships in Pakistan matching your background and career goals. Filter by domain, duration, location type, and stipend to discover opportunities that fit your needs.' },
  { icon: FileCheck, title: 'Application Transparency', desc: 'Track your applications from submission through review to final acceptance in real time. Know exactly where you stand with every opportunity.' },
  { icon: ClipboardList, title: 'Milestone Coordination', desc: 'Manage internship tasks with clear deliverables, timeline tracking, and milestone reviews. Every task has defined acceptance criteria and feedback loops.' },
  { icon: Users, title: 'Professional Mentorship', desc: 'Get matched with industry mentors who review your work, provide structured guidance, and help you grow through actionable feedback on each submission.' },
  { icon: Award, title: 'Verified Achievements', desc: 'Earn secure completion certificates with unique credential IDs that employers can instantly authenticate through the public verification portal.' },
  { icon: Briefcase, title: 'Professional Portfolios', desc: 'Accumulate a permanent, structured history of completed milestones, mentor feedback, and demonstrated skills that you can share with future employers.' },
];

const steps = [
  { num: '01', icon: UserPlus, title: 'Set up your profile', desc: 'Create your student or company account and build a profile that showcases your skills, background, and career focus.' },
  { num: '02', icon: Send, title: 'Apply to listings', desc: 'Browse opportunities filtered by domain, duration, and location. Submit your profile directly to structured internship positions that match your goals.' },
  { num: '03', icon: BookOpen, title: 'Collaborate and complete', desc: 'Receive mentor guidance, complete milestone tasks with defined criteria, and log your progress through the interactive workspace.' },
  { num: '04', icon: Award, title: 'Claim certification', desc: 'Upon completion, receive a verified certificate with a unique credential ID. Share your accomplishment with employers and your professional network.' },
];

const testimonials = [
  {
    kind: 'featured',
    name: 'Akbar Ali',
    role: 'Company Official, Zyroo.org',
    quote: 'Zyroo has transformed how we identify, onboard, and develop emerging talent. The structured internship framework and verified credentials give us full confidence in every candidate we bring on board.',
    image: '/reviews/akbar-review.jpeg',
  },
  {
    kind: 'student',
    name: 'Attaullah',
    role: 'Student',
    quote: 'Zyroo turned my internship into a guided, hands-on experience. Clear milestones and regular mentor feedback helped me build practical skills and real confidence for my career.',
    image: '/reviews/atta-review.jpeg',
  },
  {
    kind: 'student',
    name: 'Amir Jawad',
    role: 'Student',
    quote: 'With Zyroo, I learned through real work rather than theory alone. The structure, guidance, and constructive feedback helped me grow into a more capable and confident professional.',
    image: '/reviews/jawad-review.jpeg',
  },
  {
    kind: 'intern',
    name: 'Bibi Tabassum',
    role: 'Intern',
    quote: 'Zyroo gave me a structured way to learn through real projects. The clarity of the workflow and the quality of the mentor feedback made my internship genuinely effective.',
    image: '/reviews/bibi-tabassum-review.jpeg',
  },
  {
    kind: 'mentor',
    name: 'Saba Iftikhar',
    role: 'AI/ML Engineer & Mentor',
    quote: 'As an engineer and mentor, Zyroo gives me a structured way to guide interns through real projects. The clarity of the workflow and the quality of the feedback tools make mentoring genuinely effective.',
    image: '/reviews/saba-review.jpeg',
  },
];

function testimonialInitials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

const testimonialKindLabel: Record<string, { label: string; className: string }> = {
  featured: { label: 'Company Official', className: 'bg-[var(--zyro-accent-muted)] text-[var(--zyro-accent)] border-[var(--zyro-border)]' },
  student: { label: 'Student', className: 'bg-[var(--zyro-surface)] text-[var(--zyro-text)] border-[var(--zyro-border)]' },
  intern: { label: 'Intern', className: 'bg-[var(--zyro-surface)] text-[var(--zyro-text)] border-[var(--zyro-border)]' },
  mentor: { label: 'Mentor', className: 'bg-[var(--zyro-surface)] text-[var(--zyro-text)] border-[var(--zyro-border)]' },
};

const testimonialKindAccent: Record<string, string> = {
  featured: 'var(--zyro-accent)',
  student: 'var(--zyro-accent)',
  intern: 'var(--zyro-accent)',
  mentor: 'var(--zyro-accent)',
};

const roles = [
  {
    icon: GraduationCap,
    title: 'Students',
    desc: 'Build experience that employers recognize.',
  },
  {
    icon: Building2,
    title: 'Companies',
    desc: 'Develop future professionals through structured internships.',
  },
  {
    icon: Users,
    title: 'Mentors',
    desc: 'Guide the next generation with measurable impact.',
  },
  {
    icon: Globe,
    title: 'Universities',
    desc: 'Bridge education with industry experience.',
  }
];

const confidenceCards = [
  {
    icon: Award,
    title: 'Verified Certificates',
    desc: 'Every certificate issued is tamper-proof and linked to a unique credential ID that any prospective employer can instantly verify through the public verification portal.',
  },
  {
    icon: ClipboardList,
    title: 'Structured Internship Lifecycle',
    desc: 'From initial application through task management, mentor feedback, and final certification — every stage follows a consistent, documented process that both interns and companies can rely on.',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    desc: 'Granular access controls ensure students, mentors, employers, and administrators only interact with the data and features relevant to their role on the platform.',
  },
  {
    icon: FileCheck,
    title: 'Privacy First',
    desc: 'Personal profiles, evaluations, feedback logs, and workspace documents remain secure behind authentication and Row Level Security policies tailored to each user role.',
  },
  {
    icon: TrendingUp,
    title: 'Transparent Progress',
    desc: 'Every assigned task, supervisor review, and milestone update is documented in a single timeline visible to all stakeholders — no more lost emails or status confusion.',
  },
  {
    icon: Globe,
    title: 'Built to Grow',
    desc: 'Architected to serve single student placements as efficiently as university-wide internship cohorts, with flexible configuration that adapts to programs of any size.',
  }
];

const MotionDiv = ({ isMobile, children, initial, animate, transition, whileInView, viewport, ...props }: any) => {
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return <div {...props}>{children}</div>;
  }
  return (
    <m.div
      initial={initial}
      animate={animate}
      transition={transition}
      whileInView={whileInView}
      viewport={viewport}
      {...props}
    >
      {children}
    </m.div>
  );
};

const MotionSpan = ({ isMobile, children, initial, animate, transition, whileInView, viewport, ...props }: any) => {
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return <span {...props}>{children}</span>;
  }
  return (
    <m.span
      initial={initial}
      animate={animate}
      transition={transition}
      whileInView={whileInView}
      viewport={viewport}
      {...props}
    >
      {children}
    </m.span>
  );
};

const MotionP = ({ isMobile, children, initial, animate, transition, whileInView, viewport, ...props }: any) => {
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return <p {...props}>{children}</p>;
  }
  return (
    <m.p
      initial={initial}
      animate={animate}
      transition={transition}
      whileInView={whileInView}
      viewport={viewport}
      {...props}
    >
      {children}
    </m.p>
  );
};

export default function InternshipsLanding() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(media.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    media.addEventListener('change', listener);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });

    return () => {
      media.removeEventListener('change', listener);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);


  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width) * 100;
    const y = ((clientY - top) / height) * 100;
    currentTarget.style.setProperty('--mouse-x', `${x}%`);
    currentTarget.style.setProperty('--mouse-y', `${y}%`);
  };

  // Helper to dynamically adjust animation props based on screen size/prefers-reduced-motion
  const animProps = (initialVal: any, animateVal: any, transitionVal: any) => {
    if (prefersReducedMotion) return { initial: false };
    if (isMobile) {
      return {
        initial: initialVal,
        animate: animateVal,
        transition: { duration: 0.25, ease: 'easeOut' },
      };
    }
    return {
      initial: initialVal,
      animate: animateVal,
      transition: transitionVal,
    };
  };

  const viewProps = (initialVal: any, whileInViewVal: any, transitionVal: any = undefined) => {
    if (prefersReducedMotion) return { initial: false };
    if (isMobile) {
      return {
        initial: initialVal,
        whileInView: whileInViewVal,
        viewport: { once: true, margin: '-20px' },
        transition: { duration: 0.3, ease: 'easeOut' },
      };
    }
    return {
      initial: initialVal,
      whileInView: whileInViewVal,
      viewport: { once: true, margin: '-30px' },
      transition: transitionVal,
    };
  };

  return (
    <div
      className="relative min-h-screen overflow-x-clip transition-colors duration-200"
      style={{
        background: 'var(--zyro-bg)',
        color: 'var(--zyro-text)',
      }}
    >
      <SEO
        title="ZYR0 Work — Structured Internship Platform for Students & Employers"
        description="ZYR0 Work is a professional internship platform connecting students, companies, and mentors. Track student internships, verify completion certificates, and coordinate mentor feedback on a structured platform."
        path="/internships"
        keywords="internship platform, internship management, student internships, internships in Pakistan, internship tracking, internship certificates, mentor feedback, internship workflow, companies hiring interns"
        structuredData={homepageStructuredData}
      />

      {/* Floating Content Layer */}
      <div className="relative z-10">

        {/* Hero Section — aligned to ZYR0 luxury-tech minimalism */}
        <section
          aria-label="Platform introduction"
          className="relative flex items-center justify-center overflow-hidden py-16 lg:py-24"
        >
          {/* Subtle Sapphire Ambient Glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: 'radial-gradient(circle at 60% 25%, var(--zyro-sapphire-muted) 0%, transparent 70%)',
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Typography, Actions, Trust */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-6 lg:space-y-8 text-left">

                {/* Top Announcement Badge */}
                <MotionDiv
                  isMobile={isMobile}
                  {...animProps(
                    { opacity: 0, y: -10 },
                    { opacity: 1, y: 0 },
                    { duration: 0.4, delay: 0.1 }
                  )}
                  className="inline-flex items-center gap-2.5 self-start px-4 py-1.5 rounded-full text-xs font-medium border shadow-xs backdrop-blur-md transition-colors"
                  style={{
                    background: 'var(--zyro-surface)',
                    borderColor: 'var(--zyro-border)',
                    color: 'var(--zyro-text-secondary)',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[var(--zyro-accent)]" />
                  <span className="font-mono text-[11px] tracking-[0.2em] uppercase">ZYR0 Work • Verified Internship Engine</span>
                </MotionDiv>

                {/* Title Section with DM Serif Text */}
                <div className="space-y-2 sm:space-y-3">
                  <MotionDiv
                    isMobile={isMobile}
                    {...animProps(
                      { opacity: 0, y: 15 },
                      { opacity: 1, y: 0 },
                      { duration: 0.5, delay: 0.2 }
                    )}
                    className="font-serif font-normal text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[4.75rem] tracking-tight leading-[1.05]"
                    style={{ color: 'var(--zyro-text)' }}
                  >
                    Launch Your Career With{' '}
                    <span className="italic" style={{ color: 'var(--zyro-accent)' }}>Internships</span>{' '}
                    that Matter
                  </MotionDiv>

                  <div className="font-serif font-normal text-3xl xs:text-4xl sm:text-5xl md:text-6xl tracking-tight leading-tight min-h-[1.3em] flex items-center">
                    <TextRotate
                      texts={[
                        'Paid Roles.',
                        'Real Experience.',
                        'Verified Credentials.',
                        'Industry Projects.',
                        'Engineering Mentorship.',
                        'Verifiable Career Growth.',
                      ]}
                      mainClassName="font-serif font-normal tracking-tight text-[var(--zyro-accent)]"
                      staggerFrom="last"
                      initial={{ y: '100%', opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: '-120%', opacity: 0 }}
                      staggerDuration={0.02}
                      splitLevelClassName="overflow-hidden py-1"
                      transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                      rotationInterval={3400}
                      ariaLabel="Career Opportunities on ZYR0"
                    />
                  </div>
                </div>

                {/* Supporting Value Proposition */}
                <MotionP
                  isMobile={isMobile}
                  {...animProps(
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0 },
                    { duration: 0.5, delay: 0.4 }
                  )}
                  className="text-base sm:text-lg max-w-xl leading-relaxed"
                  style={{ color: 'var(--zyro-text-secondary)' }}
                >
                  Free for students · 1,200+ live verified placements. ZYR0 bridges
                  academic learning with engineering demands — structured milestone
                  tasks, 1-on-1 mentor guidance, and employer-verified certificates that
                  accelerate your hiring pipeline.
                </MotionP>

                {/* Action CTAs */}
                <MotionDiv
                  isMobile={isMobile}
                  {...animProps(
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0 },
                    { duration: 0.4, delay: 0.5 }
                  )}
                  className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5 pt-1"
                >
                  <Link
                    to="/internships/browse"
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-semibold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    style={{
                      background: 'var(--zyro-text)',
                      color: 'var(--zyro-bg)',
                    }}
                  >
                    <span>Find an Internship</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/register?redirect=%2Finternships"
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-medium text-sm border transition-all duration-200"
                    style={{
                      background: 'var(--zyro-surface)',
                      borderColor: 'var(--zyro-border)',
                      color: 'var(--zyro-text-secondary)',
                    }}
                  >
                    <span>For Employers</span>
                  </Link>
                  <a
                    href={SITE_CONFIG.social.whatsappChannel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full font-medium text-sm border transition-all duration-200 hover:opacity-90"
                    style={{
                      background: 'var(--zyro-surface)',
                      borderColor: 'var(--zyro-border)',
                      color: 'var(--zyro-text-muted)',
                    }}
                    title="Join ZYR0 Official WhatsApp Channel for instant job & internship updates"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <WhatsAppIcon className="w-4 h-4 fill-current text-emerald-500" />
                    <span>WhatsApp Channel</span>
                  </a>
                </MotionDiv>
              </div>

              {/* Right Column: Animated Search Mockup */}
              <div className="lg:col-span-5 relative w-full h-[420px] sm:h-[470px] lg:h-[520px] flex items-center justify-center">
                {/* Glowing gradients */}
                <div className="absolute w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute w-56 h-56 bg-indigo-500/15 rounded-full blur-3xl -top-10 -right-10 pointer-events-none" />

                <MotionDiv
                  isMobile={isMobile}
                  {...animProps(
                    { opacity: 0, y: 40, scale: 0.95 },
                    { opacity: 1, y: 0, scale: 1 },
                    { duration: 0.6, delay: 0.7 }
                  )}
                  className="w-full flex justify-center"
                >
                  <AnimatedSearchMockup />
                </MotionDiv>
              </div>

            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none hidden sm:flex">
            <span className="text-slate-500 dark:text-white/30 text-[9px] tracking-[0.2em] uppercase font-medium">Scroll to Explore</span>
            <div className="w-5 h-8 border border-slate-300 dark:border-white/20 rounded-full flex justify-center p-1">
              <MotionDiv
                isMobile={isMobile}
                {...animProps(
                  null,
                  isMobile ? {} : { y: [0, 10, 0] },
                  isMobile ? {} : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                )}
                className="w-1.5 h-1.5 bg-accent rounded-full"
              />
            </div>
          </div>
        </section>

        {/* Stats Band — animated count-up social proof */}
        <StatsBand />

        {/* Employer Logo Marquee */}
        <LogoMarquee />

        {/* Community / Stay Updated Section */}
        <section className="py-14 lg:py-20 px-4 bg-transparent relative overflow-hidden border-y border-[var(--zyro-border)]">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-mono tracking-[0.2em] uppercase mb-4 border shadow-xs"
                style={{
                  background: 'var(--zyro-surface)',
                  borderColor: 'var(--zyro-border)',
                  color: 'var(--zyro-accent)',
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--zyro-accent)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--zyro-accent)]"></span>
                </span>
                Official Community Channels
              </div>
              <h2
                className="font-serif font-normal text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight mb-4"
                style={{ color: 'var(--zyro-text)' }}
              >
                Never Miss an Opportunity. <br className="hidden sm:inline" />
                <span className="italic" style={{ color: 'var(--zyro-accent)' }}>
                  Stay Connected in Real-Time.
                </span>
              </h2>
              <p
                className="mt-4 text-base sm:text-lg leading-relaxed"
                style={{ color: 'var(--zyro-text-secondary)' }}
              >
                Join the official ZYR0 community channels for instant alerts on new internship drops, hiring drives, platform announcements, and career resources across Pakistan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Live WhatsApp Channel Card */}
              <MotionDiv
                isMobile={isMobile}
                {...viewProps(
                  { opacity: 0, y: 20 },
                  { opacity: 1, y: 0 },
                  { duration: 0.5, delay: 0.1 }
                )}
                className="rounded-2xl border p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg group"
                style={{
                  background: 'var(--zyro-surface)',
                  borderColor: 'var(--zyro-border)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 transition-transform duration-300 group-hover:scale-105">
                      <WhatsAppIcon className="w-6 h-6 fill-current" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Alerts
                    </span>
                  </div>
                  <h3
                    className="text-xl sm:text-2xl font-semibold mb-2 transition-colors"
                    style={{ color: 'var(--zyro-text)' }}
                  >
                    WhatsApp Channel
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-6"
                    style={{ color: 'var(--zyro-text-secondary)' }}
                  >
                    Receive instant broadcast alerts for high-priority internship openings, hiring announcements, deadlines, and official platform news directly on WhatsApp.
                  </p>
                </div>
                <a
                  href={SITE_CONFIG.social.whatsappChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join ZYR0 WhatsApp Channel for instant updates"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-semibold text-sm transition-all duration-200 shadow-sm hover:scale-[1.01] active:scale-[0.98]"
                  style={{
                    background: 'var(--zyro-text)',
                    color: 'var(--zyro-bg)',
                  }}
                >
                  <WhatsAppIcon className="w-4.5 h-4.5 fill-current" />
                  <span>Join WhatsApp Channel</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </MotionDiv>

              {/* Live LinkedIn Network Card */}
              <MotionDiv
                isMobile={isMobile}
                {...viewProps(
                  { opacity: 0, y: 20 },
                  { opacity: 1, y: 0 },
                  { duration: 0.5, delay: 0.2 }
                )}
                className="rounded-2xl border p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg group"
                style={{
                  background: 'var(--zyro-surface)',
                  borderColor: 'var(--zyro-border)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 transition-transform duration-300 group-hover:scale-105">
                      <LinkedInIcon className="w-6 h-6 fill-current" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      Official Page
                    </span>
                  </div>
                  <h3
                    className="text-xl sm:text-2xl font-semibold mb-2 transition-colors"
                    style={{ color: 'var(--zyro-text)' }}
                  >
                    LinkedIn Network
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-6"
                    style={{ color: 'var(--zyro-text-secondary)' }}
                  >
                    Follow our official LinkedIn page for professional networking, employer spotlights, student success stories, and corporate announcements.
                  </p>
                </div>
                <a
                  href={SITE_CONFIG.social.linkedinCompany}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow ZYR0 on LinkedIn"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-semibold text-sm transition-all duration-200 shadow-sm hover:scale-[1.01] active:scale-[0.98]"
                  style={{
                    background: 'var(--zyro-text)',
                    color: 'var(--zyro-bg)',
                  }}
                >
                  <LinkedInIcon className="w-4.5 h-4.5 fill-current" />
                  <span>Follow on LinkedIn</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </MotionDiv>
            </div>
          </div>
        </section>

        {/* Section 1 — Every Career Starts Somewhere */}
        <section className="py-14 lg:py-20 px-4 bg-transparent content-visibility-auto">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left: Heading and Paragraph */}
              <MotionDiv
                isMobile={isMobile}
                {...viewProps(
                  { opacity: 0, x: -30 },
                  { opacity: 1, x: 0 },
                  { duration: 0.6 }
                )}
                className="lg:col-span-5 space-y-6"
              >
                <span
                  className="font-mono text-[11px] tracking-[0.25em] uppercase"
                  style={{ color: 'var(--zyro-accent)' }}
                >
                  Our Purpose
                </span>
                <h2
                  className="font-serif font-normal text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight"
                  style={{ color: 'var(--zyro-text)' }}
                >
                  Every career starts <span className="italic" style={{ color: 'var(--zyro-accent)' }}>somewhere.</span>
                </h2>
                <p
                  className="text-base sm:text-lg leading-relaxed font-normal"
                  style={{ color: 'var(--zyro-text-secondary)' }}
                >
                  Every industry leader was once a beginner, and every meaningful journey begins with a first opportunity. At ZYR0, we believe student internships are more than temporary roles—they are the foundation for long-term career growth.
                </p>
                <p
                  className="text-sm sm:text-base leading-relaxed"
                  style={{ color: 'var(--zyro-text-secondary)' }}
                >
                  Students across Pakistan often face a fragmented internship landscape: unstructured applications, no standardized feedback, and credentials that employers struggle to verify. ZYR0 replaces this uncertainty with a cohesive platform that connects students, companies, and mentors in one ecosystem. We bring structure, mentorship, and clear milestones to every internship while helping universities bridge academic learning with industry demands.
                </p>
                <p
                  className="text-sm sm:text-base leading-relaxed"
                  style={{ color: 'var(--zyro-text-secondary)' }}
                >
                  Whether you are a student seeking your first professional role, a company looking to build a talent pipeline, a mentor wanting to guide the next generation, or a university aiming to strengthen industry linkages — ZYR0 provides the infrastructure to make internships measurable, transparent, and career-relevant.
                </p>
              </MotionDiv>

              {/* Right: Four Elegant Cards */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {roles.map((role, i) => (
                  <MotionDiv
                    isMobile={isMobile}
                    key={i}
                    role="article"
                    {...viewProps(
                      { opacity: 0, y: 30 },
                      { opacity: 1, y: 0 },
                      { duration: 0.5, delay: i * 0.1 }
                    )}
                    className="rounded-2xl border p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                    style={{
                      background: 'var(--zyro-surface)',
                      borderColor: 'var(--zyro-border)',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border"
                      style={{
                        background: 'var(--zyro-surface)',
                        borderColor: 'var(--zyro-border)',
                        color: 'var(--zyro-accent)',
                      }}
                    >
                      <role.icon className="w-5 h-5" />
                    </div>
                    <h3
                      className="mt-4 font-semibold text-lg"
                      style={{ color: 'var(--zyro-text)' }}
                    >
                      {role.title}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: 'var(--zyro-text-secondary)' }}
                    >
                      {role.desc}
                    </p>
                  </MotionDiv>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-14 lg:py-20 px-4 content-visibility-auto">
          <div className="max-w-7xl mx-auto">
            <MotionDiv
              isMobile={isMobile}
              {...viewProps(
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0 }
              )}
              className="text-center mb-14"
            >
              <span
                className="font-mono text-[11px] tracking-[0.25em] uppercase"
                style={{ color: 'var(--zyro-accent)' }}
              >
                Capabilities
              </span>
              <h2
                className="mt-3 font-serif font-normal text-3xl sm:text-4xl lg:text-5xl text-balance"
                style={{ color: 'var(--zyro-text)' }}
              >
                Built for accountability and{' '}
                <span className="italic" style={{ color: 'var(--zyro-accent)' }}>
                  clear outcomes
                </span>
              </h2>
              <p
                className="mt-4 max-w-2xl mx-auto text-base"
                style={{ color: 'var(--zyro-text-secondary)' }}
              >
                Students, companies, and mentors use ZYR0 to track progress, share feedback, and verify internship outcomes — all within a single structured workflow designed for measurable growth.
              </p>
            </MotionDiv>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <MotionDiv
                  isMobile={isMobile}
                  key={i}
                  {...viewProps(
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0 },
                    { duration: 0.5, delay: i * 0.1 }
                  )}
                  className="rounded-2xl border p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    background: 'var(--zyro-surface)',
                    borderColor: 'var(--zyro-border)',
                  }}
                  role="article"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border"
                    style={{
                      background: 'var(--zyro-surface)',
                      borderColor: 'var(--zyro-border)',
                      color: 'var(--zyro-accent)',
                    }}
                  >
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3
                    className="mt-4 font-semibold text-lg"
                    style={{ color: 'var(--zyro-text)' }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: 'var(--zyro-text-secondary)' }}
                  >
                    {feature.desc}
                  </p>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>

        {/* Stacking Cards Storytelling Journey */}
        <JourneySection />

        {/* Dual-Audience Split — Students / Employers */}
        <AudienceSplit />

        {/* Trending Roles Chip Cloud */}
        <RoleChips />

        {/* Section 2 — Built on Transparency. Designed for Confidence. */}
        <section className="py-14 lg:py-20 px-4 bg-transparent content-visibility-auto">
          <div className="max-w-7xl mx-auto">
            <MotionDiv
              isMobile={isMobile}
              {...viewProps(
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0 }
              )}
              className="text-center mb-14"
            >
              <span
                className="font-mono text-[11px] tracking-[0.25em] uppercase"
                style={{ color: 'var(--zyro-accent)' }}
              >
                System Credibility
              </span>
              <h2
                className="mt-3 font-serif font-normal text-3xl sm:text-4xl lg:text-5xl tracking-tight"
                style={{ color: 'var(--zyro-text)' }}
              >
                Built on transparency.{' '}
                <span className="italic" style={{ color: 'var(--zyro-accent)' }}>
                  Designed for confidence.
                </span>
              </h2>
              <p
                className="mt-4 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed"
                style={{ color: 'var(--zyro-text-secondary)' }}
              >
                A reliable internship management platform requires clear guardrails at every stage — from application through task completion and certification. ZYR0 aligns processes with industry expectations to ensure internships translate into credible, verifiable career development for all participants.
              </p>
            </MotionDiv>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {confidenceCards.map((card, i) => (
                <MotionDiv
                  isMobile={isMobile}
                  key={i}
                  role="article"
                  {...viewProps(
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0 },
                    { duration: 0.5, delay: i * 0.1 }
                  )}
                  className="rounded-2xl border p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    background: 'var(--zyro-surface)',
                    borderColor: 'var(--zyro-border)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border"
                    style={{
                      background: 'var(--zyro-surface)',
                      borderColor: 'var(--zyro-border)',
                      color: 'var(--zyro-accent)',
                    }}
                  >
                    <card.icon className="w-5 h-5" />
                  </div>
                  <h3
                    className="mt-4 font-semibold text-base"
                    style={{ color: 'var(--zyro-text)' }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="mt-2 text-xs sm:text-sm leading-relaxed"
                    style={{ color: 'var(--zyro-text-secondary)' }}
                  >
                    {card.desc}
                  </p>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-14 lg:py-20 px-4 bg-transparent content-visibility-auto">
          <div className="max-w-7xl mx-auto">
            <MotionDiv
              isMobile={isMobile}
              {...viewProps(
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0 }
              )}
              className="text-center mb-14"
            >
              <span
                className="font-mono text-[11px] tracking-[0.25em] uppercase"
                style={{ color: 'var(--zyro-accent)' }}
              >
                Reviews
              </span>
              <h2
                className="mt-3 font-serif font-normal text-3xl sm:text-4xl lg:text-5xl tracking-tight"
                style={{ color: 'var(--zyro-text)' }}
              >
                Verified experiences from{' '}
                <span className="italic" style={{ color: 'var(--zyro-accent)' }}>
                  our community
                </span>
              </h2>
              <p
                className="mt-4 text-base max-w-xl mx-auto leading-relaxed"
                style={{ color: 'var(--zyro-text-secondary)' }}
              >
                Real people, real results — from students, mentors, and companies who've experienced ZYR0 first-hand.
              </p>
            </MotionDiv>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              {testimonials.map((t, i) => {
                const label = testimonialKindLabel[t.kind];
                const accent = testimonialKindAccent[t.kind];
                if (t.kind === 'featured') {
                  return (
                    <MotionDiv
                      isMobile={isMobile}
                      key={i}
                      role="article"
                      {...viewProps(
                        { opacity: 0, y: 30 },
                        { opacity: 1, y: 0 },
                        { duration: 0.5, delay: i * 0.1 }
                      )}
                      className="md:col-span-12 group h-full transition-all duration-300 hover:-translate-y-1"
                    >
                      <BlobCard
                        accent={accent}
                        className="w-full h-full min-h-[700px] xs:min-h-[820px] md:min-h-[460px] border border-[var(--zyro-border)]"
                        contentClassName="grid md:grid-cols-[5fr_7fr] w-full h-full bg-[var(--zyro-surface)]"
                      >
                        {/* Photo with gradient overlay for depth */}
                        <div className="relative aspect-[3/4] md:aspect-auto md:h-full overflow-hidden bg-slate-100 dark:bg-slate-800/40">
                          <img
                            src={t.image}
                            alt={`${t.name}`}
                            width="1200"
                            height="1600"
                            loading="lazy"
                            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                        </div>

                        {/* Quote side */}
                        <div className="p-7 md:p-10 flex flex-col justify-center gap-6">
                          <span className={`inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] border ${label.className}`}>
                            {label.label}
                          </span>

                          <div>
                            <Quote className="w-10 h-10 mb-3 opacity-20" style={{ color: 'var(--zyro-accent)' }} />
                            <p
                              className="text-lg md:text-xl lg:text-2xl leading-[1.55] font-serif font-normal"
                              style={{ color: 'var(--zyro-text)' }}
                            >
                              "{t.quote}"
                            </p>
                          </div>

                          <div
                            className="pt-5 border-t flex items-center gap-4"
                            style={{ borderColor: 'var(--zyro-border)' }}
                          >
                            <div
                              className="w-12 h-12 rounded-full border shrink-0 overflow-hidden flex items-center justify-center p-1.5"
                              style={{
                                background: 'var(--zyro-surface)',
                                borderColor: 'var(--zyro-border)',
                              }}
                            >
                              <img src="/zyro-logo.webp" alt="ZYR0 logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-base font-semibold" style={{ color: 'var(--zyro-text)' }}>{t.name}</p>
                              <p className="text-sm mt-0.5" style={{ color: 'var(--zyro-text-secondary)' }}>{t.role}</p>
                            </div>
                          </div>
                        </div>
                      </BlobCard>
                    </MotionDiv>
                  );
                }
                return (
                  <MotionDiv
                    isMobile={isMobile}
                    key={i}
                    role="article"
                    {...viewProps(
                      { opacity: 0, y: 30 },
                      { opacity: 1, y: 0 },
                      { duration: 0.5, delay: i * 0.1 }
                    )}
                    className="md:col-span-6 lg:col-span-3 group h-full transition-all duration-300 hover:-translate-y-1"
                  >
                    <BlobCard
                      accent={accent}
                      className="w-full h-full min-h-[560px] xs:min-h-[640px] border border-[var(--zyro-border)]"
                      contentClassName="!items-start !justify-start w-full h-full bg-[var(--zyro-surface)]"
                    >
                      {/* Photo */}
                      {t.image ? (
                        <div className="relative h-60 w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800/40">
                          <img
                            src={t.image}
                            alt={`${t.name}`}
                            width="600"
                            height="800"
                            loading="lazy"
                            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                        </div>
                      ) : (
                        <div
                          className="relative h-60 w-full shrink-0 overflow-hidden flex items-center justify-center border-b"
                          style={{
                            background: 'var(--zyro-surface)',
                            borderColor: 'var(--zyro-border)',
                          }}
                        >
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center border shadow-sm"
                            style={{
                              background: 'var(--zyro-surface)',
                              borderColor: 'var(--zyro-border)',
                              color: 'var(--zyro-accent)',
                            }}
                          >
                            <Users className="w-8 h-8" />
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-5 pb-3 flex flex-col flex-1 w-full">
                        <div className="flex-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.18em] border ${label.className}`}>
                            {label.label}
                          </span>
                          <Quote className="mt-3 w-6 h-6 opacity-20" style={{ color: 'var(--zyro-accent)' }} />
                          <p
                            className="mt-2 text-sm leading-relaxed"
                            style={{ color: 'var(--zyro-text-secondary)' }}
                          >
                            "{t.quote}"
                          </p>
                        </div>
                        <div
                          className="mt-5 pt-5 border-t flex items-center gap-3.5 px-1"
                          style={{ borderColor: 'var(--zyro-border)' }}
                        >
                          <div
                            className="w-11 h-11 rounded-full border shrink-0 overflow-hidden flex items-center justify-center"
                            style={{
                              background: 'var(--zyro-surface)',
                              borderColor: 'var(--zyro-border)',
                            }}
                          >
                            {t.image ? (
                              <img
                                src={t.image}
                                alt={t.name}
                                width="44"
                                height="44"
                                className="w-full h-full object-cover object-[center_15%]"
                              />
                            ) : (
                              <span className="text-xs font-mono font-semibold" style={{ color: 'var(--zyro-text)' }}>
                                {testimonialInitials(t.name)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-[15px] font-semibold leading-tight" style={{ color: 'var(--zyro-text)' }}>{t.name}</p>
                            <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--zyro-text-secondary)' }}>{t.role}</p>
                          </div>
                        </div>
                      </div>
                    </BlobCard>
                  </MotionDiv>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-14 lg:py-20 px-4 content-visibility-auto">
          <div className="max-w-5xl mx-auto">
            <MotionDiv
              isMobile={isMobile}
              {...viewProps(
                { opacity: 0, scale: 0.98 },
                { opacity: 1, scale: 1 },
                { duration: 0.6 }
              )}
              className="relative rounded-3xl border p-8 sm:p-12 md:p-16 text-center overflow-hidden shadow-xl"
              style={{
                background: 'var(--zyro-surface)',
                borderColor: 'var(--zyro-border)',
              }}
            >
              {/* Subtle ambient accent glow */}
              <div
                className="absolute top-0 right-1/4 -mt-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 dark:opacity-30"
                style={{ background: 'var(--zyro-accent)' }}
              />

              <div className="relative z-10 space-y-6">
                <span
                  className="inline-block px-3.5 py-1.5 rounded-full font-mono text-[11px] tracking-[0.2em] uppercase border"
                  style={{
                    background: 'var(--zyro-bg)',
                    borderColor: 'var(--zyro-border)',
                    color: 'var(--zyro-accent)',
                  }}
                >
                  Get Started Today
                </span>
                <h2
                  className="font-serif font-normal text-3xl sm:text-4xl lg:text-5xl tracking-tight max-w-2xl mx-auto"
                  style={{ color: 'var(--zyro-text)' }}
                >
                  Ready to transform{' '}
                  <span className="italic" style={{ color: 'var(--zyro-accent)' }}>
                    how internships work?
                  </span>
                </h2>
                <p
                  className="max-w-xl mx-auto text-base leading-relaxed"
                  style={{ color: 'var(--zyro-text-secondary)' }}
                >
                  Join thousands of students, companies, mentors, and universities building Pakistan's structured internship ecosystem.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <Link
                    to="/register?redirect=%2Finternships"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full font-medium text-sm transition-all hover:opacity-90 shadow-sm"
                    style={{
                      background: 'var(--zyro-text)',
                      color: 'var(--zyro-bg)',
                    }}
                  >
                    Create Free Account
                  </Link>
                  <Link
                    to="/internships/browse"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full font-medium text-sm border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                    style={{
                      borderColor: 'var(--zyro-border)',
                      color: 'var(--zyro-text)',
                    }}
                  >
                    Explore Opportunities
                  </Link>
                </div>
              </div>
            </MotionDiv>
          </div>
        </section>
      </div>
    </div>
  );
}
