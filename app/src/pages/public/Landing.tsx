import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import {
  Search, FileCheck, ClipboardList, Users, Award, Briefcase,
  UserPlus, Send, BookOpen, CheckCircle2, Building2, GraduationCap,
  ArrowRight, Star, Quote, TrendingUp, Globe, Zap, Target
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { BASE_URL } from '@/config/seo';
import { CanvasParticles } from '@/components/CanvasParticles';

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
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width) * 100;
    const y = ((clientY - top) / height) * 100;
    currentTarget.style.setProperty('--mouse-x', `${x}%`);
    currentTarget.style.setProperty('--mouse-y', `${y}%`);
  };

  // Helper to dynamically adjust animation props based on screen size/prefers-reduced-motion
  const animProps = (initialVal: any, animateVal: any, transitionVal: any) => {
    return prefersReducedMotion
      ? { initial: false }
      : {
          initial: initialVal,
          animate: animateVal,
          transition: transitionVal,
        };
  };

  const viewProps = (initialVal: any, whileInViewVal: any, transitionVal: any = undefined) => {
    return prefersReducedMotion
      ? { initial: false }
      : {
          initial: initialVal,
          whileInView: whileInViewVal,
          viewport: { once: true, margin: "-30px" },
          transition: transitionVal,
        };
  };

  return (
    <div>
      <SEO
        title="ZYR0 — Structured Internship Platform for Students & Employers"
        description="ZYR0 is a professional internship platform connecting students, companies, and mentors. Track student internships, verify completion certificates, and coordinate mentor feedback on a structured platform."
        path="/"
        keywords="internship platform, internship management, student internships, internships in Pakistan, internship tracking, internship certificates, mentor feedback, internship workflow, companies hiring interns"
        structuredData={homepageStructuredData}
      />

      {/* Hero Section — redesigned with oversized typography, glowing grids, and a floating workspace preview */}
      <section
        aria-label="Platform introduction"
        onPointerMove={handlePointerMove}
        className="relative flex items-center justify-center overflow-hidden hero-gradient hero-full-height py-12 lg:py-16"
        style={{
          '--mouse-x': '50%',
          '--mouse-y': '50%'
        } as React.CSSProperties}
      >
        {/* Animated Particles - high performance Canvas based rendering */}
        <CanvasParticles />

        {/* Ambient Blur Lights */}
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[35vw] h-[35vw] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Mouse-reactive lighting effect */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen transition-all duration-300"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99,102,241,0.15), transparent 80%)`,
          }}
        />

        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-8 lg:mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Typography, Actions, Trust */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6 lg:space-y-8 text-left">
              
              {/* Trust Badges / Social Proof */}
              <div className="flex flex-wrap gap-2">
                {[
                  'Structured Internship Workflow',
                  'Mentor Guided Learning',
                  'Verified Certificates',
                  'Professional Experience Tracking'
                ].map((badge, idx) => (
                  <MotionSpan
                    isMobile={isMobile}
                    key={idx}
                    {...animProps(
                      { opacity: 0, scale: 0.95 },
                      { opacity: 1, scale: 1 },
                      { duration: 0.4, delay: 0.1 * idx }
                    )}
                    className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-white/85 hover:bg-white/10 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                    {badge}
                  </MotionSpan>
                ))}
              </div>

              {/* Title Section with Oversized Typography */}
              <div className="space-y-3">
                <MotionDiv
                  isMobile={isMobile}
                  {...animProps(
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0 },
                    { duration: 0.5, delay: 0.3 }
                  )}
                  className="text-white/60 text-xs sm:text-sm font-semibold uppercase tracking-widest block"
                >
                  Pakistan's Platform for
                </MotionDiv>
                <div className="flex flex-col space-y-1">
                  <MotionSpan
                    isMobile={isMobile}
                    {...animProps(
                      { opacity: 0, x: -20 },
                      { opacity: 1, x: 0 },
                      { duration: 0.6, delay: 0.4 }
                    )}
                    className="text-5xl xs:text-6xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter text-white"
                  >
                    Structured
                  </MotionSpan>
                  <MotionSpan
                    isMobile={isMobile}
                    {...animProps(
                      { opacity: 0, x: 20 },
                      { opacity: 1, x: 0 },
                      { duration: 0.7, delay: 0.5 }
                    )}
                    className="text-6xl xs:text-7xl sm:text-8xl md:text-9xl lg:text-[7rem] font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-400 to-white leading-none block"
                  >
                    Internship.
                  </MotionSpan>
                </div>
                <MotionDiv
                  isMobile={isMobile}
                  {...animProps(
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0 },
                    { duration: 0.5, delay: 0.6 }
                  )}
                  className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight"
                >
                  Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-300">Future</span> Career.
                </MotionDiv>
              </div>

              {/* Supporting Explanation */}
              <MotionP
                isMobile={isMobile}
                {...animProps(
                  { opacity: 0, y: 20 },
                  { opacity: 1, y: 0 },
                  { duration: 0.5, delay: 0.7 }
                )}
                className="text-base sm:text-lg text-white/70 max-w-xl leading-relaxed"
              >
                ZYR0 bridges the gap between academic learning and professional growth. We provide students with structured milestone tasks, direct mentor feedback, and verified certificates that employers trust. Companies gain a streamlined pipeline to hire, mentor, and evaluate interns with complete visibility into each candidate's progress and performance.
              </MotionP>

              {/* Actions */}
              <MotionDiv
                isMobile={isMobile}
                {...animProps(
                  { opacity: 0, y: 20 },
                  { opacity: 1, y: 0 },
                  { duration: 0.4, delay: 0.8 }
                )}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-3.5 rounded-lg font-medium hover:bg-accent/90 transition-all duration-200 shadow-lg shadow-accent/25 active:scale-95"
                >
                  Start Your Internship
                  <ArrowRight className="w-4.5 h-4.5" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-3.5 rounded-lg font-medium hover:bg-white/20 transition-all duration-200 active:scale-95"
                >
                  For Companies
                </Link>
              </MotionDiv>

              {/* Trust Indicators */}
              <MotionDiv
                isMobile={isMobile}
                {...animProps(
                  { opacity: 0 },
                  { opacity: 1 },
                  { duration: 0.4, delay: 1.0 }
                )}
                className="flex flex-wrap items-center gap-x-6 gap-y-3 text-white/40 text-xs pt-4 border-t border-white/5"
              >
                <span className="uppercase tracking-wider font-semibold text-[10px]">Ecosystem Partners:</span>
                {[
                  { icon: GraduationCap, label: 'Students' },
                  { icon: Building2, label: 'Companies' },
                  { icon: Users, label: 'Mentors' },
                  { icon: Globe, label: 'Universities' }
                ].map((partner, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 hover:text-white/60 transition-colors">
                    <partner.icon className="w-3.5 h-3.5" />
                    <span>{partner.label}</span>
                  </div>
                ))}
              </MotionDiv>

            </div>

            {/* Right Column: Engaging Visual Element */}
            <div className="lg:col-span-5 relative w-full h-[400px] sm:h-[450px] lg:h-[500px] flex items-center justify-center">
              {/* Glowing gradients */}
              <div className="absolute w-72 h-72 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute w-48 h-48 bg-blue-500/10 rounded-full blur-2xl -top-10 -right-10 pointer-events-none" />

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
                  className="absolute top-8 left-4 w-72 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-2xl z-10"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">Workspace Tracker</span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-white/95">
                      <span className="font-medium">Completed Milestones</span>
                      <span className="text-accent font-semibold">4 / 5</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="w-4/5 bg-accent h-full rounded-full" />
                    </div>
                    <div className="space-y-2 pt-1 text-[11px]">
                      <div className="flex items-center gap-2 text-white/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Milestone 3: API Integration</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Milestone 4: Database Design</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/90">
                        <div className="w-3.5 h-3.5 rounded-full border border-accent flex items-center justify-center">
                          <span className="w-1.5 h-1.5 bg-accent rounded-full" />
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
                  className="absolute bottom-12 right-4 w-72 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl z-20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-xs border border-accent/30">
                      SR
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Sarah Jenkins</h4>
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
                  className="absolute top-36 -right-4 w-60 bg-gradient-to-tr from-slate-950 to-slate-900 border border-white/15 rounded-xl p-4 shadow-2xl z-0 text-white"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] uppercase tracking-wider text-accent font-bold">Secure ID</span>
                    <span className="text-[8px] text-white/40">ZYR0-9182-X</span>
                  </div>
                  <div className="mt-4 text-center">
                    <Award className="w-8 h-8 mx-auto text-accent mb-1.5" />
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

      {/* Section 1 — Every Career Starts Somewhere */}
      <section className="py-14 lg:py-20 px-4 bg-muted/30 border-b border-border content-visibility-auto">
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
                  className="bg-card rounded-xl border border-border p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20"
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
      <section className="py-14 lg:py-20 px-4 bg-muted/50 content-visibility-auto">
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
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* Section 2 — Built on Transparency. Designed for Confidence. */}
      <section className="py-14 lg:py-20 px-4 bg-muted/30 border-t border-b border-border/50 content-visibility-auto">
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
                className="bg-card rounded-xl border border-border p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20"
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
      <section className="py-14 lg:py-20 px-4 bg-muted/50 content-visibility-auto">
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
                  className="bg-card rounded-xl border border-border p-6 shadow-md"
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
      <section className="py-12 lg:py-16 px-4 bg-primary dark:bg-slate-950 border-y border-border/10 content-visibility-auto">
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
            className="bg-accent rounded-2xl p-6 sm:p-10 md:p-16 text-center relative overflow-hidden"
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
