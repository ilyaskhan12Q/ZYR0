import { motion } from 'framer-motion';
import { FileText, Users, AlertCircle, ShieldCheck, Scale, Mail } from 'lucide-react';
import { SEO } from '@/components/SEO';

const sections = [
  {
    icon: FileText,
    title: 'Acceptance of Terms',
    content: [
      'By accessing or using the ZYR0 platform ("Service"), you agree to be bound by these Terms of Service ("Terms").',
      'If you do not agree with any part of these Terms, you may not access or use the Service.',
      'These Terms apply to all users of the Service including students, companies, mentors, and administrators.',
      'ZYR0 reserves the right to update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the revised Terms.',
    ],
  },
  {
    icon: Users,
    title: 'User Accounts & Roles',
    content: [
      'You must register for an account to access most features. You are responsible for maintaining the confidentiality of your account credentials.',
      'Each account is assigned one of four roles: Student, Company, Mentor, or Admin. Role-specific features and permissions are enforced throughout the platform.',
      'You must provide accurate and complete information during registration. Providing false information may result in immediate account suspension.',
      'Students must be at least 16 years old to register. Company accounts must represent a legitimate organization.',
      'You may not create multiple accounts for the same role or attempt to access features restricted to other roles.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Platform Usage',
    content: [
      'The platform must be used for legitimate internship management purposes as described in our product documentation.',
      'Companies are responsible for the accuracy of internship listings they publish, including job scope, compensation, and requirements.',
      'Students agree to submit genuine work through GitHub repositories. Plagiarism or misrepresentation of work is grounds for account termination.',
      'All users agree to communicate respectfully. Harassment, discrimination, or abusive behavior will result in immediate suspension.',
      'You may not reverse engineer, scrape, or attempt to extract data from the platform through automated means.',
      'Certificates issued by ZYR0 represent completed internship programs. Fraudulent use of certificates is prohibited.',
    ],
  },
  {
    icon: AlertCircle,
    title: 'Intellectual Property',
    content: [
      'ZYR0 retains ownership of all platform software, design, branding, and documentation.',
      'Student project work submitted via GitHub remains the intellectual property of the student, unless otherwise agreed with the sponsoring company.',
      'Certificates issued by ZYR0 remain verifiable indefinitely. The verification system and certificate design are the intellectual property of ZYR0.',
      'Content you upload to the platform (profile photos, documents) is licensed to ZYR0 for the purpose of providing the Service.',
    ],
  },
  {
    icon: Scale,
    title: 'Liability & Warranties',
    content: [
      'The Service is provided "as is" without warranties of any kind, express or implied.',
      'ZYR0 acts as a platform facilitating connections between students and companies. We are not responsible for the outcomes of internship relationships.',
      'We do not guarantee that internship listings are accurate, that applications will result in offers, or that all internships will be completed.',
      'To the maximum extent permitted by law, ZYR0 is not liable for indirect, incidental, or consequential damages arising from use of the Service.',
      'Our total liability for any claim arising from these Terms or use of the Service shall not exceed the amount you paid us in the 12 months preceding the claim.',
    ],
  },
  {
    icon: Mail,
    title: 'Termination & Contact',
    content: [
      'You may terminate your account at any time by contacting us at support@zyroo.dpdns.org.',
      'ZYR0 may suspend or terminate accounts that violate these Terms, with or without notice.',
      'Upon termination, your access to the Service will cease. Issued certificates remain verifiable through the public verification system.',
      'These Terms are governed by applicable law. Any disputes shall be resolved through binding arbitration.',
      'For questions about these Terms, contact us at legal@zyroo.dpdns.org.',
    ],
  },
];

export default function TermsOfService() {
  return (
    <div className="pt-20 pb-16">
      <SEO
        title="Terms of Service — ZYR0 Platform Usage Agreement"
        description="Review ZYR0's Terms of Service. These terms govern your access and use of the ZYR0 internship management platform, including rights, responsibilities, and limitations for students, companies, and mentors."
        path="/terms"
        keywords="ZYR0 terms of service, platform terms, usage agreement, internship platform terms, user agreement"
      />
      {/* Hero */}
      <section className="px-4 py-16 bg-gradient-to-b from-primary to-primary/90 dark:from-slate-950 dark:to-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <FileText className="w-12 h-12 mx-auto mb-4 text-white/70" />
            <h1 className="text-4xl sm:text-5xl font-bold">Terms of Service</h1>
            <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              Please read these terms carefully before using the ZYR0 platform. They govern your access and use of our Service.
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
