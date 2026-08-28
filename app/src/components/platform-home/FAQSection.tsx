import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqItems } from './data';
import Reveal from './Reveal';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="max-w-[720px] mx-auto px-6 md:px-16">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-12 md:mb-16">
            <p
              className="font-label text-[11px] tracking-[0.2em] uppercase mb-4"
              style={{ color: 'var(--zyro-accent)' }}
            >
              FAQ
            </p>
            <h2
              className="text-4xl md:text-5xl font-display mb-4"
              style={{ color: 'var(--zyro-text)', letterSpacing: '-0.02em' }}
            >
              Common questions.
            </h2>
            <p
              className="text-lg"
              style={{ color: 'var(--zyro-text-secondary)' }}
            >
              Everything you need to know about ZYR0's products, pricing, and architecture.
            </p>
          </div>
        </Reveal>

        {/* Accordion */}
        <div className="space-y-2">
          {faqItems.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Reveal key={faq.question} delay={idx * 0.05}>
                <div
                  className="rounded-xl border overflow-hidden transition-all duration-200"
                  style={{
                    background: isOpen ? 'var(--zyro-surface)' : 'transparent',
                    borderColor: 'var(--zyro-border)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 transition-colors duration-200"
                    style={{ color: 'var(--zyro-text)' }}
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-medium">{faq.question}</span>
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                      style={{
                        background: isOpen ? 'var(--zyro-accent-muted)' : 'var(--zyro-elevated)',
                        color: isOpen ? 'var(--zyro-accent)' : 'var(--zyro-text-muted)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      className="px-5 pb-5 text-sm leading-relaxed"
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
      </div>
    </section>
  );
}
