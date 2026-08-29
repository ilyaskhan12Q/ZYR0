import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown, LogOut, User, LayoutDashboard, Settings,
  Building2, Sun, Moon, HelpCircle, MessageCircle, BookOpen,
  Shield, FileText, Cookie, BadgeCheck
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { useOptionalCompanyAccess } from '@/contexts/CompanyAccessContext';
import { productsList } from '@/components/platform-home/data';

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
  const [profileOpen, setProfileOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
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
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
      style={{
        background: scrolled ? 'var(--zyro-bg)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--zyro-border)' : '1px solid transparent',
      }}
    >
      <div className="max-w-[1264px] mx-auto px-6 md:px-16 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span
            className="text-xl font-display tracking-tight"
            style={{ color: 'var(--zyro-text)' }}
          >
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
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150"
              style={{ color: productsOpen ? 'var(--zyro-text)' : 'var(--zyro-text-secondary)' }}
            >
              Products
              <ChevronDown
                className="w-3.5 h-3.5 transition-transform duration-200"
                style={{
                  transform: productsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  color: 'var(--zyro-text-muted)',
                }}
              />
            </button>

            {productsOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-[340px] sm:w-[480px] p-2 rounded-xl border backdrop-blur-xl z-50"
                style={{
                  background: 'color-mix(in srgb, var(--zyro-surface) 85%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--zyro-border) 50%, transparent)',
                  boxShadow: '0 8px 30px -4px rgba(0,0,0,0.12), 0 0 0 0 transparent',
                }}
              >
                <div className="absolute inset-x-0 top-0 h-px rounded-t-xl" style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--zyro-accent) 40%, transparent), transparent)' }} />
                {productsList.map((product) => (
                  <Link
                    key={product.id}
                    to={product.href}
                    onClick={() => setProductsOpen(false)}
                    className="flex items-start gap-3 p-3 rounded-lg transition-all duration-150 group"
                    style={{ color: 'var(--zyro-text)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
                      style={{ background: 'var(--zyro-accent-muted)' }}
                    >
                      <span
                        className="font-display text-sm"
                        style={{ color: 'var(--zyro-accent)' }}
                      >
                        {product.name.charAt(4)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium group-hover:text-[var(--zyro-accent)] transition-colors">{product.name}</span>
                        {product.badge && (
                          <span
                            className="font-label text-[9px] tracking-[0.1em] px-1.5 py-0.5 rounded"
                            style={{
                              background: 'var(--zyro-elevated)',
                              color: 'var(--zyro-text-muted)',
                            }}
                          >
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs leading-relaxed line-clamp-2"
                        style={{ color: 'var(--zyro-text-muted)' }}
                      >
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
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150"
            style={{ color: 'var(--zyro-text-secondary)' }}
          >
            Pricing
          </button>

          {/* Resources */}
          <div className="relative" ref={resourcesRef}>
            <button
              type="button"
              onClick={() => { setResourcesOpen(!resourcesOpen); setProductsOpen(false); setCompanyOpen(false); }}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150"
              style={{ color: resourcesOpen ? 'var(--zyro-text)' : 'var(--zyro-text-secondary)' }}
            >
              Resources
              <ChevronDown
                className="w-3.5 h-3.5 transition-transform duration-200"
                style={{
                  transform: resourcesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  color: 'var(--zyro-text-muted)',
                }}
              />
            </button>

            {resourcesOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-[240px] p-1.5 rounded-xl border backdrop-blur-xl z-50"
                style={{
                  background: 'color-mix(in srgb, var(--zyro-surface) 85%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--zyro-border) 50%, transparent)',
                  boxShadow: '0 8px 30px -4px rgba(0,0,0,0.12), 0 0 0 0 transparent',
                }}
              >
                <div className="absolute inset-x-0 top-0 h-px rounded-t-xl" style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--zyro-accent) 40%, transparent), transparent)' }} />
                {resources.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setResourcesOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all duration-150 group"
                    style={{ color: 'var(--zyro-text-secondary)' }}
                  >
                    <item.icon className="w-4 h-4 transition-colors group-hover:text-[var(--zyro-accent)]" style={{ color: 'var(--zyro-text-muted)' }} />
                    <span className="flex-1 group-hover:text-[var(--zyro-text)] transition-colors">{item.label}</span>
                    {item.badge && (
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
                ))}
              </div>
            )}
          </div>

          {/* Company */}
          <div className="relative" ref={companyRef}>
            <button
              type="button"
              onClick={() => { setCompanyOpen(!companyOpen); setProductsOpen(false); setResourcesOpen(false); }}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150"
              style={{ color: companyOpen ? 'var(--zyro-text)' : 'var(--zyro-text-secondary)' }}
            >
              Company
              <ChevronDown
                className="w-3.5 h-3.5 transition-transform duration-200"
                style={{
                  transform: companyOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  color: 'var(--zyro-text-muted)',
                }}
              />
            </button>

            {companyOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-[200px] p-1.5 rounded-xl border backdrop-blur-xl z-50"
                style={{
                  background: 'color-mix(in srgb, var(--zyro-surface) 85%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--zyro-border) 50%, transparent)',
                  boxShadow: '0 8px 30px -4px rgba(0,0,0,0.12), 0 0 0 0 transparent',
                }}
              >
                <div className="absolute inset-x-0 top-0 h-px rounded-t-xl" style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--zyro-accent) 40%, transparent), transparent)' }} />
                {company.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setCompanyOpen(false)}
                    className="block px-3 py-2 text-sm rounded-lg transition-all duration-150 group"
                    style={{ color: 'var(--zyro-text-secondary)' }}
                  >
                    <span className="group-hover:text-[var(--zyro-text)] transition-colors">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-2">
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg transition-colors duration-150"
            style={{ color: 'var(--zyro-text-muted)' }}
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
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-150"
                style={{ color: 'var(--zyro-text-secondary)' }}
              >
                <img
                  src={user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User'}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="hidden lg:inline text-sm">
                  {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                </span>
                <ChevronDown
                  className="w-3.5 h-3.5 transition-transform duration-200"
                  style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {profileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border backdrop-blur-xl py-1 z-50"
                  style={{
                    background: 'color-mix(in srgb, var(--zyro-surface) 85%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--zyro-border) 50%, transparent)',
                    boxShadow: '0 8px 30px -4px rgba(0,0,0,0.12), 0 0 0 0 transparent',
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-px rounded-t-xl" style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--zyro-accent) 40%, transparent), transparent)' }} />
                  <div
                    className="px-4 py-3 border-b"
                    style={{ borderColor: 'var(--zyro-border)' }}
                  >
                    <p className="text-sm font-medium" style={{ color: 'var(--zyro-text)' }}>
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--zyro-text-muted)' }}>
                      {user.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { setProfileOpen(false); navigate(`/${effectiveRole}/dashboard`); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors duration-150"
                      style={{ color: 'var(--zyro-text-secondary)' }}
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </button>
                    {companyAccess?.hasAccess && effectiveRole !== 'company' && (
                      <button
                        onClick={() => { setProfileOpen(false); navigate('/company/dashboard'); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-colors duration-150"
                        style={{ color: 'var(--zyro-accent)' }}
                      >
                        <Building2 className="w-4 h-4" /> Switch to {companyAccess.company?.name || 'Company'}
                      </button>
                    )}
                    <button
                      onClick={() => { setProfileOpen(false); navigate(`/${effectiveRole}/profile`); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors duration-150"
                      style={{ color: 'var(--zyro-text-secondary)' }}
                    >
                      <User className="w-4 h-4" /> Profile
                    </button>
                    <button
                      onClick={() => { setProfileOpen(false); navigate(`/${effectiveRole}/settings`); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors duration-150"
                      style={{ color: 'var(--zyro-text-secondary)' }}
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                  </div>
                  <div className="border-t pt-1" style={{ borderColor: 'var(--zyro-border)' }}>
                    <button
                      onClick={async () => { await signOut(); navigate('/'); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-500/5 transition-colors duration-150"
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
                to="/login"
                className="px-3 py-2 text-sm font-medium transition-colors duration-150"
                style={{ color: 'var(--zyro-text-secondary)' }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={{
                  background: 'var(--zyro-accent)',
                  color: '#FFFFFF',
                }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile — theme toggle + hamburger */}
        <div className="md:hidden flex items-center gap-1">
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg"
            style={{ color: 'var(--zyro-text-muted)' }}
          >
            {mounted && theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg"
            style={{ color: 'var(--zyro-text-secondary)' }}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <div className="w-5 h-5 flex flex-col justify-center gap-1">
              <span
                className="block h-[1.5px] rounded-full transition-all duration-200"
                style={{
                  background: 'currentColor',
                  transform: mobileOpen ? 'rotate(45deg) translateY(0)' : 'none',
                }}
              />
              <span
                className="block h-[1.5px] rounded-full transition-all duration-200"
                style={{
                  background: 'currentColor',
                  opacity: mobileOpen ? 0 : 1,
                }}
              />
              <span
                className="block h-[1.5px] rounded-full transition-all duration-200"
                style={{
                  background: 'currentColor',
                  transform: mobileOpen ? 'rotate(-45deg) translateY(0)' : 'none',
                }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{
            background: 'var(--zyro-bg)',
            borderColor: 'var(--zyro-border)',
          }}
        >
          <div className="max-w-[1264px] mx-auto px-6 py-6 space-y-6">
            {/* Products */}
            <div>
              <p
                className="font-label text-[10px] tracking-[0.2em] uppercase mb-3"
                style={{ color: 'var(--zyro-text-muted)' }}
              >
                Products
              </p>
              <div className="space-y-1">
                {productsList.map((product) => (
                  <Link
                    key={product.id}
                    to={product.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg transition-colors duration-150"
                    style={{ color: 'var(--zyro-text)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'var(--zyro-accent-muted)' }}
                    >
                      <span
                        className="font-display text-sm"
                        style={{ color: 'var(--zyro-accent)' }}
                      >
                        {product.name.charAt(4)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{product.name}</div>
                      <div className="text-xs" style={{ color: 'var(--zyro-text-muted)' }}>
                        {product.badge}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <button
              onClick={() => { setMobileOpen(false); scrollTo('#pricing'); }}
              className="block w-full text-left px-3 py-2 text-sm font-medium rounded-lg"
              style={{ color: 'var(--zyro-text-secondary)' }}
            >
              Pricing
            </button>

            {/* Resources */}
            <div>
              <p
                className="font-label text-[10px] tracking-[0.2em] uppercase mb-3"
                style={{ color: 'var(--zyro-text-muted)' }}
              >
                Resources
              </p>
              <div className="space-y-1">
                {resources.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors duration-150"
                    style={{ color: 'var(--zyro-text-secondary)' }}
                  >
                    <item.icon className="w-4 h-4" style={{ color: 'var(--zyro-text-muted)' }} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
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
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <p
                className="font-label text-[10px] tracking-[0.2em] uppercase mb-3"
                style={{ color: 'var(--zyro-text-muted)' }}
              >
                Company
              </p>
              <div className="space-y-1">
                {company.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-sm rounded-lg transition-colors duration-150"
                    style={{ color: 'var(--zyro-text-secondary)' }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Auth */}
            {user ? (
              <div className="space-y-2 pt-4 border-t" style={{ borderColor: 'var(--zyro-border)' }}>
                <Link
                  to={`/${effectiveRole}/dashboard`}
                  onClick={() => setMobileOpen(false)}
                  className="block w-full py-2.5 text-center text-sm font-medium rounded-lg"
                  style={{ background: 'var(--zyro-accent)', color: '#FFFFFF' }}
                >
                  Go to Dashboard
                </Link>
                {companyAccess?.hasAccess && effectiveRole !== 'company' && (
                  <Link
                    to="/company/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full py-2.5 text-center text-sm font-medium rounded-lg border"
                    style={{ borderColor: 'var(--zyro-border)', color: 'var(--zyro-text-secondary)' }}
                  >
                    Switch to {companyAccess.company?.name || 'Company'}
                  </Link>
                )}
                <button
                  onClick={async () => { await signOut(); setMobileOpen(false); navigate('/'); }}
                  className="w-full py-2.5 text-center text-sm font-medium text-red-500 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-4 border-t" style={{ borderColor: 'var(--zyro-border)' }}>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full py-2.5 text-center text-sm font-medium rounded-lg"
                  style={{ background: 'var(--zyro-accent)', color: '#FFFFFF' }}
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full py-2.5 text-center text-sm font-medium rounded-lg border"
                  style={{ borderColor: 'var(--zyro-border)', color: 'var(--zyro-text-secondary)' }}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
