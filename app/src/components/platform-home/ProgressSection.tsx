import { ArrowRight, TrendingUp } from 'lucide-react';
import { stats } from './data';

export default function ProgressSection() {
  return (
    <section className="ph-section">
      <div className="ph-container">
        <div className="ph-progress-grid">
          <div>
            <p className="ph-eyebrow">Progress Tracking</p>
            <h2 className="ph-display ph-section-title" style={{ marginTop: '0.75rem' }}>
              Track your career progress
            </h2>
            <p className="ph-section-subtitle" style={{ marginLeft: 0, marginRight: 0, textAlign: 'left' }}>
              Visualize your journey from first application to landing your dream internship. Real-time updates, clear milestones.
            </p>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ph-text)' }}>{stat.number}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ph-text-muted)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <a href="/register" className="ph-btn-primary" style={{ marginTop: '2rem', display: 'inline-flex' }}>
              Get started free <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="ph-progress-visual">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <TrendingUp className="w-4 h-4 text-[var(--ph-accent)]" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ph-text)' }}>Application Pipeline</span>
            </div>
            {['Applied', 'Reviewing', 'Interview', 'Offer'].map((step, i) => (
              <div key={step}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--ph-text-muted)' }}>{step}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ph-text-muted)' }}>{[45, 30, 15, 10][i]}%</span>
                </div>
                <div className="ph-progress-bar">
                  <div className="ph-progress-fill" style={{ width: `${[45, 30, 15, 10][i]}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
