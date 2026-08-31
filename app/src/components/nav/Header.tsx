import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronDown, LogOut, User, LayoutDashboard, Settings,
  Building2, Sun, Moon, HelpCircle, MessageCircle, BookOpen,
  Shield, FileText, Cookie, BadgeCheck
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { useOptionalCompanyAccess } from '@/contexts/CompanyAccessContext';
import { productsList } from '@/components/platform-home/data';

const productLogos: Record<string, string> = {
  studio: '/logos/studio.png',
  edu: '/logos/schoolOS.png',
  research: '/logos/research.png',
};

const resources = [
  { label: 'Help Center', href: '/help', icon: HelpCircle },
  { label: 'FAQ', href: '/faq', icon: MessageCircle },
  { label: 'Blog', href: '/blog', icon: BookOpen, badge: 'Soon' },
  { label: 'Verify Certificate', href: '/verify', icon: BadgeCheck },
  { label: 'Privacy Policy', href: '/privacy', icon: Shield },
  { label: 'Terms of Service', href: '/terms', icon: FileText },
  { label: 'Cookie Policy', href: '/cookies', icon: Cookie },
];

const company = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Careers', href: '/careers' },
];

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const companyAccess = useOptionalCompanyAccess();
  const effectiveRole = profile?.role || (user?.user_metadata?.role as string) || 'student';
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (productsRef.current && !productsRef.current.contains(e.target as Node)) {
        setProductsOpen(false);
      }
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) {
        setCompanyOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    setProductsOpen(false);
    setResourcesOpen(false);
    setCompanyOpen(false);
    setMobileOpen(false);
    setMobileSection(null);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  const scrollTo = (hash: string) => {
    if (location.pathname !== '/') {
      navigate(`/${hash}`);
    } else {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 transition-all duration-300">
      <div
        className={`max-w-7xl mx-auto rounded-2xl transition-all duration-300 border ${
          scrolled
            ? 'bg-black/85 dark:bg-black/85 backdrop-blur-xl border-white/15 shadow-2xl shadow-black/80 py-3 px-5 sm:px-6'
            : 'bg-black/50 dark:bg-black/40 backdrop-blur-md border-white/10 py-3.5 px-5 sm:px-6'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <span className="text-xl font-display tracking-tight text-white">
              ZYR0
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Products */}
            <div className="relative" ref={productsRef}>
              <button
                type="button"
                onClick={() => { setProductsOpen(!productsOpen); setResourcesOpen(false); setCompanyOpen(false); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                  productsOpen
                    ? 'text-white bg-white/10'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Products
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    productsOpen ? 'rotate-180 text-accent-400' : 'text-neutral-400'
                  }`}
                />
              </button>

              {productsOpen && (
                <div className="absolute top-full left-0 mt-2 w-[340px] sm:w-[480px] p-2 rounded-xl bg-neutral-950 border border-white/15 backdrop-blur-2xl shadow-2xl shadow-black/90 z-50">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/40 to-transparent rounded-t-xl" />
                  {productsList.map((product) => (
                    <Link
                      key={product.id}
                      to={product.href}
                      onClick={() => setProductsOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-lg transition-all group hover:bg-white/5"
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-white/5 border border-white/10 group-hover:scale-105 transition-transform overflow-hidden">
                        {productLogos[product.id] ? (
                          <img src={productLogos[product.id]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-display text-sm text-white">{product.name.charAt(4)}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-white group-hover:text-accent-400 transition-colors">{product.name}</span>
                          {product.badge && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 border border-white/10">
                              {product.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs leading-relaxed line-clamp-2 text-neutral-400">
                          {product.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing */}
            <button
              type="button"
              onClick={() => scrollTo('#pricing')}
              className="px-3.5 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              Pricing
            </button>

            {/* Resources */}
            <div className="relative" ref={resourcesRef}>
              <button
                type="button"
                onClick={() => { setResourcesOpen(!resourcesOpen); setProductsOpen(false); setCompanyOpen(false); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                  resourcesOpen
                    ? 'text-white bg-white/10'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Resources
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    resourcesOpen ? 'rotate-180 text-accent-400' : 'text-neutral-400'
                  }`}
                />
              </button>

              {resourcesOpen && (
                <div className="absolute top-full left-0 mt-2 w-[240px] p-1.5 rounded-xl bg-neutral-950 border border-white/15 backdrop-blur-2xl shadow-2xl shadow-black/90 z-50">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/40 to-transparent rounded-t-xl" />
                  {resources.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setResourcesOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all group hover:bg-white/5"
                    >
                      <item.icon className="w-4 h-4 text-neutral-400 group-hover:text-accent-400 transition-colors" />
                      <span className="flex-1 text-neutral-300 group-hover:text-white transition-colors">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 border border-white/10">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Company */}
            <div className="relative" ref={companyRef}>
              <button
                type="button"
                onClick={() => { setCompanyOpen(!companyOpen); setProductsOpen(false); setResourcesOpen(false); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                  companyOpen
                    ? 'text-white bg-white/10'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Company
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    companyOpen ? 'rotate-180 text-accent-400' : 'text-neutral-400'
                  }`}
                />
              </button>

              {companyOpen && (
                <div className="absolute top-full left-0 mt-2 w-[200px] p-1.5 rounded-xl bg-neutral-950 border border-white/15 backdrop-blur-2xl shadow-2xl shadow-black/90 z-50">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/40 to-transparent rounded-t-xl" />
                  {company.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setCompanyOpen(false)}
                      className="block px-3 py-2 text-sm rounded-lg transition-all group hover:bg-white/5 text-neutral-300 group-hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <img
                    src={user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User'}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="hidden lg:inline">
                    {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-neutral-950 border border-white/15 backdrop-blur-2xl shadow-2xl shadow-black/90 py-1 z-50">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/40 to-transparent rounded-t-xl" />
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-medium text-white">
                        {user.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-neutral-400">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { setProfileOpen(false); navigate(`/${effectiveRole}/dashboard`); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </button>
                      {companyAccess?.hasAccess && effectiveRole !== 'company' && (
                        <button
                          onClick={() => { setProfileOpen(false); navigate('/company/dashboard'); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-accent-400 hover:bg-white/5 transition-colors"
                        >
                          <Building2 className="w-4 h-4" /> Switch to {companyAccess.company?.name || 'Company'}
                        </button>
                      )}
                      <button
                        onClick={() => { setProfileOpen(false); navigate(`/${effectiveRole}/profile`); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4" /> Profile
                      </button>
                      <button
                        onClick={() => { setProfileOpen(false); navigate(`/${effectiveRole}/settings`); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-4 h-4" /> Settings
                      </button>
                    </div>
                    <div className="border-t border-white/10 pt-1">
                      <button
                        onClick={async () => { await signOut(); navigate('/'); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                  className="px-3.5 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to={`/register?redirect=${encodeURIComponent(location.pathname)}`}
                  className="px-4 py-2 text-sm font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl transition-all shadow-md shadow-white/10"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile — theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {mounted && theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-neutral-300 hover:text-white rounded-lg bg-white/5 border border-white/10"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="absolute top-0 inset-x-0 max-h-[100dvh] overflow-y-auto bg-neutral-950 border-b border-white/10 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Main menu"
            >
              <div className="flex items-center justify-between px-5 h-16">
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 shrink-0">
                  <span className="text-xl font-display tracking-tight text-white">ZYR0</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex items-center justify-center min-w-11 min-h-11 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-5 pb-8">
                {/* User info — logged in only */}
                {user && (
                  <div className="mb-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zyro-purple to-zyro-sapphire flex items-center justify-center text-white font-semibold text-sm border border-white/20">
                        {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{user.user_metadata?.full_name || 'User'}</div>
                        <div className="text-xs text-neutral-400 truncate">{user.email}</div>
                      </div>
                    </div>
                    <Link
                      to={`/${effectiveRole}/dashboard`}
                      onClick={() => setMobileOpen(false)}
                      className="w-full py-2.5 text-center text-sm font-semibold text-black bg-white rounded-xl flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                    </Link>
                  </div>
                )}

                {/* Products — accordion */}
                <button
                  type="button"
                  onClick={() => setMobileSection(mobileSection === 'products' ? null : 'products')}
                  className="w-full flex items-center justify-between py-3 text-sm font-semibold text-white"
                >
                  <span>Products</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${mobileSection === 'products' ? 'rotate-180' : ''}`} />
                </button>
                {mobileSection === 'products' && (
                  <div className="grid grid-cols-1 gap-1.5 pb-3">
                    {productsList.map((product) => (
                      <Link
                        key={product.id}
                        to={product.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 overflow-hidden shrink-0">
                          {productLogos[product.id] ? (
                            <img src={productLogos[product.id]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-display text-xs">{product.name.charAt(4)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white">{product.name}</div>
                          <div className="text-[11px] text-neutral-400 line-clamp-1">{product.badge}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                <div className="h-px bg-white/10" />

                {/* Pricing — standalone */}
                <button
                  onClick={() => { setMobileOpen(false); scrollTo('#pricing'); }}
                  className="w-full flex items-center justify-between py-3 text-sm font-semibold text-white text-left"
                >
                  Pricing
                </button>

                <div className="h-px bg-white/10" />

                {/* Resources — accordion */}
                <button
                  type="button"
                  onClick={() => setMobileSection(mobileSection === 'resources' ? null : 'resources')}
                  className="w-full flex items-center justify-between py-3 text-sm font-semibold text-white"
                >
                  <span>Resources</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${mobileSection === 'resources' ? 'rotate-180' : ''}`} />
                </button>
                {mobileSection === 'resources' && (
                  <div className="flex flex-col gap-0.5 pb-3">
                    {resources.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 min-h-11 px-3 rounded-lg text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <item.icon className="w-4 h-4 text-neutral-400" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 border border-white/10">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}

                <div className="h-px bg-white/10" />

                {/* Company — accordion */}
                <button
                  type="button"
                  onClick={() => setMobileSection(mobileSection === 'company' ? null : 'company')}
                  className="w-full flex items-center justify-between py-3 text-sm font-semibold text-white"
                >
                  <span>Company</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${mobileSection === 'company' ? 'rotate-180' : ''}`} />
                </button>
                {mobileSection === 'company' && (
                  <div className="flex flex-col gap-0.5 pb-3">
                    {company.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center min-h-11 px-3 rounded-lg text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}

                <div className="h-px bg-white/10" />

                {/* Bottom section: account links (logged in) or auth buttons (logged out) */}
                <div className="pt-4 flex flex-col gap-2">
                  {user ? (
                    <div className="flex flex-col gap-0.5">
                      {companyAccess?.hasAccess && effectiveRole !== 'company' && (
                        <Link
                          to="/company/dashboard"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 min-h-11 px-3 rounded-lg text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Building2 className="w-4 h-4 text-neutral-400" /> Switch to {companyAccess.company?.name || 'Company'}
                        </Link>
                      )}
                      <Link
                        to={`/${effectiveRole}/profile`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 min-h-11 px-3 rounded-lg text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4 text-neutral-400" /> Profile
                      </Link>
                      <Link
                        to={`/${effectiveRole}/settings`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 min-h-11 px-3 rounded-lg text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-neutral-400" /> Settings
                      </Link>
                      <button
                        onClick={async () => { await signOut(); setMobileOpen(false); navigate('/'); }}
                        className="flex items-center gap-3 min-h-11 px-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link
                        to={`/register?redirect=${encodeURIComponent(location.pathname)}`}
                        onClick={() => setMobileOpen(false)}
                        className="w-full py-3 text-center text-sm font-semibold text-black bg-white rounded-xl shadow-lg"
                      >
                        Get Started Free
                      </Link>
                      <Link
                        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                        onClick={() => setMobileOpen(false)}
                        className="w-full py-3 text-center text-sm font-medium text-neutral-300 hover:text-white border border-white/10 rounded-xl"
                      >
                        Sign In
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </header>
  );
}
