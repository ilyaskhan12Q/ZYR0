import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Menu } from 'lucide-react';
import { navLinks, navCta, navSignIn } from './data';

export default function PlatformNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  return (
    <>
      <nav className={`ph-nav ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="ph-nav-logo">
          <img src="/zyro-logo.webp" alt="ZYR0" width="28" height="28" />
          <span>ZYR0</span>
        </Link>

        <div className="ph-nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`ph-nav-link ${location.pathname === link.href ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ph-nav-actions">
          <Link to={navSignIn.href} className="ph-nav-signin">
            {navSignIn.label}
          </Link>
          <Link to={navCta.href} className="ph-nav-cta">
            {navCta.label}
          </Link>
          <button
            className="ph-nav-hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4 text-black" />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <>
          <div className="ph-mobile-overlay" onClick={() => setMobileOpen(false)} />
          <div className="ph-mobile-menu">
            <div className="ph-mobile-header">
              <Link to="/" className="ph-nav-logo" onClick={() => setMobileOpen(false)}>
                <img src="/zyro-logo.webp" alt="ZYR0" width="28" height="28" />
                <span>ZYR0</span>
              </Link>
              <button className="ph-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="ph-mobile-links">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="ph-mobile-link"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="ph-mobile-actions">
              <Link to={navSignIn.href} className="ph-btn-ghost" style={{ justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>
                {navSignIn.label}
              </Link>
              <Link to={navCta.href} className="ph-btn-primary" style={{ justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>
                {navCta.label}
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
