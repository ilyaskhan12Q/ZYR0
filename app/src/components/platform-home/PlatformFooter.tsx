import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Github } from 'lucide-react';
import { navLinks, footerNav } from './data';

const socialIcons = { linkedin: Linkedin, twitter: Twitter, github: Github };

export default function PlatformFooter() {
  return (
    <footer className="ph-footer">
      <div className="ph-footer-grid">
        <div className="ph-footer-brand">
          <Link to="/" className="ph-nav-logo" style={{ borderRight: 'none', paddingRight: 0, marginRight: 0 }}>
            <img src="/zyro-logo.webp" alt="ZYR0" width="28" height="28" />
            <span>ZYR0</span>
          </Link>
          <p>A platform built for students, companies, and the modern workforce.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ph-accent)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--ph-text-muted)' }}>All Systems Operational</span>
          </div>
        </div>

        <div>
          <h4 className="ph-footer-heading">Products</h4>
          <div className="ph-footer-links">
            {footerNav.quickLinks.map((link) => (
              <Link key={link.href} to={link.href} className="ph-footer-link">{link.label}</Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="ph-footer-heading">Pages</h4>
          <div className="ph-footer-links">
            {footerNav.pages.map((link) => (
              <Link key={link.href} to={link.href} className="ph-footer-link">{link.label}</Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="ph-footer-heading">Connect</h4>
          <div className="ph-footer-links">
            {footerNav.social.map((s) => {
              const Icon = socialIcons[s.icon as keyof typeof socialIcons];
              return (
                <a key={s.label} href={s.href} className="ph-footer-link" target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="ph-footer-bottom">
        <p className="ph-footer-copy">&copy; 2026 ZYR0. All rights reserved.</p>
        <div className="ph-footer-socials">
          {footerNav.social.map((s) => {
            const Icon = socialIcons[s.icon as keyof typeof socialIcons];
            return (
              <a key={s.label} href={s.href} className="ph-footer-social" target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                <Icon className="w-4 h-4" />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
