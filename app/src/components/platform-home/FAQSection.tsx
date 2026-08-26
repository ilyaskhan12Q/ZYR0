import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqItems } from './data';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="ph-section" style={{ background: 'var(--ph-surface)' }}>
      <div className="ph-container">
        <div className="ph-section-header">
          <p className="ph-eyebrow">FAQ</p>
          <h2 className="ph-display ph-section-title">Frequently asked questions</h2>
        </div>

        <div className="ph-faq-list">
          {faqItems.map((item, i) => (
            <div key={i} className={`ph-faq-item ${openIndex === i ? 'open' : ''}`}>
              <button
                className="ph-faq-question"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span>{item.question}</span>
                <ChevronDown className="ph-faq-chevron" />
              </button>
              {openIndex === i && (
                <div className="ph-faq-answer">{item.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
