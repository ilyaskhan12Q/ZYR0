import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Building2, UserCheck, ShieldCheck, ArrowRight, Mail } from 'lucide-react';
import { SEO } from '@/components/SEO';

const guides = [
  {
    icon: GraduationCap,
    title: 'Getting Started as a Student',
    desc: 'Learn how to create your profile, browse internship listings, and submit your first application.',
    steps: [
      'Create your account and select the Student role.',
      'Complete your profile with your skills, education, and a professional bio.',
      'Browse internships and filter by domain, duration, or location type.',
      'Click "Apply Now" on any internship to submit your application.',
      'Track your applications from the Dashboard under My Applications.',
    ],
  },
  {
    icon: Building2,
    title: 'Getting Started as a Company',
    desc: 'Set up your company profile, publish your first internship, and start reviewing applicants.',
    steps: [
      'Register with the Company role and complete your organization profile.',
      'Navigate to Internships in your dashboard and click "Post Internship".',
      'Fill in the internship details including scope, requirements, and duration.',
      'Review incoming applications from the Applicants section.',
      'Accept qualified candidates and manage their progress through the Tasks module.',
    ],
  },
  {
    icon: UserCheck,
    title: 'Getting Started as a Mentor',
    desc: 'Understand your role in reviewing submissions, providing feedback, and approving intern progress.',
    steps: [
      'Register with the Mentor role and complete your professional profile.',
      'You will be assigned to internship cohorts by partner companies.',
      'Review GitHub repository submissions from your mentor dashboard.',
      'Provide structured feedback, request revisions, or approve completed work.',
      'Participate in final evaluations to trigger certificate generation.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Certificate Verification',
    desc: 'Verify the authenticity of any ZYR0-issued certificate using its credential ID.',
    steps: [
      'Navigate to zyroo.dpdns.org/verify.',
      'Enter the credential ID printed on the certificate.',
      'The system will display the certificate holder\'s name, the internship completed, the issuing company, and the date of issuance.',
      'A green verification badge confirms the certificate is authentic and has not been revoked.',
    ],
  },
];

const topics = [
  { label: 'Applications & Offers', href: '/faq#applications' },
  { label: 'Task Submissions', href: '/faq#submissions' },
  { label: 'Certificates', href: '/faq#certificates' },
  { label: 'Account Management', href: '/faq#account' },
  { label: 'Privacy & Security', href: '/privacy' },
  { label: 'Billing & Plans', href: '/contact' },
];

export default function HelpCenter() {
  return (
    <div className="pt-20 pb-16">
      <SEO
        title="Help Center — Getting Started Guides for ZYR0"
        description="Step-by-step guides for students, companies, and mentors. Learn how to browse internships, review applicants, submit project work, issue certificates, and verify credentials on ZYR0."
        path="/help"
        keywords="ZYR0 help center, getting started guide, internship platform help, student guide, company guide, mentor guide"
      />
      {/* Hero */}
      <section className="px-4 py-16 bg-gradient-to-b from-primary to-primary/90 dark:from-slate-950 dark:to-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-white/70" />
            <h1 className="text-4xl sm:text-5xl font-bold">Help Center</h1>
            <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              Step-by-step guides and resources to help you get the most out of the ZYR0 platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Topic Links */}
      <section className="px-4 py-10 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Quick Links</h2>
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <Link
                key={t.label}
                to={t.href}
                className="px-4 py-2 bg-muted hover:bg-accent hover:text-white text-sm font-medium rounded-lg border border-border transition-colors"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <h2 className="text-3xl font-bold">Getting Started Guides</h2>
            <p className="mt-2 text-muted-foreground">Everything you need to start using ZYR0 in your role.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((guide, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <guide.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{guide.title}</h3>
                    <p className="text-xs text-muted-foreground">{guide.desc}</p>
                  </div>
                </div>
                <ol className="space-y-2 mt-4">
                  {guide.steps.map((step, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center mt-0.5">
                        {j + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="px-4 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-xl border border-border p-6 shadow-sm flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold">Browse FAQ</h3>
                <p className="text-sm text-muted-foreground mt-1">Common questions answered in detail.</p>
              </div>
              <Link to="/faq" className="flex items-center gap-1 text-sm font-medium text-accent hover:underline flex-shrink-0">
                View FAQ <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl border border-border p-6 shadow-sm flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold">Contact Support</h3>
                <p className="text-sm text-muted-foreground mt-1">Can&apos;t find your answer? Reach out directly.</p>
              </div>
              <Link to="/contact" className="flex items-center gap-1 text-sm font-medium text-accent hover:underline flex-shrink-0">
                <Mail className="w-4 h-4" /> Contact
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
