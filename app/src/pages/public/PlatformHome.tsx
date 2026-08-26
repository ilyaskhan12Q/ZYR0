import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, FlaskConical, Palette, ArrowRight, Building2, Users, CheckCircle, Shield } from 'lucide-react';
import { SEO } from '@/components/SEO';
import '@/styles/platform-home.css';

const products = [
  {
    label: 'Internships',
    description: 'Find, apply, and manage structured internships with verified companies. Real work, real mentorship.',
    href: '/internships/browse',
    icon: Briefcase,
    color: '#4ade80',
    accent: '#16a34a',
    mockup: 'internships',
  },
  {
    label: 'Research Agent',
    description: 'Deep research powered by AI. Verified sources, structured reports, one question at a time.',
    href: '/research',
    icon: FlaskConical,
    color: '#60a5fa',
    accent: '#2563eb',
    mockup: 'research',
  },
  {
    label: 'ZYRO Studio',
    description: 'Launch your portfolio website in minutes. No code required.',
    href: '/studio',
    icon: Palette,
    color: '#c084fc',
    accent: '#9333ea',
    mockup: 'studio',
    badge: 'Coming Soon',
  },
];

const trustPoints = [
  { icon: CheckCircle, label: 'Verified companies' },
  { icon: Shield, label: 'Secure & private' },
  { icon: Users, label: 'Student-first design' },
  { icon: Building2, label: 'Built for real careers' },
];

function ProductMockup({ type }: { type: string }) {
  if (type === 'internships') {
    return (
      <div className="platform-mockup">
        <div className="mockup-bar">
          <span className="mockup-dot" /><span className="mockup-dot" /><span className="mockup-dot" />
        </div>
        <div className="mockup-content">
          <div className="mockup-row" style={{ width: '60%', height: 8, background: '#22c55e', opacity: 0.3, borderRadius: 4 }} />
          <div className="mockup-row" style={{ width: '80%', height: 6, background: '#e5e7eb', borderRadius: 3 }} />
          <div className="mockup-row" style={{ width: '45%', height: 6, background: '#e5e7eb', borderRadius: 3 }} />
          <div className="mockup-grid">
            <div className="mockup-card" />
            <div className="mockup-card" />
            <div className="mockup-card" />
          </div>
        </div>
      </div>
    );
  }
  if (type === 'research') {
    return (
      <div className="platform-mockup">
        <div className="mockup-bar">
          <span className="mockup-dot" /><span className="mockup-dot" /><span className="mockup-dot" />
        </div>
        <div className="mockup-content">
          <div className="mockup-row" style={{ width: '50%', height: 8, background: '#3b82f6', opacity: 0.3, borderRadius: 4 }} />
          <div className="mockup-chat">
            <div className="mockup-msg mockup-msg-user" />
            <div className="mockup-msg mockup-msg-agent" />
            <div className="mockup-msg mockup-msg-agent short" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="platform-mockup">
      <div className="mockup-bar">
        <span className="mockup-dot" /><span className="mockup-dot" /><span className="mockup-dot" />
      </div>
      <div className="mockup-content">
        <div className="mockup-row" style={{ width: '40%', height: 8, background: '#a855f7', opacity: 0.3, borderRadius: 4 }} />
        <div className="mockup-canvas">
          <div className="mockup-block" style={{ width: '40%', height: 40 }} />
          <div className="mockup-block" style={{ width: '55%', height: 40 }} />
          <div className="mockup-block" style={{ width: '100%', height: 24 }} />
        </div>
      </div>
    </div>
  );
}

export default function PlatformHome() {
  return (
    <div className="platform-root">
      <SEO
        title="ZYR0 — Internships, Research, and More"
        description="A platform built for students, researchers, and the modern workforce. Find internships, conduct deep research, and build your career."
        path="/"
      />

      {/* ═══ DARK HERO ═══ */}
      <section className="platform-hero">
        <div className="platform-hero-inner">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="platform-eyebrow"
          >
            Built for the modern workforce
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="platform-display platform-hero-text"
          >
            YOUR CAREER<br />STARTS HERE.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="platform-subtitle"
          >
            Internships. Research. Portfolio. One platform, zero noise.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="platform-hero-actions"
          >
            <Link to="/internships" className="platform-btn-primary">
              Get started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/about" className="platform-btn-ghost">
              Learn more
            </Link>
          </motion.div>
        </div>

        <div className="platform-hero-fade" />
      </section>

      {/* ═══ PRODUCT GRID — LIGHT ═══ */}
      <section className="platform-section">
        <div className="platform-container">
          <div className="platform-section-header">
            <p className="platform-eyebrow-dark">Products</p>
            <h2 className="platform-display platform-section-title">
              Everything you need,<br />nothing you don't.
            </h2>
          </div>

          <div className="platform-product-grid">
            {products.map((product, i) => (
              <motion.div
                key={product.href}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  to={product.href}
                  className="platform-product-card group"
                >
                  <div className="platform-product-card-header">
                    <div className="platform-product-icon" style={{ background: `${product.color}15`, color: product.color }}>
                      <product.icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      {product.badge && (
                        <span className="platform-badge">{product.badge}</span>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                  </div>

                  <h3 className="platform-product-name">{product.label}</h3>
                  <p className="platform-product-desc">{product.description}</p>

                  <ProductMockup type={product.mockup} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TRUST — DARK ═══ */}
      <section className="platform-dark-section">
        <div className="platform-container">
          <div className="platform-section-header">
            <p className="platform-eyebrow-light">Why ZYR0</p>
            <h2 className="platform-display platform-section-title-light">
              Built with<br />intention.
            </h2>
          </div>

          <div className="platform-trust-grid">
            {trustPoints.map((point, i) => (
              <motion.div
                key={point.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="platform-trust-item"
              >
                <point.icon className="w-5 h-5 text-[#4ade80]" />
                <span className="text-sm font-medium text-white/90">{point.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA — LIGHT ═══ */}
      <section className="platform-section platform-cta-section">
        <div className="platform-container platform-cta-inner">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="platform-display platform-cta-title">
              Ready to start?
            </h2>
            <p className="platform-cta-subtitle">
              Join ZYR0 and take the first step toward your next opportunity.
            </p>
            <div className="platform-cta-actions">
              <Link to="/register" className="platform-btn-primary">
                Create free account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/internships" className="platform-btn-ghost-dark">
                Browse internships
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
