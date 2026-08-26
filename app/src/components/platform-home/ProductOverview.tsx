import { features } from './data';

export default function ProductOverview() {
  return (
    <section className="ph-section">
      <div className="ph-container">
        <div className="ph-section-header">
          <p className="ph-eyebrow">Product Overview</p>
          <h2 className="ph-display ph-section-title">ZYR0 at a Glance</h2>
          <p className="ph-section-subtitle">
            Everything you need to find, apply, and manage internships — built for students, companies, and mentors.
          </p>
        </div>

        <div className="ph-feature-grid">
          {features.map((feature) => (
            <div key={feature.title} className="ph-feature-card">
              <div className="ph-feature-icon">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="ph-feature-title">{feature.title}</h3>
              <p className="ph-feature-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
