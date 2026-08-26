import { Globe } from 'lucide-react';
import { globalStats } from './data';

export default function GlobalSection() {
  return (
    <section className="ph-section" style={{ background: 'var(--ph-surface)' }}>
      <div className="ph-container">
        <div className="ph-global-grid">
          <div className="ph-globe" />

          <div>
            <p className="ph-eyebrow">Global Presence</p>
            <h2 className="ph-display ph-section-title" style={{ marginTop: '0.75rem' }}>
              Connecting students &amp; companies worldwide
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--ph-text-muted)', lineHeight: 1.6, marginTop: '1rem', maxWidth: '28rem' }}>
              ZYR0 connects students with verified internship opportunities across the globe. Our platform bridges the gap between talent and opportunity.
            </p>
            <div className="ph-global-stats" style={{ marginTop: '2.5rem' }}>
              {globalStats.map((stat, i) => (
                <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="ph-global-stat-number">{stat.number}</span>
                  <span className="ph-global-stat-label">{stat.label}</span>
                  {i < globalStats.length - 1 && <span className="ph-global-stat-divider" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
