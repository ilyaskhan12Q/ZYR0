import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { faqItems } from './data';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/5">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <HelpCircle className="w-3.5 h-3.5" />
          Got Questions?
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-mono mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-sm sm:text-base text-neutral-400">
          Everything you need to know about ZYR0's products, pricing, and architecture.
        </p>
      </div>

      <div className="space-y-3">
        {faqItems.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.question}
              className="rounded-2xl bg-neutral-900/60 border border-white/10 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleFAQ(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 text-white hover:text-cyan-400 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-sm sm:text-base font-mono">
                  {faq.question}
                </span>
                <div
                  className={`w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-cyan-400 bg-cyan-500/10 border-cyan-500/20' : 'text-neutral-400'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-150">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
