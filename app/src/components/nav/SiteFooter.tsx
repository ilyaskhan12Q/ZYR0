import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Github, Mail } from 'lucide-react';
import { footerNav } from '@/config/navigation';
import { SITE_CONFIG } from '@/config/site';
import { WhatsAppIcon, LinkedInIcon } from '@/components/icons/BrandIcons';

const linkClass = 'text-sm text-muted-foreground hover:text-foreground transition-colors';

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
    <footer className="bg-card/80 backdrop-blur-md border-t border-border text-card-foreground relative z-10">
      {/* Newsletter strip */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14">
          <div className="max-w-2xl">
            <h3 className="text-2xl md:text-3xl font-display tracking-tight mb-2">Stay in the loop.</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Get updates on new features, product launches, and ecosystem news.
            </p>
            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-accent/10 text-accent">
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
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm bg-background border border-border outline-none focus:border-accent transition-colors"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <img src="/zyro-logo.webp" alt="" width="28" height="28" className="w-7 h-7 object-contain rounded-md" />
              <span className="text-xl font-bold">ZYR0</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-xs">
              The unified AI &amp; SaaS ecosystem for builders, institutions, researchers, and talent.
            </p>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">All systems operational</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={SITE_CONFIG.social.whatsappChannel}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ZYR0 WhatsApp Channel"
                className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current" />
              </a>
              <a
                href={SITE_CONFIG.social.linkedinCompany}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
              >
                <LinkedInIcon className="w-4 h-4 fill-current" />
              </a>
              <a
                href="https://github.com/ilyaskhan12Q/ZYR0"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${SITE_CONFIG.supportEmail}`}
                aria-label="Email support"
                className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Products</h4>
            <ul className="space-y-2.5">
              {footerNav.products.map((item) => (
                <li key={item.href}><Link to={item.href} className={linkClass}>{item.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Students */}
          <div>
            <h4 className="font-semibold text-sm mb-4">For Students</h4>
            <ul className="space-y-2.5">
              {footerNav.students.map((item) => (
                <li key={item.href}><Link to={item.href} className={linkClass}>{item.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Companies */}
          <div>
            <h4 className="font-semibold text-sm mb-4">For Companies</h4>
            <ul className="space-y-2.5">
              {footerNav.companies.map((item) => (
                <li key={item.href}><Link to={item.href} className={linkClass}>{item.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold text-sm mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {footerNav.resources.map((item) => (
                <li key={item.href}><Link to={item.href} className={linkClass}>{item.label}</Link></li>
              ))}
              <li>
                <a
                  href={SITE_CONFIG.social.whatsappSupportGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  WhatsApp Support
                </a>
              </li>
              <li><Link to="/contact" className={linkClass}>Contact Us</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ZYR0. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {footerNav.legal.map((item) => (
              <Link key={item.href} to={item.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
