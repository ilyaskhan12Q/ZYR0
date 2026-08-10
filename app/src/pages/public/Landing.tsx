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
import { CanvasParticles } from '@/components/CanvasParticles';
import { toast } from 'sonner';
import { SITE_CONFIG } from '@/config/site';
import { WhatsAppIcon, LinkedInIcon } from '@/components/icons/BrandIcons';
import { TextRotate } from '@/components/fancy/text/TextRotate';
import { BackgroundLayer } from '@/components/landing/BackgroundLayer';
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
  { icon: Search, title: 'Curated Sourcing', desc: 'Find internships in Pakistan matching your background and career goals. Filter by domain, duration, location type, and stipend to discover opportunities that fit your needs.', color: 'bg-blue-100 text-blue-600' },
  { icon: FileCheck, title: 'Application Transparency', desc: 'Track your applications from submission through review to final acceptance in real time. Know exactly where you stand with every opportunity.', color: 'bg-emerald-100 text-emerald-600' },
  { icon: ClipboardList, title: 'Milestone Coordination', desc: 'Manage internship tasks with clear deliverables, timeline tracking, and milestone reviews. Every task has defined acceptance criteria and feedback loops.', color: 'bg-purple-100 text-purple-600' },
  { icon: Users, title: 'Professional Mentorship', desc: 'Get matched with industry mentors who review your work, provide structured guidance, and help you grow through actionable feedback on each submission.', color: 'bg-orange-100 text-orange-600' },
  { icon: Award, title: 'Verified Achievements', desc: 'Earn secure completion certificates with unique credential IDs that employers can instantly authenticate through the public verification portal.', color: 'bg-yellow-100 text-yellow-600' },
  { icon: Briefcase, title: 'Professional Portfolios', desc: 'Accumulate a permanent, structured history of completed milestones, mentor feedback, and demonstrated skills that you can share with future employers.', color: 'bg-teal-100 text-teal-600' },
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
    name: 'Atta',
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
  featured: { label: 'Company Official', className: 'bg-blue-600/10 text-blue-600 dark:text-sky-400 border-blue-600/20' },
  student: { label: 'Student', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  intern: { label: 'Intern', className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20' },
  mentor: { label: 'Mentor', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
};

const testimonialKindAccent: Record<string, string> = {
  featured: '#3b82f6',
  student: '#10b981',
  intern: '#8b5cf6',
  mentor: '#f59e0b',
};

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
    desc: 'Every certificate issued is tamper-proof and linked to a unique credential ID that any prospective employer can instantly verify through the public verification portal.',
    color: 'text-yellow-500 bg-yellow-500/10'
  },
  {
    icon: ClipboardList,
    title: 'Structured Internship Lifecycle',
    desc: 'From initial application through task management, mentor feedback, and final certification — every stage follows a consistent, documented process that both interns and companies can rely on.',
    color: 'text-blue-500 bg-blue-500/10'
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    desc: 'Granular access controls ensure students, mentors, employers, and administrators only interact with the data and features relevant to their role on the platform.',
    color: 'text-emerald-500 bg-emerald-500/10'
  },
  {
    icon: FileCheck,
    title: 'Privacy First',
    desc: 'Personal profiles, evaluations, feedback logs, and workspace documents remain secure behind authentication and Row Level Security policies tailored to each user role.',
    color: 'text-purple-500 bg-purple-500/10'
  },
  {
    icon: TrendingUp,
    title: 'Transparent Progress',
    desc: 'Every assigned task, supervisor review, and milestone update is documented in a single timeline visible to all stakeholders — no more lost emails or status confusion.',
    color: 'text-orange-500 bg-orange-500/10'
  },
  {
    icon: Globe,
    title: 'Built to Grow',
    desc: 'Architected to serve single student placements as efficiently as university-wide internship cohorts, with flexible configuration that adapts to programs of any size.',
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

export default function Landing() {
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
    <div className="relative min-h-screen text-slate-100 overflow-x-clip bg-slate-950">
      {/* Background Layer (Fixed z-0 Canvas) */}
      <BackgroundLayer />

      <SEO
        title="ZYR0 — Structured Internship Platform for Students & Employers"
        description="ZYR0 is a professional internship platform connecting students, companies, and mentors. Track student internships, verify completion certificates, and coordinate mentor feedback on a structured platform."
        path="/"
        keywords="internship platform, internship management, student internships, internships in Pakistan, internship tracking, internship certificates, mentor feedback, internship workflow, companies hiring interns"
        structuredData={homepageStructuredData}
      />

      {/* Floating Content Layer (z-10) */}
      <div className="relative z-10">

        {/* Hero Section — redesigned with Sora font pairing, SaaS color system, layered radial glows, and floating workspace preview */}
        <section
          aria-label="Platform introduction"
          onPointerMove={handlePointerMove}
          className="relative flex items-center justify-center overflow-hidden hero-gradient hero-full-height py-14 lg:py-20"
          style={{
            '--mouse-x': '50%',
            '--mouse-y': '50%'
          } as React.CSSProperties}
        >
          {/* Animated Particles - high performance Canvas based rendering */}
          <CanvasParticles />

          {/* Layered Radial Glows & SaaS Ambient Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.14),rgba(79,70,229,0.16),transparent_80%)] pointer-events-none" />
          <div className="hidden lg:block absolute top-1/4 left-1/6 w-[45vw] max-w-[500px] h-[45vw] max-h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="hidden lg:block absolute bottom-1/4 right-1/6 w-[45vw] max-w-[550px] h-[45vw] max-h-[550px] bg-indigo-500/12 rounded-full blur-[160px] pointer-events-none" />
          <div className="hidden lg:block absolute top-1/3 right-1/4 w-[30vw] max-w-[350px] h-[30vw] max-h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Mouse-reactive lighting effect - Only rendered/active on desktop */}
          {!isMobile && (
            <div
              className="absolute inset-0 pointer-events-none opacity-50 mix-blend-screen transition-all duration-300"
              style={{
                background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(16,185,129,0.12), transparent 80%)`,
              }}
            />
          )}


          {/* Subtle Masked Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }} />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-6 lg:mt-0">
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
                  className="inline-flex items-center gap-2.5 self-start bg-white/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 backdrop-blur-xl rounded-full px-4 py-1.5 text-xs text-slate-900 dark:text-white/90 shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-600 dark:text-emerald-400 animate-pulse" />
                  <span className="font-label text-[11px] tracking-[0.22em] text-blue-600 dark:text-sky-400">Pakistan's Premier Internship Engine</span>
                </MotionDiv>

                {/* Title Section with Oversized Sora Typography & TextRotate */}
                <div className="space-y-2 sm:space-y-3">
                  <MotionDiv
                    isMobile={isMobile}
                    {...animProps(
                      { opacity: 0, y: 15 },
                      { opacity: 1, y: 0 },
                      { duration: 0.5, delay: 0.2 }
                    )}
                    className="font-display font-[800] text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[4.85rem] tracking-[-0.035em] text-slate-900 dark:text-white leading-[1.06] drop-shadow-sm"
                  >
                    Launch Your Career With{' '}
                    <span className="font-accent text-gradient-v3">Internships</span>{' '}
                    that Matter
                  </MotionDiv>

                  <div className="font-display font-[900] text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[4.85rem] tracking-[-0.035em] leading-[1.06] min-h-[1.3em] flex items-center">
                    <TextRotate
                      texts={[
                        'Paid Roles.',
                        'Real Experience.',
                        'Verified Certificates.',
                        'Industry Projects.',
                        'Dream Companies.',
                        'Career Growth.',
                      ]}
                      mainClassName="text-rotate-v3 font-display font-[900] tracking-[-0.035em]"
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
                  className="text-base sm:text-lg text-slate-600 dark:text-slate-300/80 max-w-xl leading-relaxed font-normal"
                >
                  Free for students · Paid internships · 1,200+ live roles. ZYR0 bridges
                  academic learning with real-world industry demands — structured milestone
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
                    to="/internships"
                    className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-white font-display font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm sm:text-base border border-sky-400/30"
                  >
                    Find an Internship
                    <ArrowRight className="w-4.5 h-4.5" />
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 bg-slate-900/80 hover:bg-slate-800/90 text-white border border-white/20 backdrop-blur-xl px-6 py-3.5 rounded-xl font-display font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm sm:text-base shadow-md hover:border-white/30"
                  >
                    For Employers
                  </Link>
                  <a
                    href={SITE_CONFIG.social.whatsappChannel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-slate-900/80 border border-emerald-500/35 text-emerald-300 px-5 py-3.5 rounded-xl font-medium hover:bg-slate-800/90 hover:border-emerald-400/50 backdrop-blur-xl transition-all duration-200 text-sm hover:scale-[1.02] active:scale-[0.98] shadow-md"
                    title="Join ZYR0 Official WhatsApp Channel for instant job & internship updates"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 dark:bg-sky-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 dark:bg-emerald-400" />
                    </span>
                    <WhatsAppIcon className="w-4 h-4 fill-current text-emerald-600 dark:text-emerald-400" />
                    <span>WhatsApp Channel</span>
                  </a>
                </MotionDiv>
              </div>

              {/* Supporting Value Proposition */}
              <MotionP
                isMobile={isMobile}
                {...animProps(
                  { opacity: 0, y: 20 },
                  { opacity: 1, y: 0 },
                  { duration: 0.5, delay: 0.4 }
                )}
                className="text-base sm:text-lg text-slate-600 dark:text-slate-300/80 max-w-xl leading-relaxed font-normal"
              >
                Free for students · Paid internships. ZYR0 bridges
                academic learning with real-world industry demands — structured milestone
                tasks, 1-on-1 mentor guidance, and employer-verified certificates that
                accelerate your hiring pipeline.
              </MotionP>

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
        <section className="py-14 lg:py-20 px-4 bg-transparent relative overflow-hidden border-y border-slate-200 dark:border-white/10">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-400/10 border border-sky-400/25 text-sky-400 font-label text-[10px] tracking-[0.2em] mb-4 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 dark:bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 dark:bg-emerald-400"></span>
                </span>
                Official Community Channels
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                Never Miss an Opportunity. <br className="hidden sm:inline" />
                <span className="font-accent text-blue-600 dark:text-sky-400">
                  Stay Connected in Real-Time.
                </span>
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
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
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-emerald-500/40 dark:border-emerald-500/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-500/60 dark:hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                      <WhatsAppIcon className="w-6 h-6 fill-current" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live Alerts
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-sky-300 transition-colors">
                    WhatsApp Channel
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                    Receive instant broadcast alerts for high-priority internship openings, hiring announcements, deadlines, and official platform news directly on WhatsApp.
                  </p>
                </div>
                <a
                  href={SITE_CONFIG.social.whatsappChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join ZYR0 WhatsApp Channel for instant updates"
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 text-white py-3.5 px-6 rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 group/btn"
                >
                  <WhatsAppIcon className="w-4.5 h-4.5 fill-current" />
                  Join WhatsApp Channel
                  <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
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
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-blue-500/40 dark:border-blue-500/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-blue-500/60 dark:hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                      <LinkedInIcon className="w-6 h-6 fill-current" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30">
                      <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse" />
                      Official Page
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-sky-300 transition-colors">
                    LinkedIn Network
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                    Follow our official LinkedIn page for professional networking, employer spotlights, student success stories, and corporate announcements.
                  </p>
                </div>
                <a
                  href={SITE_CONFIG.social.linkedinCompany}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow ZYR0 on LinkedIn"
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 px-6 rounded-xl font-semibold text-sm hover:bg-blue-500 transition-all duration-200 shadow-lg shadow-blue-600/25 active:scale-95 group/btn"
                >
                  <LinkedInIcon className="w-4.5 h-4.5 fill-current" />
                  Follow on LinkedIn
                  <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
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
                <span className="font-label text-[11px] tracking-[0.22em] text-blue-600 dark:text-sky-400">Our Purpose</span>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Every career starts <span className="font-accent text-blue-600 dark:text-sky-400">somewhere.</span>
                </h2>
                <p className="text-slate-600 dark:text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                  Every industry leader was once a beginner, and every meaningful journey begins with a first opportunity. At ZYR0, we believe student internships are more than temporary roles—they are the foundation for long-term career growth.
                </p>
                <p className="text-slate-600 dark:text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                  Students across Pakistan often face a fragmented internship landscape: unstructured applications, no standardized feedback, and credentials that employers struggle to verify. ZYR0 replaces this uncertainty with a cohesive platform that connects students, companies, and mentors in one ecosystem. We bring structure, mentorship, and clear milestones to every internship while helping universities bridge academic learning with industry demands.
                </p>
                <p className="text-slate-600 dark:text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
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
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-emerald-500/10"
                  >
                    <div className={`w-10 h-10 ${role.color} rounded-xl flex items-center justify-center`}>
                      <role.icon className="w-5 h-5" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">{role.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{role.desc}</p>
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
              <span className="font-label text-[11px] tracking-[0.22em] text-blue-600 dark:text-sky-400">Capabilities</span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white text-balance">Built for accountability and <span className="font-accent text-blue-600 dark:text-sky-400">clear outcomes</span></h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
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
                  className="feature-card"
                  role="article"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{feature.desc}</p>
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
              <span className="font-label text-[11px] tracking-[0.22em] text-blue-600 dark:text-sky-400">System Credibility</span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                Built on transparency. <span className="font-accent text-blue-600 dark:text-sky-400">Designed for confidence.</span>
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
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
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-emerald-500/10"
                >
                  <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold text-slate-900 dark:text-white">{card.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{card.desc}</p>
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
              <span className="font-label text-[11px] uppercase tracking-[0.22em] text-sky-400">Reviews</span>
              <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-slate-900 dark:text-white">
                Verified experiences from{' '}
                <span className="font-accent text-blue-600 dark:text-sky-400">
                  our community
                </span>
              </h2>
              <p className="mt-4 text-slate-500 dark:text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
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
                        className="w-full h-full min-h-[820px] md:min-h-[460px]"
                        contentClassName="grid md:grid-cols-[5fr_7fr] w-full h-full"
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
                          <span className={`inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] border ${label.className}`}>
                            {label.label}
                          </span>

                          <div>
                            <Quote className="w-10 h-10 text-blue-500/20 dark:text-sky-400/20 mb-3" />
                            <p className="text-lg md:text-xl lg:text-2xl leading-[1.55] font-normal text-slate-800 dark:text-slate-100 tracking-[-0.01em]">
                              {t.quote}
                            </p>
                          </div>

                          <div className="pt-5 border-t border-slate-200/80 dark:border-white/10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white ring-2 ring-slate-200 dark:ring-white/10 shrink-0 overflow-hidden flex items-center justify-center p-1.5">
                              <img src="/zyro-logo.webp" alt="ZYR0 logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-base font-bold text-slate-900 dark:text-white">{t.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t.role}</p>
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
                    <BlobCard accent={accent} className="w-full h-full min-h-[560px]" contentClassName="!items-start !justify-start w-full h-full">
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
                        <div className="relative h-60 w-full shrink-0 overflow-hidden flex items-center justify-center" style={{ background: `${accent}1a` }}>
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${accent}, #6366f1)` }}>
                            <Users className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-5 pb-3 flex flex-col flex-1 w-full">
                        <div className="flex-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] border ${label.className}`}>
                            {label.label}
                          </span>
                          <Quote className="mt-3 w-6 h-6 text-blue-500/20 dark:text-sky-400/20" />
                          <p className="mt-2 text-sm leading-relaxed font-normal text-slate-600 dark:text-slate-300">{t.quote}</p>
                        </div>
                        <div className="mt-5 pt-5 border-t border-slate-200/80 dark:border-white/10 flex items-center gap-3.5 px-1">
                          <div className="w-11 h-11 rounded-full ring-2 ring-slate-200 dark:ring-white/15 shrink-0 overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                            {t.image ? (
                              <img
                                src={t.image}
                                alt={t.name}
                                width="44"
                                height="44"
                                className="w-full h-full object-cover object-[center_15%]"
                              />
                            ) : (
                              <span className="text-xs text-white font-bold select-none">{testimonialInitials(t.name)}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-[15px] font-bold leading-tight text-slate-900 dark:text-white">{t.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{t.role}</p>
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
        <section className="py-14 lg:py-20 px-4 bg-transparent content-visibility-auto">
          <div className="max-w-5xl mx-auto">
            <MotionDiv
              isMobile={isMobile}
              {...viewProps(
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1 },
                { duration: 0.6 }
              )}
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-10 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-blue-600/20 text-white"
            >
              {/* Ambient Lighting Orbs */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sky-400/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-violet-400/25 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30">
                  Get Started Today
                </span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-slate-900 dark:text-white max-w-2xl mx-auto">
                  Ready to transform <span className="font-accent text-sky-100">how internships work?</span>
                </h2>
                <p className="text-white/90 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                  Join thousands of students, companies, mentors, and universities building Pakistan's structured internship ecosystem.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Create Free Account
                  </Link>
                  <Link
                    to="/internships"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold bg-slate-900/40 hover:bg-slate-900/60 text-white border border-white/30 backdrop-blur-sm transition-all"
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
