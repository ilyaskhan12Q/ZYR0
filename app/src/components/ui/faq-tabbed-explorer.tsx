import { useState } from 'react';
import { LayoutGrid, ShieldCheck, Cpu, CreditCard } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'technical' | 'billing' | 'account';
}

type FAQCategory = FAQItem['category'];

const FAQ_DATA: FAQItem[] = [
  // GENERAL
  {
    id: 'g1',
    category: 'general',
    question: 'What is the ZYR0 platform?',
    answer:
      'ZYR0 is a multi-product AI and SaaS company providing four interconnected solutions: ZYR0 Studio (AI website/app builder), ZYR0 Edu / School OS (educational institution management), ZYR0 Research (autonomous deep research agent), and ZYR0 Work (project-based internships and verified credentials).',
  },
  {
    id: 'g2',
    category: 'general',
    question: 'Can I use ZYR0 products individually?',
    answer:
      'Yes! Each ZYR0 product (Studio, School OS, Research Agent, and Work) functions both as a standalone powerhouse and as part of the interconnected ZYR0 ecosystem.',
  },
  {
    id: 'g3',
    category: 'general',
    question: 'How do I get started with ZYR0 Studio?',
    answer:
      'Visit the ZYR0 Studio page (/studio) to try the interactive prompt builder, view sample generated web applications, and join the builder waitlist for immediate early access.',
  },
  {
    id: 'g4',
    category: 'general',
    question: 'Who is ZYR0 for?',
    answer:
      'Builders and developers, educational institutions, researchers and analysts, and students or companies hiring verified engineering talent — one ecosystem serving all four.',
  },
  {
    id: 'g5',
    category: 'general',
    question: 'Is ZYR0 suitable for production use?',
    answer:
      'Yes. The platform is engineered with enterprise security, high-availability multi-tenancy, and 99.9% uptime — from solo builders to national institutions.',
  },
  // TECHNICAL
  {
    id: 't1',
    category: 'technical',
    question: 'How does School OS onboarding work for institutions?',
    answer:
      'Schools, colleges, and academies can book an institutional walkthrough through /school. Our team configures your custom domain, imports student/staff data, and provides end-to-end training.',
  },
  {
    id: 't2',
    category: 'technical',
    question: 'What technologies power ZYR0?',
    answer:
      'React 19, TypeScript, and Tailwind CSS on the frontend with Supabase on the backend — the same stack ZYR0 Studio generates for your apps.',
  },
  {
    id: 't3',
    category: 'technical',
    question: 'Does ZYR0 support dark mode and mobile devices?',
    answer:
      'Yes. The interface follows a mobile-first approach with full light and dark theme support that respects your system preference.',
  },
  {
    id: 't4',
    category: 'technical',
    question: 'Can I export the code ZYR0 Studio generates?',
    answer:
      'Yes. Builder plans include full code export and Git sync, so everything you generate is yours to own, extend, and deploy anywhere.',
  },
  {
    id: 't5',
    category: 'technical',
    question: 'How are credentials and certificates verified?',
    answer:
      'Every project milestone, school certificate, and code submission is cryptographically signed (SHA-256) and publicly verifiable — no fabricated resumes.',
  },
  // BILLING
  {
    id: 'b1',
    category: 'billing',
    question: 'Is there a free plan?',
    answer:
      'Yes — the Starter plan is free forever, including ZYR0 Work access, standard Research queries, 2 ZYR0 Studio projects, and verifiable digital credentials.',
  },
  {
    id: 'b2',
    category: 'billing',
    question: 'What does Builder Pro include?',
    answer:
      'Builder Pro is $24/month and unlocks unlimited Studio apps and code export, high-depth Research runs, custom domains, priority API processing, and 24/7 developer support.',
  },
  {
    id: 'b3',
    category: 'billing',
    question: 'Are there team or enterprise plans?',
    answer:
      'Yes. The Enterprise / School OS plan is an annual license with full School OS deployment, biometric and fee gateway integrations, dedicated onboarding, and SOC 2 compliant security.',
  },
  {
    id: 'b4',
    category: 'billing',
    question: 'How do billing questions and refunds work?',
    answer:
      'Refunds are handled case-by-case. Contact support@zyroo.org if you believe you were charged incorrectly and we will sort it out.',
  },
  // ACCOUNT
  {
    id: 'a1',
    category: 'account',
    question: 'How do I reset my password?',
    answer:
      'Go to the login page and click "Forgot Password". You will receive an email with reset instructions.',
  },
  {
    id: 'a2',
    category: 'account',
    question: 'How do I delete my account?',
    answer:
      'You can request account deletion from your account settings or by contacting support.',
  },
  {
    id: 'a3',
    category: 'account',
    question: 'How is my data secured?',
    answer:
      'We use industry-standard encryption and secure authentication, plus cryptographic signing for credentials, to protect your data end to end.',
  },
  {
    id: 'a4',
    category: 'account',
    question: 'How do I contact the team?',
    answer:
      'Reach us at support@zyroo.org or visit the Contact page (/contact) to book a live demo with our product architects.',
  },
];

