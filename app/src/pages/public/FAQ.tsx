import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  label: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    label: 'For Students',
    items: [
      {
        q: 'How do I apply for an internship on Zyro?',
        a: 'Browse available internships from the Internships page. Click on any listing to view full details including requirements, duration, and company information. When you are ready, click "Apply Now" and submit your application. You can track the status of all your applications from your Student Dashboard under My Applications.',
      },
      {
        q: 'What happens after my application is submitted?',
        a: 'Your application enters the company\'s review queue. The company will either accept, reject, or place your application on a shortlist. You will receive notifications for each status change. If accepted, a formal offer letter will be generated for you to review and sign digitally within the platform.',
      },
      {
        q: 'How do I submit my project work?',
        a: 'All project submissions must be done via a public GitHub repository URL. From your Internship Workspace, navigate to the relevant task and click "Submit Work". Enter your GitHub repository link and an optional live demo URL. Your mentor will review your submission and may request revisions or approve it.',
      },
      {
        q: 'How are certificates issued and verified?',
        a: 'Upon successful completion of all assigned tasks and your mentor\'s final approval, Zyro automatically generates a digital certificate with a unique credential ID. You can download it from your Certificates dashboard. Anyone can verify the authenticity of your certificate at zyro.com/verify by entering the credential ID.',
      },
      {
        q: 'Can I apply to multiple internships at once?',
        a: 'Yes. You can apply to as many internships as you are qualified for. There is no limit on the number of simultaneous applications. However, once you accept an offer letter, you are expected to commit to that internship for its duration.',
      },
    ],
  },
  {
    label: 'For Companies',
    items: [
      {
        q: 'How do I post an internship on Zyro?',
        a: 'From your Company Dashboard, navigate to Internships and click "Post Internship". Fill in the details including title, domain, duration, location type, requirements, and a description of the project students will work on. Once published, your internship will appear in the public listings immediately.',
      },
      {
        q: 'How does the application review process work?',
        a: 'All applications to your internships appear in the Applicants section of your dashboard. You can review each applicant\'s profile, accept or reject their application, or shortlist them for further review. Accepted applicants receive an automatically generated offer letter to review and sign.',
      },
      {
        q: 'Can I assign tasks after an intern joins?',
        a: 'Yes. From the Tasks section of your dashboard, you can create detailed project tasks including a title, description, acceptance criteria, difficulty level, and due date. Tasks are assigned to specific interns and become visible in their Workspace.',
      },
      {
        q: 'How do I issue a certificate to a completed intern?',
        a: 'Once a mentor has reviewed and approved all task submissions and your team completes the final evaluation, you can initiate certificate generation from the Certificates section of your dashboard. The certificate is then automatically delivered to the intern\'s account.',
      },
    ],
  },
  {
    label: 'Platform & Account',
    items: [
      {
        q: 'Is Zyro free to use?',
        a: 'Zyro is currently in its growth phase. The core platform — including internship listings, applications, task management, and certificate verification — is available without charge. Enterprise plans with advanced analytics, priority support, and bulk internship management are planned for the future.',
      },
      {
        q: 'What roles are available on Zyro?',
        a: 'Zyro supports four roles: Student, Company, Mentor, and Admin. Each role has its own dedicated dashboard and permissions. You select your role during registration and it determines what features you have access to.',
      },
      {
        q: 'Can I change my role after registering?',
        a: 'Role changes are not currently supported through self-service. If you registered with the wrong role, please contact our support team at support@zyro.com and we will assist you.',
      },
      {
        q: 'How do I reset my password?',
        a: 'Click "Forgot Password" on the login page and enter your registered email address. We will send a secure password reset link. The link is valid for 60 minutes. If you do not receive the email, check your spam folder or contact support.',
      },
      {
        q: 'How do I delete my account?',
        a: 'To request account deletion, contact us at support@zyro.com with the subject line "Account Deletion Request". We will process your request within 30 days. Note that issued certificates will remain verifiable through the public verification system even after account deletion.',
      },
    ],
  },
];

function FAQItem({ item, index }: { item: FAQItem; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className="border border-border rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left bg-card hover:bg-muted/50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold pr-4">{item.q}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 bg-muted/20 border-t border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState(faqData[0].label);

  return (
    <div className="pt-20 pb-16">
      {/* Hero */}
      <section className="px-4 py-16 bg-gradient-to-b from-primary to-primary/90 dark:from-slate-950 dark:to-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-white/70" />
            <h1 className="text-4xl sm:text-5xl font-bold">Frequently Asked Questions</h1>
            <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              Find answers to the most common questions about the Zyro platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Category Tabs */}
          <div className="flex gap-2 bg-muted rounded-lg p-1 border border-border mb-10 overflow-x-auto">
            {faqData.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.label ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          {faqData
            .filter((cat) => cat.label === activeCategory)
            .map((cat) => (
              <div key={cat.label} className="space-y-3">
                {cat.items.map((item, i) => (
                  <FAQItem key={i} item={item} index={i} />
                ))}
              </div>
            ))}

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center bg-card rounded-xl border border-border p-8 shadow-sm"
          >
            <h3 className="text-lg font-bold mb-2">Still have questions?</h3>
            <p className="text-sm text-muted-foreground mb-5">Our support team is ready to help.</p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Contact Support
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
