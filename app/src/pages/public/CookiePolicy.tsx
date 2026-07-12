import { motion } from 'framer-motion';
import { Cookie, Settings, BarChart2, Shield, ToggleRight, Mail } from 'lucide-react';

const cookieTypes = [
  {
    icon: Shield,
    title: 'Strictly Necessary Cookies',
    badge: 'Always Active',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
    desc: 'These cookies are essential for the platform to function correctly. They enable core features like authentication, session management, and security. Without them, the Service cannot be provided.',
    examples: ['Authentication session token', 'CSRF protection token', 'Theme preference (light/dark mode)', 'Cookie consent state'],
  },
  {
    icon: BarChart2,
    title: 'Analytics Cookies',
    badge: 'Optional',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    desc: 'We use analytics data to understand how users interact with the platform so we can improve features and usability. This data is aggregated and does not personally identify you.',
    examples: ['Pages visited and time spent', 'Feature usage frequency', 'Error and crash reporting', 'Device and browser type'],
  },
  {
    icon: Settings,
    title: 'Preference Cookies',
    badge: 'Optional',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    desc: 'These cookies remember your preferences and settings to provide a more personalized experience each time you return to the platform.',
    examples: ['Language and locale settings', 'Dashboard layout preferences', 'Notification preferences', 'Last visited section'],
  },
];

export default function CookiePolicy() {
  return (
    <div className="pt-20 pb-16">
      {/* Hero */}
      <section className="px-4 py-16 bg-gradient-to-b from-primary to-primary/90 dark:from-slate-950 dark:to-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Cookie className="w-12 h-12 mx-auto mb-4 text-white/70" />
            <h1 className="text-4xl sm:text-5xl font-bold">Cookie Policy</h1>
            <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              This policy explains how Zyro uses cookies and similar technologies to provide, improve, and protect our platform.
            </p>
            <p className="mt-3 text-sm text-white/50">Last updated: July 2025</p>
          </motion.div>
        </div>
      </section>

      {/* What are cookies */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-xl border border-border p-8 shadow-sm mb-10"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-bold">What Are Cookies?</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently, to remember your preferences, and to provide information to site operators. Zyro uses cookies to keep you logged in, remember your settings, and understand how the platform is used.
            </p>
          </motion.div>

          {/* Cookie Types */}
          <div className="space-y-6">
            {cookieTypes.map((type, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-8 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <type.icon className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-lg font-bold">{type.title}</h2>
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${type.badgeColor}`}>
                    {type.badge}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{type.desc}</p>
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Examples</p>
                  <ul className="space-y-1">
                    {type.examples.map((ex, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent/60 flex-shrink-0" />
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-xl border border-border p-8 shadow-sm mt-10"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <ToggleRight className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-bold">Managing Cookies</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              You can control and manage cookies through your browser settings. Most browsers allow you to view, delete, or block cookies from specific websites.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Please note that blocking strictly necessary cookies will impair the platform&apos;s functionality. You will not be able to log in or use role-specific features without them.
            </p>
            <div className="flex items-start gap-3 mt-4 p-4 bg-muted/50 rounded-lg">
              <Mail className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                For questions about our cookie usage, contact us at <span className="text-accent">privacy@zyro.com</span>.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