const categories: { id: FAQCategory; icon: typeof LayoutGrid; label: string }[] = [
  { id: 'general', icon: LayoutGrid, label: 'General' },
  { id: 'technical', icon: Cpu, label: 'Technical' },
  { id: 'billing', icon: CreditCard, label: 'Billing' },
  { id: 'account', icon: ShieldCheck, label: 'Account' },
];

export const FaqTabbedExplorer = () => {
  const [activeTab, setActiveTab] = useState<FAQCategory>('general');
  const filteredItems = FAQ_DATA.filter((item) => item.category === activeTab);

  return (
    <div
      className="w-full max-w-5xl mx-auto rounded-3xl border flex flex-col md:flex-row justify-center"
      style={{ background: 'var(--zyro-surface)', borderColor: 'var(--zyro-border)' }}
    >
      <div
        className="w-full md:w-72 p-6 border-b md:border-b-0 md:border-r rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none pt-10"
        style={{ borderColor: 'var(--zyro-border)' }}
      >
        <h3
          className="text-sm font-semibold font-display text-muted-foreground uppercase tracking-widest mb-4 px-2"
        >
          Knowledge Base
        </h3>
        <nav className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              aria-pressed={activeTab === cat.id}
              className={cn(
                'w-full flex items-center font-display cursor-pointer gap-3 px-2 py-3 border rounded-xl transition-all font-medium',
                activeTab === cat.id
                  ? 'text-[#7B7BDC] border-[#7B7BDC]/50 bg-[#7B7BDC]/10'
                  : 'text-muted-foreground hover:bg-muted border-transparent',
              )}
            >
              <cat.icon size={18} />
              {cat.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 p-6 sm:p-8">
        <div className="mb-8">
          <h2
            className="text-2xl font-display font-semibold mb-2 capitalize"
            style={{ color: 'var(--zyro-text)' }}
          >
            {activeTab} Questions
          </h2>
          <p className="text-muted-foreground text-sm">
            Find answers specifically related to your {activeTab} inquiries.
          </p>
        </div>
        <div className="space-y-4">
          {/* key resets open item when tab changes */}
          <Accordion key={activeTab} type="single" collapsible defaultValue={filteredItems[0]?.id}>
            {filteredItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border mb-4 rounded-xl overflow-hidden"
                style={{ borderColor: 'var(--zyro-border)', background: 'var(--zyro-bg)' }}
              >
                <AccordionTrigger className="rounded-xl hover:bg-muted px-4 py-4 font-semibold font-display text-sm sm:text-base hover:no-underline">
                  <span style={{ color: 'var(--zyro-text)' }}>{item.question}</span>
                </AccordionTrigger>
                <AccordionContent
                  className="px-4 text-sm leading-relaxed"
                  style={{ color: 'var(--zyro-text-secondary)' }}
                >
                  <p className="pt-1">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default FaqTabbedExplorer;
