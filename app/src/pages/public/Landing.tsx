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
];

const features = [
  { icon: Search, title: 'Discover Opportunities', desc: 'Browse curated internships from top companies and startups. Filter by domain, location, duration, and skills.', color: 'bg-blue-100 text-blue-600' },
  { icon: FileCheck, title: 'Smart Applications', desc: 'Apply with your enriched profile. Track application status in real-time from submission to acceptance.', color: 'bg-emerald-100 text-emerald-600' },
  { icon: ClipboardList, title: 'Task Management', desc: 'Receive, complete, and submit tasks with clear deadlines. Stay organized with progress tracking.', color: 'bg-purple-100 text-purple-600' },
  { icon: Users, title: 'Mentor Guidance', desc: 'Get paired with experienced mentors who review your work and provide actionable feedback.', color: 'bg-orange-100 text-orange-600' },
  { icon: Award, title: 'Verified Certificates', desc: 'Earn blockchain-verified digital certificates. Share on LinkedIn or verify with a QR code scan.', color: 'bg-yellow-100 text-yellow-600' },
  { icon: Briefcase, title: 'Professional Portfolio', desc: 'Build a career portfolio with verified experience, skills, and certificates that employers trust.', color: 'bg-teal-100 text-teal-600' },
];

const steps = [
  { num: '01', icon: UserPlus, title: 'Create Your Profile', desc: 'Sign up, add your skills, education, and career interests.' },
  { num: '02', icon: Send, title: 'Apply to Internships', desc: 'Browse and apply to opportunities that match your goals.' },
  { num: '03', icon: BookOpen, title: 'Learn & Grow', desc: 'Complete tasks, get mentor feedback, and track your progress.' },
  { num: '04', icon: Award, title: 'Get Certified', desc: 'Receive a verified digital certificate upon successful completion.' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Computer Science Student, Stanford', quote: 'Zyro helped me land my dream internship at a tech startup. The task tracking and mentor feedback were game-changers.', avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { name: 'Michael Rodriguez', role: 'Senior Engineer & Mentor, TechFlow', quote: 'As a mentor, Zyro makes it easy to manage multiple interns and provide structured feedback. Highly recommended.', avatar: 'https://i.pravatar.cc/150?u=michael' },
  { name: 'TechFlow Inc.', role: 'Hiring Partner', quote: 'We\'ve hired 15 interns through Zyro. The quality of candidates and the streamlined process saved us countless hours.', avatar: 'https://ui-avatars.com/api/?name=TechFlow&background=3B82F6&color=fff' },
];

const stats = [
  { value: '10,000+', label: 'Active Students', icon: GraduationCap },
  { value: '500+', label: 'Partner Companies', icon: Building2 },
  { value: '50+', label: 'Universities', icon: Globe },
  { value: '25,000+', label: 'Certificates Issued', icon: Award },
];

const checkFeatures = [
  'Post unlimited internships with rich details',
  'Review and shortlist applicants efficiently',
  'Assign tasks and track intern progress',
  'Issue blockchain-verified certificates',
  'Access analytics and performance insights',
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
        title="Zyro — Internship Management Platform for Students & Companies"
        description="Zyro connects students with real internship opportunities, experienced mentors, and blockchain-verified digital certificates. Discover, apply, complete, and get certified — all in one platform."
        path="/"
        keywords="internship platform, student internship, digital certificate, mentor, career portal, verified internship, internship management"
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
            Trusted by 500+ Companies &amp; Universities
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight text-balance"
          >
            Launch Your Career
            <br />
            <span className="text-accent">with Confidence</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-4 sm:mt-6 text-base sm:text-lg text-white/70 max-w-2xl mx-auto text-balance"
          >
            Zyro connects students with real internship opportunities, mentors, and verifiable certificates — all in one powerful platform.
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
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/internships"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-medium hover:bg-white/20 transition-all duration-200"
            >
              Browse Internships
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.0 }}
            className="mt-10 sm:mt-16 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-white/50 text-xs sm:text-sm"
          >
            {[
              { icon: Building2, text: '500+ Companies' },
              { icon: Users, text: '10,000+ Students' },
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

      {/* Features Grid */}
      <section className="py-14 lg:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">Why Choose Zyro</span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-balance">Everything You Need for Career Growth</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              From discovering opportunities to earning verified certificates, Zyro streamlines your entire internship journey.
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
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">How It Works</span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-balance">Your Internship Journey in 4 Steps</h2>
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
              <span className="text-accent text-sm font-semibold uppercase tracking-wider">For Companies</span>
              <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Hire Top Talent, Simplified</h2>
              <p className="mt-4 text-muted-foreground">
                Post internships, manage applicants, assign tasks, and issue verified certificates — all from one dashboard.
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
                Start Hiring Today
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
                      <p className="text-sm text-muted-foreground">Active Interns</p>
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
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-card/90 backdrop-blur rounded-xl p-4 shadow-lg flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Applications up 32%</p>
                    <p className="text-xs text-muted-foreground">Compared to last month</p>
                  </div>
                </div>
              </div>
            </motion.div>
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
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">Testimonials</span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">What Our Users Say</h2>
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-balance">Ready to Start Your Career Journey?</h2>
              <p className="mt-4 text-white/80 max-w-xl mx-auto">
                Join thousands of students and companies already using Zyro.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-white text-accent px-8 py-3.5 rounded-lg font-medium hover:bg-white/90 transition-all shadow-lg"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 bg-transparent text-white border border-white/30 px-8 py-3.5 rounded-lg font-medium hover:bg-white/10 transition-all"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
