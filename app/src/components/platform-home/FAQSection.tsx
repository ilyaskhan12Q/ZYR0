import { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { faqItems } from './data';
import Reveal from './Reveal';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 md:py-28 relative">
      <div className="max-w-[800px] mx-auto px-6 md:px-12">
        {/* Header */}
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
              Everything you need to know about ZYR0&apos;s product ecosystem, integrations, and deployment.
            </p>
          </div>
        </Reveal>

        {/* Accordion */}
        <div className="space-y-3">
          {faqItems.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Reveal key={faq.question} delay={idx * 0.04}>
                <div
                  className="rounded-xl border transition-all duration-300 overflow-hidden"
                  style={{
                    background: isOpen ? 'var(--zyro-surface)' : 'var(--zyro-bg)',
                    borderColor: isOpen ? 'var(--zyro-accent)' : 'var(--zyro-border)',
                    boxShadow: isOpen ? '0 0 20px rgba(123,123,220,0.08)' : 'none',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span
                      className="text-sm sm:text-base font-semibold"
                      style={{ color: 'var(--zyro-text)' }}
                    >
                      {faq.question}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      style={{
                        background: isOpen ? 'var(--zyro-accent)' : 'var(--zyro-elevated)',
                        color: isOpen ? '#FFFFFF' : 'var(--zyro-text-muted)',
                      }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      className="px-5 sm:px-6 pb-6 text-sm sm:text-[15px] leading-relaxed pt-1"
                      style={{ color: 'var(--zyro-text-secondary)' }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Support Link */}
        <Reveal delay={0.3}>
          <div className="mt-10 text-center">
            <p
              className="text-xs"
              style={{ color: 'var(--zyro-text-muted)' }}
            >
              Have a specific institutional or technical question?{' '}
              <Link to="/contact" className="text-[#7B7BDC] hover:underline font-medium inline-flex items-center gap-1">
                Contact our engineering team <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
