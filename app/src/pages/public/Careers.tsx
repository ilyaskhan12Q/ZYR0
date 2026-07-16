import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, ChevronRight, Rocket } from 'lucide-react';
import { SEO } from '@/components/SEO';

const openRoles: { title: string; team: string; location: string; type: string }[] = [];

const futureAreas = [
  { title: 'Engineering', desc: 'Full-stack, backend, and platform infrastructure roles.' },
  { title: 'Product & Design', desc: 'Product management and UX design opportunities.' },
  { title: 'Operations', desc: 'Business development, partnerships, and support.' },
  { title: 'Growth', desc: 'Marketing, community, and content roles.' },
];

export default function Careers() {
  return (
    <div className="pt-20 pb-16">
      <SEO
        title="Careers at ZYR0 — Join Our Team"
        description="ZYR0 is growing and will be hiring across engineering, product, design, and operations. Express your interest early and help us build the platform connecting students to real career opportunities."
        path="/careers"
        keywords="ZYR0 careers, work at ZYR0, internship platform jobs, tech startup jobs, EdTech careers"
      />
      {/* Hero */}
      <section className="px-4 py-16 bg-gradient-to-b from-primary to-primary/90 dark:from-slate-950 dark:to-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-white/70" />
            <h1 className="text-4xl sm:text-5xl font-bold">Careers at ZYR0</h1>
            <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              Help us build the platform that gives every student a fair shot at meaningful industry experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Coming Soon Banner */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-10 shadow-sm text-center"
          >
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Rocket className="w-8 h-8 text-accent" />
            </div>
            <span className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 rounded-full mb-4 inline-block">
              Coming Soon
            </span>
            <h2 className="text-2xl font-bold mt-3 mb-3">We&apos;re growing — stay tuned</h2>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
              ZYR0 is in active development and we are building towards our next phase. We don&apos;t have open positions to post yet, but we will be hiring across engineering, product, and operations as the platform scales.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3 max-w-xl mx-auto">
              If you are passionate about bridging the gap between education and industry, we&apos;d love to hear from you early.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                Express Interest <ChevronRight className="w-4 h-4" />
              </Link>
              <a
                href="https://github.com/ilyaskhan12Q/ZYR0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-border px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Future Areas */}
      <section className="px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <h2 className="text-2xl font-bold">Areas We&apos;re Building</h2>
            <p className="mt-2 text-muted-foreground">Future opportunities will span these teams.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {futureAreas.map((area, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-5 shadow-sm"
              >
                <h3 className="font-semibold">{area.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{area.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles placeholder */}
      {openRoles.length > 0 && (
        <section className="px-4 pb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
            <div className="space-y-3">
              {openRoles.map((role, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-xl border border-border p-5 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold">{role.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{role.team}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{role.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{role.type}</span>
                    </div>
                  </div>
                  <Link to="/contact" className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">
                    Apply <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
