import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Bell, Mail } from 'lucide-react';
import { SEO } from '@/components/SEO';

const sections = [
  {
    icon: Database,
    title: 'Information We Collect',
    content: [
      'Account information you provide during registration, including your full name, email address, and role (student, company, or mentor).',
      'Profile information such as your profile photo, biography, institution or company name, skills, and contact details that you choose to add.',
      'Internship activity data including applications submitted, tasks completed, GitHub repository links submitted, mentor feedback received, and certificates earned.',
      'Usage data including pages visited, features used, device type, browser type, and general geographic location derived from your IP address.',
      'Communication data when you contact our support team or send messages through the platform.',
    ],
  },
  {
    icon: Lock,
    title: 'How We Use Your Information',
    content: [
      'To create and manage your account and provide access to role-appropriate features.',
      'To facilitate internship workflows including applications, offer letters, task assignments, mentor reviews, and certificate generation.',
      'To communicate platform updates, internship status changes, and account-related notifications.',
      'To improve platform functionality based on aggregated usage patterns.',
      'To verify certificates and maintain the integrity of the credentialing system.',
      'To comply with applicable legal obligations.',
    ],
  },
  {
    icon: Eye,
    title: 'Information Sharing',
    content: [
      'We do not sell your personal information to third parties.',
      'Company profiles, internship listings, and publicly posted opportunities are visible to all platform users.',
      'Student application information is shared only with the company to which the application is submitted.',
      'Issued certificates include the student\'s name, the internship title, the issuing company, and a verification code visible via the public verification page.',
      'We use Supabase as our backend provider, which processes data on our behalf under appropriate data processing agreements.',
      'We may disclose your information if required by law or to protect the rights and safety of users.',
    ],
  },
  {
    icon: Shield,
    title: 'Data Security',
    content: [
      'All data is transmitted over HTTPS using industry-standard TLS encryption.',
      'Authentication is handled by Supabase Auth with support for OAuth providers (Google, LinkedIn).',
      'Database access is restricted using Row Level Security (RLS) policies ensuring users only access data they are authorized to view.',
      'We perform regular security reviews and follow responsible disclosure practices.',
      'Despite our precautions, no method of transmission over the internet is 100% secure. We encourage you to use strong passwords and enable two-factor authentication when available.',
    ],
  },
  {
    icon: Bell,
    title: 'Your Rights',
    content: [
      'You may access and update your profile information at any time from your account settings.',
      'You may request deletion of your account by contacting us at privacy@zyroo.dpdns.org. We will process requests within 30 days.',
      'You may opt out of non-essential email communications by following the unsubscribe link in any marketing email.',
      'If you are located in the European Economic Area, you have rights under the GDPR including the right to access, rectify, erase, restrict processing, and data portability.',
      'To exercise any of these rights, contact us at privacy@zyroo.dpdns.org.',
    ],
  },
  {
    icon: Mail,
    title: 'Contact & Updates',
    content: [
      'This Privacy Policy was last updated in July 2026.',
      'We may update this policy periodically to reflect changes in our practices or applicable law. We will notify you of significant changes via email or a prominent notice on the platform.',
      'For privacy-related questions or concerns, contact our Privacy team at privacy@zyroo.dpdns.org.',
      'For general inquiries, visit our Contact page or email support@zyroo.dpdns.org.',
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="pt-20 pb-16">
      <SEO
        title="Privacy Policy — How ZYR0 Handles Your Data"
        description="Read ZYR0's Privacy Policy to understand how we collect, use, and protect your personal information. We are committed to transparency and data security for all platform users."
        path="/privacy"
        keywords="ZYR0 privacy policy, data privacy, GDPR, personal data, user privacy, internship platform privacy"
      />
      {/* Hero */}
      <section className="px-4 py-16 bg-gradient-to-b from-primary to-primary/90 dark:from-slate-950 dark:to-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Shield className="w-12 h-12 mx-auto mb-4 text-white/70" />
            <h1 className="text-4xl sm:text-5xl font-bold">Privacy Policy</h1>
            <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              Your privacy matters to us. This policy explains what information we collect, how we use it, and the choices you have.
            </p>
            <p className="mt-3 text-sm text-white/50">Last updated: July 2026</p>
          </motion.div>
        </div>
      </section>

      {/* Sections */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-10">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-8 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-bold">{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent/60 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
