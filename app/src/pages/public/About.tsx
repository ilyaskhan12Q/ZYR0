import { motion } from 'framer-motion';
import { Target, Eye, Shield, Zap, Users, Award, Globe, Heart } from 'lucide-react';

const values = [
  { icon: Shield, title: 'Trust', desc: 'We verify every certificate and validate every experience to maintain platform integrity.' },
  { icon: Zap, title: 'Innovation', desc: 'We continuously improve our platform with cutting-edge technology and user feedback.' },
  { icon: Users, title: 'Community', desc: 'We foster meaningful connections between students, mentors, and companies.' },
  { icon: Award, title: 'Excellence', desc: 'We set high standards for internship quality and professional development.' },
];

const milestones = [
  { year: '2023', title: 'Founded', desc: 'Zyro was founded with a mission to transform internship experiences.' },
  { year: '2024', title: 'Platform Launch', desc: 'Launched the first version with student, company, and mentor portals.' },
  { year: '2024', title: '10,000 Users', desc: 'Reached 10,000 active users across 50+ universities.' },
  { year: '2025', title: 'Certificate System', desc: 'Introduced blockchain-verified digital certificates.' },
];

export default function About() {
  return (
    <div className="pt-20 pb-16">
      {/* Hero */}
      <section className="px-4 py-16 bg-gradient-to-b from-primary to-primary/90 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl sm:text-5xl font-bold">About Zyro</h1>
            <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              Zyro is a modern internship management platform that connects students, companies, mentors, and educational institutions in a single ecosystem. We believe every student deserves a meaningful internship experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To bridge the gap between education and industry by providing a structured, technology-driven platform for internship management that ensures real learning, measurable progress, and trusted certification.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become the world&apos;s most trusted career ecosystem, supporting millions of students in launching successful careers through quality internships, mentorship, and verified credentials.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
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

      {/* CTA */}
      <section className="px-4 py-16 bg-muted/50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Heart className="w-10 h-10 text-accent mx-auto mb-4" />
            <h2 className="text-3xl font-bold">Join the Zyro Community</h2>
            <p className="mt-4 text-muted-foreground">Whether you are a student, company, mentor, or university — there is a place for you in our ecosystem.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
