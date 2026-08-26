import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { benefits } from './data';

export default function BenefitsSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="ph-section" style={{ background: 'var(--ph-surface)' }}>
      <div className="ph-container">
        <div className="ph-section-header">
          <p className="ph-eyebrow">Benefits</p>
          <h2 className="ph-display ph-section-title">Unlock your career potential</h2>
          <p className="ph-section-subtitle">
            Find verified internships, track applications, and connect with mentors — all in one platform.
          </p>
        </div>

        <div className="ph-benefits-grid">
          {benefits.map((benefit, i) => (
            <div
              key={benefit.title}
              className={`ph-benefit-card ${active === i ? 'active' : ''}`}
              onMouseEnter={() => setActive(i)}
            >
              <h3 className="ph-benefit-title">{benefit.title}</h3>
              <p className="ph-benefit-desc">{benefit.description}</p>
              <ul className="ph-benefit-items">
                {benefit.items.map((item) => (
                  <li key={item} className="ph-benefit-item">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
