import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Eye, Shield, Zap, Users, Award, Globe, Heart, Lightbulb, MapPin, GraduationCap, Building2, ArrowRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { BASE_URL } from '@/config/seo';

const aboutStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'About', item: `${BASE_URL}/about` },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ZYR0',
    url: `${BASE_URL}/`,
    description: 'ZYR0 is a structured internship management platform connecting students, companies, and mentors for verifiable professional experiences.',
    foundingDate: '2023',
    founders: [{ '@type': 'Person', name: '[Awaiting verified content]' }],
    slogan: 'Structured internships. Verified careers.',
  },
];

const values = [
  { icon: Shield, title: 'Trust', desc: 'We verify every certificate and validate every experience to maintain platform integrity for students, employers, and institutions.' },
  { icon: Zap, title: 'Innovation', desc: 'We continuously improve our platform with modern technology and direct feedback from the community we serve.' },
  { icon: Users, title: 'Community', desc: 'We foster meaningful connections between students, mentors, and companies to create lasting professional relationships.' },
  { icon: Award, title: 'Excellence', desc: 'We set high standards for internship quality, mentor engagement, and professional development outcomes.' },
  { icon: Lightbulb, title: 'Transparency', desc: 'We believe every stage of an internship — from applications to certificates — should be visible and auditable by all parties.' },
  { icon: Globe, title: 'Accessibility', desc: 'We are committed to making quality internship opportunities accessible to students across Pakistan regardless of their university or location.' },
];

const milestones = [
  { year: '2023', title: 'Founded', desc: 'ZYR0 was founded to address the lack of structured, verifiable internship experiences available to students in Pakistan.' },
  { year: '2024', title: 'Platform Launch', desc: 'Launched the first version of the platform with dedicated student, company, and mentor portals.' },
  { year: '2024', title: '10,000 Users', desc: 'Reached 10,000 active users across partner universities and companies in Pakistan.' },
  { year: '2025', title: 'Certificate System', desc: 'Introduced a secure digital certificate system with unique credential IDs for instant verification.' },
  { year: '2026', title: 'Structured Workflows', desc: 'Expanded milestone tracking, mentor feedback loops, and cohort management features for enterprise partners.' },
];

