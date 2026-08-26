import { Star } from 'lucide-react';
import { testimonials } from './data';

export default function TestimonialsSection() {
  return (
    <section className="ph-section">
      <div className="ph-container">
        <div className="ph-section-header">
          <p className="ph-eyebrow">Testimonials</p>
          <h2 className="ph-display ph-section-title">What our users say</h2>
        </div>

        <div className="ph-testimonials-grid">
          {testimonials.map((t) => (
            <div key={t.name} className="ph-testimonial-card">
              <div className="ph-testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="ph-testimonial-quote">"{t.quote}"</p>
              <div className="ph-testimonial-author">
                <div className="ph-testimonial-avatar">
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="ph-testimonial-name">{t.name}</p>
                  <p className="ph-testimonial-role">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
