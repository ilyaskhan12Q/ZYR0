import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import {
  Search, FileCheck, ClipboardList, Users, Award, Briefcase,
  UserPlus, Send, BookOpen, CheckCircle2, Building2, GraduationCap,
  ArrowRight, Star, Quote, TrendingUp, Globe, Zap, Target, Sparkles
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { BASE_URL } from '@/config/seo';
import { CanvasParticles } from '@/components/CanvasParticles';
import { toast } from 'sonner';
import { SITE_CONFIG } from '@/config/site';
import { WhatsAppIcon, LinkedInIcon } from '@/components/icons/BrandIcons';
import { TextRotate } from '@/components/fancy/text/TextRotate';
import { ParabolicPentagonBg } from '@/components/landing/ParabolicPentagonBg';

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
      'email': 'support@zyr0.com',
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
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Fixed Parabolic Pentagon Background Layer & Gradient Overlay */}
      <ParabolicPentagonBg />

      <SEO
        title="ZYR0 — Structured Internship Platform for Students & Employers"
        description="ZYR0 is a professional internship platform connecting students, companies, and mentors. Track student internships, verify completion certificates, and coordinate mentor feedback on a structured platform."
        path="/"
        keywords="internship platform, internship management, student internships, internships in Pakistan, internship tracking, internship certificates, mentor feedback, internship workflow, companies hiring interns"
        structuredData={homepageStructuredData}
      />

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
                className="inline-flex items-center gap-2.5 self-start bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-full px-4 py-1.5 text-xs text-white/90 shadow-sm hover:border-white/20 transition-all duration-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="font-display font-semibold uppercase tracking-wider text-[11px] text-emerald-300/90">Pakistan's Premier Internship Engine</span>
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
                  className="font-display font-[800] text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[4.85rem] tracking-[-0.035em] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-300/90 leading-[1.06] drop-shadow-sm"
                >
                  Launch Your Career With
                </MotionDiv>
                
                <div className="font-display font-[900] text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[4.85rem] tracking-[-0.035em] leading-[1.06] min-h-[1.3em] flex items-center">
                  <TextRotate
                    texts={[
                      'Internships.',
                      'Real Experience.',
                      'Verified Certificates.',
                      'Industry Projects.',
                      'Dream Companies.',
                      'Career Growth.',
                    ]}
                    mainClassName="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-indigo-300 font-display font-[900] tracking-[-0.035em] drop-shadow-[0_0_35px_rgba(16,185,129,0.3)]"
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
                className="text-base sm:text-lg text-slate-300/80 max-w-xl leading-relaxed font-normal"
              >
                ZYR0 bridges academic learning with real-world industry demands. Complete structured milestone tasks, receive direct 1-on-1 mentor guidance, and earn employer-verified certificates that accelerate your hiring pipeline.
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
                  className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white font-display font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm sm:text-base border border-emerald-400/30"
                >
                  Explore Internships
                  <ArrowRight className="w-4.5 h-4.5" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 backdrop-blur-md px-6 py-3.5 rounded-xl font-display font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm sm:text-base"
                >
                  For Companies
                </Link>
                <a
                  href={SITE_CONFIG.social.whatsappChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-500/[0.08] border border-emerald-500/25 text-emerald-300 px-5 py-3.5 rounded-xl font-medium hover:bg-emerald-500/[0.16] hover:border-emerald-500/40 transition-all duration-200 text-sm hover:scale-[1.02] active:scale-[0.98]"
                  title="Join ZYR0 Official WhatsApp Channel for instant job & internship updates"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <WhatsAppIcon className="w-4 h-4 fill-current text-emerald-400" />
                  <span>WhatsApp Channel</span>
                </a>
              </MotionDiv>

              {/* Trust Indicators & Proof Grid */}
              <MotionDiv
                isMobile={isMobile}
                {...animProps(
                  { opacity: 0 },
                  { opacity: 1 },
                  { duration: 0.4, delay: 0.6 }
                )}
                className="pt-5 border-t border-white/10"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { number: '500+', label: 'Verified Students' },
                    { number: '50+', label: 'Partner Companies' },
                    { number: '100%', label: 'Certificate Validity' },
                    { number: '4.9★', label: 'Mentor Rating' },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.18] backdrop-blur-md rounded-xl p-3 sm:p-3.5 transition-all duration-300 hover:bg-white/[0.06] text-left">
                      <div className="font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-300 text-lg sm:text-xl tracking-tight">{stat.number}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </MotionDiv>
            </div>

            {/* Right Column: Engaging Visual Element */}
            <div className="lg:col-span-5 relative w-full h-[400px] sm:h-[450px] lg:h-[500px] flex items-center justify-center">
              {/* Glowing gradients */}
              <div className="absolute w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute w-56 h-56 bg-indigo-500/15 rounded-full blur-3xl -top-10 -right-10 pointer-events-none" />

              <div className="relative w-full max-w-md h-full">
                {/* Floating Card 1: Workspace Tasks */}
                <MotionDiv
                  isMobile={isMobile}
                  {...animProps(
                    { opacity: 0, y: 40, scale: 0.95 },
                    isMobile ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: [0, -12, 0], scale: 1 },
                    isMobile ? { duration: 0.6, delay: 0.8 } : { 
                      opacity: { duration: 0.6, delay: 0.8 },
                      scale: { duration: 0.6, delay: 0.8 },
                      y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                    }
                  )}
                  className="absolute top-8 left-4 w-72 bg-slate-950/80 backdrop-blur-xl border border-white/15 rounded-xl p-5 shadow-2xl z-10"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-[10px] font-display font-semibold text-emerald-400 uppercase tracking-wider">Workspace Tracker</span>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-white/95">
                      <span className="font-medium">Completed Milestones</span>
                      <span className="text-emerald-400 font-semibold">4 / 5</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="w-4/5 bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full" />
                    </div>
                    <div className="space-y-2 pt-1 text-[11px]">
                      <div className="flex items-center gap-2 text-white/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Milestone 3: API Integration</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Milestone 4: Database Design</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/90">
                        <div className="w-3.5 h-3.5 rounded-full border border-emerald-400 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        </div>
                        <span className="font-medium text-white/90">Milestone 5: Production Deployment</span>
                      </div>
                    </div>
                  </div>
                </MotionDiv>

                {/* Floating Card 2: Mentor Feedback */}
                <MotionDiv
                  isMobile={isMobile}
                  {...animProps(
                    { opacity: 0, y: 40, scale: 0.95 },
                    isMobile ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: [0, 10, 0], scale: 1 },
                    isMobile ? { duration: 0.6, delay: 1.0 } : { 
                      opacity: { duration: 0.6, delay: 1.0 },
                      scale: { duration: 0.6, delay: 1.0 },
                      y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
                    }
                  )}
                  className="absolute bottom-12 right-4 w-72 bg-slate-950/80 backdrop-blur-xl border border-white/15 rounded-xl p-4 shadow-2xl z-20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-display font-semibold text-xs border border-emerald-500/30">
                      SR
                    </div>
                    <div>
                      <h4 className="text-xs font-display font-semibold text-white">Sarah Jenkins</h4>
                      <p className="text-[9px] text-white/50">Senior Engineer & Mentor</p>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-white/80 italic bg-white/5 p-2 rounded-lg border border-white/5">
                    "Excellent database schema. Milestone 4 approved. Let's proceed with security rules validation."
                  </p>
                </MotionDiv>

                {/* Floating Card 3: Certificate Preview */}
                <MotionDiv
                  isMobile={isMobile}
                  {...animProps(
                    { opacity: 0, y: 40, scale: 0.95 },
                    isMobile ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: [0, -8, 0], scale: 1 },
                    isMobile ? { duration: 0.6, delay: 1.2 } : { 
                      opacity: { duration: 0.6, delay: 1.2 },
                      scale: { duration: 0.6, delay: 1.2 },
                      y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.0 }
                    }
                  )}
                  className="absolute top-36 -right-4 w-60 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 border border-white/15 rounded-xl p-4 shadow-2xl z-0 text-white"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] uppercase tracking-wider text-emerald-400 font-display font-bold">Secure ID</span>
                    <span className="text-[8px] text-white/40">ZYR0-9182-X</span>
                  </div>
                  <div className="mt-4 text-center">
                    <Award className="w-8 h-8 mx-auto text-emerald-400 mb-1.5" />
                    <h5 className="text-[10px] font-semibold">Certificate of Excellence</h5>
                    <p className="text-[8px] text-white/50 mt-0.5">Verified Internship Graduate</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[8px] text-white/40">
                    <span>Instantly Verifiable</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                      Secure
                    </span>
                  </div>
                </MotionDiv>
              </div>
            </div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none hidden sm:flex">
          <span className="text-white/30 text-[9px] tracking-[0.2em] uppercase font-medium">Scroll to Explore</span>
          <div className="w-5 h-8 border border-white/20 rounded-full flex justify-center p-1">
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

      {/* Community / Stay Updated Section */}
      <section className="py-14 lg:py-20 px-4 bg-slate-950/40 backdrop-blur-md text-white relative overflow-hidden border-y border-white/10">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Official Community Channels
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Never Miss an Opportunity. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">
                Stay Connected in Real-Time.
              </span>
            </h2>
            <p className="mt-4 text-white/70 text-base sm:text-lg leading-relaxed">
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
              className="bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 group"
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
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                  WhatsApp Channel
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
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
              className="bg-slate-900/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                    <LinkedInIcon className="w-6 h-6 fill-current" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    Official Page
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  LinkedIn Network
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
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
      <section className="py-14 lg:py-20 px-4 bg-background/20 backdrop-blur-xs border-b border-border/20 content-visibility-auto">
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
              <span className="text-accent text-sm font-semibold uppercase tracking-wider">Our Purpose</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
                Every career starts somewhere.
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed font-normal">
                Every industry leader was once a beginner, and every meaningful journey begins with a first opportunity. At ZYR0, we believe student internships are more than temporary roles—they are the foundation for long-term career growth.
              </p>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Students across Pakistan often face a fragmented internship landscape: unstructured applications, no standardized feedback, and credentials that employers struggle to verify. ZYR0 replaces this uncertainty with a cohesive platform that connects students, companies, and mentors in one ecosystem. We bring structure, mentorship, and clear milestones to every internship while helping universities bridge academic learning with industry demands.
              </p>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
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
                  className="bg-card/70 backdrop-blur-md rounded-xl border border-border/60 dark:border-white/10 p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
                >
                  <div className={`w-10 h-10 ${role.color} rounded-xl flex items-center justify-center`}>
                    <role.icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{role.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{role.desc}</p>
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
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">Capabilities</span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-balance">Built for accountability and clear outcomes</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
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
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 lg:py-20 px-4 bg-background/20 backdrop-blur-xs content-visibility-auto">
        <div className="max-w-7xl mx-auto">
          <MotionDiv
            isMobile={isMobile}
            {...viewProps(
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0 }
            )}
            className="text-center mb-14"
          >
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">The Path</span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-balance">How it works</h2>
          </MotionDiv>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 relative">
              {steps.map((step, i) => (
                <MotionDiv
                  isMobile={isMobile}
                  key={i}
                  role="article"
                  {...viewProps(
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0 },
                    { duration: 0.5, delay: i * 0.15 }
                  )}
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
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* For Companies */}
      <section className="py-14 lg:py-20 px-4 content-visibility-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <MotionDiv
              isMobile={isMobile}
              {...viewProps(
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0 },
                { duration: 0.6 }
              )}
            >
              <span className="text-accent text-sm font-semibold uppercase tracking-wider">For Employers</span>
              <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Run your internship programs with confidence</h2>
              <p className="mt-4 text-muted-foreground">
                Manage cohorts of any size from one structured dashboard. Review candidate profiles, structure milestone tasks with clear acceptance criteria, assign industry mentors, track intern progress in real time, and issue verified completion certificates when each intern finishes their program.
              </p>
              <p className="mt-3 text-muted-foreground text-sm">
                ZYR0 replaces spreadsheets and email chains with a unified view of your entire internship pipeline — from posting listings and reviewing applicants to monitoring task completion and generating credentials. Companies retain full control over every stage while providing interns with the structured guidance they need to succeed.
              </p>
              <div className="mt-8 space-y-4">
                {checkFeatures.map((feature, i) => (
                  <MotionDiv
                    isMobile={isMobile}
                    key={i}
                    {...viewProps(
                      { opacity: 0, x: -20 },
                      { opacity: 1, x: 0 },
                      { delay: i * 0.1 }
                    )}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </MotionDiv>
                ))}
              </div>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 mt-8 bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition-all"
              >
                Post an Internship
                <ArrowRight className="w-4 h-4" />
              </Link>
            </MotionDiv>

            <MotionDiv
              isMobile={isMobile}
              {...viewProps(
                { opacity: 0, x: 30 },
                { opacity: 1, x: 0 },
                { duration: 0.6, delay: 0.2 }
              )}
              className="relative"
            >
              <div className="bg-gradient-to-br from-slate-900/80 to-accent/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="bg-card/85 backdrop-blur-md rounded-xl p-6 shadow-lg space-y-4 border border-border/40">
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
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* Section 2 — Built on Transparency. Designed for Confidence. */}
      <section className="py-14 lg:py-20 px-4 bg-background/20 backdrop-blur-xs border-t border-b border-border/20 content-visibility-auto">
        <div className="max-w-7xl mx-auto">
          <MotionDiv
            isMobile={isMobile}
            {...viewProps(
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0 }
            )}
            className="text-center mb-14"
          >
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">System Credibility</span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Built on transparency. Designed for confidence.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
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
                className="bg-card/70 backdrop-blur-md rounded-xl border border-border/60 dark:border-white/10 p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
              >
                <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{card.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-14 lg:py-20 px-4 bg-background/25 backdrop-blur-xs content-visibility-auto">
        <div className="max-w-7xl mx-auto">
          <MotionDiv
            isMobile={isMobile}
            {...viewProps(
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0 }
            )}
            className="text-center mb-14"
          >
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">Reviews</span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Verified experiences from our community</h2>
          </MotionDiv>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <MotionDiv
                  isMobile={isMobile}
                  key={i}
                  role="article"
                  {...viewProps(
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0 },
                    { duration: 0.5, delay: i * 0.1 }
                  )}
                  className="bg-card/70 backdrop-blur-md rounded-xl border border-border/60 dark:border-white/10 p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-accent/30"
                >
                  <Quote className="w-8 h-8 text-accent/20" />
                <p className="mt-3 text-foreground italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <figure className="mt-6 flex items-center gap-3">
                    <img src={t.avatar} alt={`${t.name} avatar`} width="40" height="40" loading="lazy" className="w-10 h-10 rounded-full object-cover" />
                    <figcaption>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </figcaption>
                  </figure>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 lg:py-16 px-4 bg-slate-950/40 backdrop-blur-md border-y border-white/10 content-visibility-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, i) => (
              <MotionDiv
                isMobile={isMobile}
                key={i}
                {...viewProps(
                  { opacity: 0, y: 20 },
                  { opacity: 1, y: 0 },
                  { duration: 0.5, delay: i * 0.1 }
                )}
                className="text-center"
              >
                <p className="text-2xl xs:text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <stat.icon className="w-4 h-4 text-white/50" />
                  <p className="text-sm text-white/60">{stat.label}</p>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-14 lg:py-20 px-4 content-visibility-auto">
        <div className="max-w-5xl mx-auto">
          <MotionDiv
            isMobile={isMobile}
            {...viewProps(
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0 }
            )}
            className="bg-gradient-to-r from-emerald-600/85 via-teal-600/85 to-cyan-600/85 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-10 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-balance">Ready to start your next internship?</h2>
              <p className="mt-4 text-white/80 max-w-xl mx-auto">
                Join thousands of students, mentors, and companies building verified professional experience on ZYR0. Your first opportunity is waiting — take the step that shapes your career.
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
          </MotionDiv>
        </div>
      </section>
    </div>
  );
}
