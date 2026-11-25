import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Mail } from 'lucide-react';
import { footerNav } from '@/config/navigation';
import { SITE_CONFIG } from '@/config/site';
import { WhatsAppIcon, LinkedInIcon } from '@/components/icons/BrandIcons';

const linkClass = 'text-sm text-white/70 hover:text-white transition-colors';
const headingClass = 'font-semibold text-sm mb-4 text-white';

// RGB-ish palette for the pixel-art corner.
const PIXEL_COLORS = ['#ff3b30', '#ff9f0a', '#ffd60a', '#30d158', '#40c8e0', '#0a84ff', '#5e5ce6', '#bf5af2'];

export default function SiteFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // ponytail: subscribe has no backend — local "thanks" only; wire to a Supabase
  // table or email API when one exists, then delete this comment.
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="relative overflow-hidden bg-[#0051C3] text-white z-10 mt-3 mx-3 md:mt-6 md:mx-6 rounded-t-2xl md:rounded-t-3xl">
      {/* RGB pixel-art right triangle in the top-right corner */}
      <svg
        aria-hidden="true"
        viewBox="0 0 8 8"
        className="pointer-events-none select-none absolute right-0 top-0 z-0 w-28 md:w-40 h-auto drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]"
      >
        <defs>
          <linearGradient id="footer-pixel-bevel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="55%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {Array.from({ length: 8 }).flatMap((_, y) =>
          Array.from({ length: 8 - y }).map((_, i) => {
            const x = y + i;
            return (
              <g key={`${x}-${y}`}>
                <rect
                  x={x + 0.03}
                  y={y + 0.03}
                  width={0.94}
                  height={0.94}
                  rx={0.08}
                  fill={PIXEL_COLORS[(x + y) % PIXEL_COLORS.length]}
                />
                <rect
                  x={x + 0.03}
                  y={y + 0.03}
                  width={0.94}
                  height={0.94}
                  rx={0.08}
                  fill="url(#footer-pixel-bevel)"
                />
              </g>
            );
          })
        )}
      </svg>

      {/* Oversized watermark behind the footer content */}
      <div aria-hidden="true" className="pointer-events-none select-none absolute inset-x-0 bottom-0 z-0 overflow-hidden">
        <span className="block text-center font-serif uppercase leading-[1.05] tracking-[-0.03em] text-[40vw] md:text-[28vw] -mb-[0.2em] bg-[linear-gradient(to_bottom,transparent_0%,transparent_20%,#ffffff_100%)] bg-clip-text text-transparent">
          ZYR0
        </span>
      </div>

      {/* Newsletter strip */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-10 md:pb-12">
          <div className="max-w-2xl">
            <h3 className="text-2xl md:text-3xl font-display tracking-tight mb-2">Stay in the loop.</h3>
            <p className="text-sm text-white/70 mb-6">
              Get updates on new features, product launches, and ecosystem news.
            </p>
            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-white/10 text-white">
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
                  aria-label="Email address"
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm bg-white/10 border border-white/25 text-white placeholder:text-white/50 outline-none focus:border-white/70 transition-colors"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-white text-[#0051C3] hover:bg-white/90 transition-colors"
                >
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Link grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 pb-24 md:pb-40">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <img src="/zyro-logo.webp" alt="" width="28" height="28" className="w-7 h-7 object-contain rounded-md ring-1 ring-white/30" />
              <span className="text-xl font-bold">ZYR0</span>
            </Link>
            <p className="text-sm text-white/70 leading-relaxed mb-5 max-w-xs">
              The unified AI &amp; SaaS ecosystem for builders, institutions, researchers, and talent.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={SITE_CONFIG.social.whatsappChannel}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ZYR0 WhatsApp Channel"
                className="w-8 h-8 rounded-lg bg-white/10 text-white border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current" />
              </a>
              <a
                href={SITE_CONFIG.social.linkedinCompany}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-white/10 text-white border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <LinkedInIcon className="w-4 h-4 fill-current" />
              </a>
              <a
                href={`mailto:${SITE_CONFIG.supportEmail}`}
                aria-label="Email support"
                className="w-8 h-8 rounded-lg text-white/70 hover:text-white flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className={headingClass}>Products</h4>
            <ul className="space-y-2.5">
              {footerNav.products.map((item) => (
                <li key={item.href}><Link to={item.href} className={linkClass}>{item.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Students */}
          <div>
            <h4 className={headingClass}>For Students</h4>
            <ul className="space-y-2.5">
              {footerNav.students.map((item) => (
                <li key={item.href}><Link to={item.href} className={linkClass}>{item.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Companies */}
          <div>
            <h4 className={headingClass}>For Companies</h4>
            <ul className="space-y-2.5">
              {footerNav.companies.map((item) => (
                <li key={item.href}><Link to={item.href} className={linkClass}>{item.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-2 md:col-span-1">
            <h4 className={headingClass}>Resources</h4>
            <ul className="space-y-2.5">
              {footerNav.resources.map((item) => (
                <li key={item.href}><Link to={item.href} className={linkClass}>{item.label}</Link></li>
              ))}
              <li>
                <a
                  href={SITE_CONFIG.social.whatsappSupportGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-white/80 font-medium hover:text-white hover:underline"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  WhatsApp Support
                </a>
              </li>
              <li><Link to="/contact" className={linkClass}>Contact Us</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/60">
            &copy; {new Date().getFullYear()} ZYR0. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {footerNav.legal.map((item) => (
              <Link key={item.href} to={item.href} className="text-xs text-white/60 hover:text-white transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