export default function About() {
  return (
    <div className="pt-20 pb-16">
      <SEO
        title="About ZYR0 — Mission, Vision & Philosophy"
        description="Learn about ZYR0's mission to bridge the gap between education and industry in Pakistan. Discover our structured internship platform connecting students, companies, and mentors with verified digital certificates."
        path="/about"
        keywords="about ZYR0, internship platform Pakistan, career ecosystem, digital certificates, student mentorship, internship management, Pakistan internship problem"
        structuredData={aboutStructuredData}
      />
      {/* Hero */}
      <section className="px-4 py-16 bg-gradient-to-b from-primary to-primary/90 dark:from-slate-950 dark:to-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl sm:text-5xl font-bold">About ZYR0</h1>
            <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              ZYR0 is a modern internship management platform that connects students, companies, mentors, and educational institutions in a single ecosystem. We believe every student deserves a meaningful, structured internship experience that translates into real career growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Problem We Address */}
      <section className="px-4 py-16 bg-muted/30 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">The Challenge</span>
            <h2 className="text-3xl font-bold mt-3">Why internship infrastructure matters</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div role="article" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-card rounded-xl border border-border p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold mb-2">Limited Access</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Quality internship opportunities in Pakistan are concentrated in major cities and a handful of universities. Students outside these networks lack visibility into available positions and struggle to find structured programs that build real skills.
              </p>
            </motion.div>
            <motion.div role="article" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-card rounded-xl border border-border p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-bold mb-2">Unverifiable Credentials</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Traditional internship certificates are easy to forge and difficult for employers to validate. Students who complete genuine programs struggle to prove their experience, undermining the value of their hard work.
              </p>
            </motion.div>
            <motion.div role="article" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border border-border p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="font-bold mb-2">Fragmented Processes</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Companies manage internships through ad-hoc email chains, shared spreadsheets, and manual tracking. This creates inconsistent experiences for interns and administrative overhead for employers that discourages them from offering structured programs.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">Our Purpose</span>
            <h2 className="text-3xl font-bold mt-3">What drives us</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To bridge the gap between education and industry by providing a structured, technology-driven platform for internship management that ensures real learning, measurable progress, and trusted certification for every participant.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We are building the infrastructure that makes internships reliable — where students receive consistent mentorship and clear goals, companies can scale their talent pipelines, and every completed program produces a credential that employers can verify instantly.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become Pakistan&apos;s most trusted career ecosystem, supporting students from every university and background in launching successful professional careers through quality internships, mentorship, and verified credentials that open doors.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We envision a future where geographic location and institutional affiliation no longer determine a student&apos;s access to meaningful professional experience — where any motivated student can find, complete, and prove a high-quality internship on a level playing field.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 py-16 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold">Our Values</h2>
            <p className="mt-3 text-muted-foreground">The principles that guide everything we do</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} role="article" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Philosophy */}
      <section className="px-4 py-16 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">Our Philosophy</span>
            <h2 className="text-3xl font-bold mt-3">How we approach internships</h2>
          </motion.div>
          <div className="space-y-6">
            <motion.div role="article" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-3">Structure creates accountability</h3>
              <p className="text-muted-foreground leading-relaxed">
                We believe that unstructured internships benefit neither the student nor the organization. Without clear milestones, defined deliverables, and regular feedback cycles, interns often leave without meaningful skills and companies cannot measure the impact of their programs. ZYR0 provides the framework that makes every internship productive for both sides.
              </p>
            </motion.div>
            <motion.div role="article" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-3">Credentials must be trustworthy</h3>
              <p className="text-muted-foreground leading-relaxed">
                An internship certificate is only valuable if employers trust it. Our verification system attaches a unique credential ID to every completed program, allowing anyone — from HR teams to hiring managers — to confirm authenticity in seconds. This protects the integrity of every student&apos;s hard work and gives companies confidence when evaluating candidates.
              </p>
            </motion.div>
            <motion.div role="article" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-3">Mentorship scales with the right tools</h3>
              <p className="text-muted-foreground leading-relaxed">
                Effective mentorship requires more than occasional check-ins. Our platform gives mentors structured access to intern submissions, progress data, and feedback history — enabling them to provide targeted guidance across multiple mentees without losing context. This makes quality mentorship viable even for busy industry professionals.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold">Our Journey</h2>
            <p className="mt-3 text-muted-foreground">Key milestones in our growth</p>
          </motion.div>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-px" />
            {milestones.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className={`relative flex items-start gap-6 mb-10 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className="bg-card rounded-xl border border-border p-5 shadow-sm ml-10 md:ml-0">
                    <span className="text-accent font-bold">{m.year}</span>
                    <h4 className="font-semibold mt-1">{m.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
                  </div>
                </div>
                <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-accent rounded-full border-4 border-background -translate-x-1.5 mt-5" />
                <div className="hidden md:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Founder — placeholder until verified */}
      <section className="px-4 py-16 bg-muted/30 border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-border">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <span className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 rounded-full mb-4 inline-block">
              Awaiting Verified Content
            </span>
            <h2 className="text-3xl font-bold">Our Team</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Founder and team profiles are being prepared for this section. We believe in transparency about who is building ZYR0 and will share verified information here as soon as it is available.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 bg-muted/50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Heart className="w-10 h-10 text-accent mx-auto mb-4" />
            <h2 className="text-3xl font-bold">Join the ZYR0 Community</h2>
            <p className="mt-4 text-muted-foreground">Whether you are a student, company, mentor, or university — there is a place for you in our ecosystem.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/internships" className="inline-flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
                Browse Internships <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/companies" className="inline-flex items-center gap-2 border border-border px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                View Partner Companies
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 border border-border px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
