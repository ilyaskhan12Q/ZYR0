import { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

const bullets = [
  'Free for students',
  'No credit card required',
  'Cancel anytime',
];

export default function CTASection() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/register${email ? `?email=${encodeURIComponent(email)}` : ''}`;
  };

  return (
    <section className="ph-cta">
      <div className="ph-cta-bg">
        <div className="ph-cta-gradient" />
        <div className="ph-cta-dots" />
      </div>

      <div className="ph-cta-inner">
        <p className="ph-eyebrow" style={{ marginBottom: '1rem' }}>Get Started</p>
        <h2 className="ph-display ph-cta-heading">Start your career journey</h2>
        <p className="ph-cta-subtitle">
          Join ZYR0 and discover verified internships, connect with mentors, and launch your career.
        </p>

        <form className="ph-cta-form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="ph-cta-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="ph-btn-primary" style={{ whiteSpace: 'nowrap' }}>
            Get started free <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="ph-cta-bullets">
          {bullets.map((b) => (
            <span key={b} className="ph-cta-bullet">
              <CheckCircle className="w-3.5 h-3.5" />
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
