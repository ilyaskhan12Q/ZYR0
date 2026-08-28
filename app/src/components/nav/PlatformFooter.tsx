import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { footerNav } from '@/components/platform-home/data';
import { SITE_CONFIG } from '@/config/site';

export default function PlatformFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer
      className="w-full border-t"
      style={{
        background: 'var(--zyro-bg)',
        borderColor: 'var(--zyro-border)',
      }}
    >
      {/* Tier 1: Newsletter Strip */}
      <div
        className="border-b"
        style={{ borderColor: 'var(--zyro-border)' }}
      >
        <div className="max-w-[1264px] mx-auto px-6 md:px-16 py-12 md:py-16">
          <div className="max-w-2xl">
            <h3
              className="text-3xl md:text-4xl font-display mb-3"
              style={{ color: 'var(--zyro-text)', letterSpacing: '-0.02em' }}
            >
              Stay in the loop.
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--zyro-text-secondary)' }}
            >
              Get updates on new features, product launches, and ecosystem news.
            </p>

            {subscribed ? (
              <div
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
                style={{
                  background: 'var(--zyro-accent-muted)',
                  color: 'var(--zyro-accent)',
                }}
              >
                <Check className="w-4 h-4" />
                Thanks for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm border outline-none transition-colors duration-200"
                  style={{
                    background: 'var(--zyro-surface)',
                    borderColor: 'var(--zyro-border)',
                    color: 'var(--zyro-text)',
                  }}
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    background: 'var(--zyro-accent)',
                    color: '#FFFFFF',
                  }}
                >
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Tier 2: Link Grid */}
      <div className="max-w-[1264px] mx-auto px-6 md:px-16 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span
                className="text-xl font-display tracking-tight"
                style={{ color: 'var(--zyro-text)' }}
              >
                ZYR0
              </span>
            </Link>
            <p
              className="text-sm leading-relaxed mb-5 max-w-xs"
              style={{ color: 'var(--zyro-text-muted)' }}
            >
              The unified AI & SaaS ecosystem for builders, institutions, researchers, and talent.
            </p>

            {/* System Status */}
            <div className="flex items-center gap-2 mb-4">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: '#10b981' }}
              />
              <span
                className="text-xs"
                style={{ color: 'var(--zyro-text-muted)' }}
              >
                All systems operational
              </span>
            </div>

            {/* Support Email */}
            <a
              href={`mailto:${SITE_CONFIG.supportEmail}`}
              className="text-xs transition-colors duration-200"
              style={{ color: 'var(--zyro-text-muted)' }}
            >
              {SITE_CONFIG.supportEmail}
            </a>
          </div>

          {/* Products Column */}
          <div>
            <p
              className="font-label text-[11px] tracking-[0.2em] uppercase mb-4"
              style={{ color: 'var(--zyro-text-muted)' }}
            >
              Products
            </p>
            <ul className="space-y-2.5">
              {footerNav.products.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-sm transition-colors duration-200"
                    style={{ color: 'var(--zyro-text-secondary)' }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <p
              className="font-label text-[11px] tracking-[0.2em] uppercase mb-4"
              style={{ color: 'var(--zyro-text-muted)' }}
            >
              Resources
            </p>
            <ul className="space-y-2.5">
              {footerNav.resources.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-sm transition-colors duration-200 inline-flex items-center gap-1.5"
                    style={{ color: 'var(--zyro-text-secondary)' }}
                  >
                    {item.label}
                    {'badge' in item && item.badge && (
                      <span
                        className="font-label text-[9px] tracking-[0.1em] px-1.5 py-0.5 rounded"
                        style={{
                          background: 'var(--zyro-elevated)',
                          color: 'var(--zyro-text-muted)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <p
              className="font-label text-[11px] tracking-[0.2em] uppercase mb-4"
              style={{ color: 'var(--zyro-text-muted)' }}
            >
              Company
            </p>
            <ul className="space-y-2.5">
              {footerNav.company.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-sm transition-colors duration-200"
                    style={{ color: 'var(--zyro-text-secondary)' }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Tier 3: Bottom Bar */}
      <div
        className="border-t"
        style={{ borderColor: 'var(--zyro-border)' }}
      >
        <div className="max-w-[1264px] mx-auto px-6 md:px-16 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p
            className="text-xs"
            style={{ color: 'var(--zyro-text-muted)' }}
          >
            &copy; {new Date().getFullYear()} ZYR0. All rights reserved.
          </p>

          {/* Legal Links */}
          <div className="flex items-center gap-4">
            {footerNav.legal.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-xs transition-colors duration-200"
                style={{ color: 'var(--zyro-text-muted)' }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-2">
            {/* LinkedIn */}
            <a
              href={SITE_CONFIG.social.linkedinCompany}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors duration-200"
              style={{
                borderColor: 'var(--zyro-border)',
                color: 'var(--zyro-text-muted)',
              }}
              aria-label="LinkedIn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href={SITE_CONFIG.social.whatsappChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors duration-200"
              style={{
                borderColor: 'var(--zyro-border)',
                color: 'var(--zyro-text-muted)',
              }}
              aria-label="WhatsApp"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1zm0 0a5 5 0 0 0 5 5m0 0a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1h1z" />
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/ilyaskhan12Q/ZYR0"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors duration-200"
              style={{
                borderColor: 'var(--zyro-border)',
                color: 'var(--zyro-text-muted)',
              }}
              aria-label="GitHub"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
