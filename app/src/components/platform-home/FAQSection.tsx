import { HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FaqTabbedExplorer } from '@/components/ui/faq-tabbed-explorer';
import Reveal from './Reveal';

export default function FAQSection() {
  return (
    <section id="faq" className="py-20 md:py-28 relative">
      <div className="max-w-[1000px] mx-auto px-6 md:px-12">
        <Reveal>
          <div className="text-center mb-12 md:mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 border mx-auto"
              style={{
                color: 'var(--zyro-accent)',
                borderColor: 'var(--zyro-border)',
                background: 'var(--zyro-accent-muted)',
              }}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Questions & Answers</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold mb-4 tracking-tight"
              style={{ color: 'var(--zyro-text)' }}
            >
              Common questions.
            </h2>
            <p
              className="text-base sm:text-lg leading-relaxed max-w-lg mx-auto"
              style={{ color: 'var(--zyro-text-secondary)' }}
            >
              Everything you need to know about ZYR0&apos;s product ecosystem, integrations, and
              deployment.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <FaqTabbedExplorer />
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-10 text-center">
            <p className="text-xs" style={{ color: 'var(--zyro-text-muted)' }}>
              Have a specific institutional or technical question?{' '}
              <Link
                to="/contact"
                className="text-[#7B7BDC] hover:underline font-medium inline-flex items-center gap-1"
              >
                Contact our engineering team <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
