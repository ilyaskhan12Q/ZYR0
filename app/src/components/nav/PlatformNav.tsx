import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Menu, X, Code, School,
  BrainCircuit, Briefcase, ArrowRight,
  LogOut, User, LayoutDashboard, Settings,
  Building2, LogIn, Sun, Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { useOptionalCompanyAccess } from '@/contexts/CompanyAccessContext';
import { productsList } from '@/components/platform-home/data';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code, School, BrainCircuit, Briefcase,
};

export default function PlatformNav() {
  const { user, profile, signOut } = useAuth();
  const companyAccess = useOptionalCompanyAccess();
  const effectiveRole = profile?.role || null;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProductsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsProductsOpen(false);
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen && !profileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileMenuOpen, profileOpen]);

  const handleAnchorClick = (href: string) => {
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate(`/${href}`);
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 transition-all duration-300">
        <div
          className={`max-w-7xl mx-auto rounded-2xl transition-all duration-300 border ${
            isScrolled
              ? 'bg-black/85 backdrop-blur-xl border-white/15 shadow-2xl shadow-black/80 py-3 px-5 sm:px-6'
              : 'bg-black/60 backdrop-blur-md border-white/10 py-3.5 px-5 sm:px-6'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 via-cyan-500 to-indigo-600 p-[1px] flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-black rounded-[7px] flex items-center justify-center">
                  <span className="text-white font-bold text-sm tracking-wider font-mono">Z0</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white font-mono flex items-center gap-1.5">
                  ZYR0
                  <span className="px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider bg-white/10 text-emerald-400 border border-emerald-500/20 rounded">
                    SaaS Suite
                  </span>
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Products Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProductsOpen(!isProductsOpen)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                    isProductsOpen
                      ? 'text-white bg-white/10'
                      : 'text-neutral-300 hover:text-white hover:bg-white/5'
                  }`}
                  aria-expanded={isProductsOpen}
                >
                  <span>Products</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isProductsOpen ? 'rotate-180 text-cyan-400' : 'text-neutral-400'
                    }`}
                  />
                </button>

                {isProductsOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[560px] p-3 rounded-2xl bg-neutral-950/95 border border-white/15 backdrop-blur-2xl shadow-2xl shadow-black/90 grid grid-cols-2 gap-2 animate-in fade-in zoom-in-95 duration-150">
                    {productsList.map((product) => {
                      const Icon = iconMap[product.icon?.name] || product.icon;
                      return (
                        <Link
                          key={product.id}
                          to={product.href}
                          onClick={() => setIsProductsOpen(false)}
                          className="group flex flex-col p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-105 transition-transform"
                                style={{ color: product.color }}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="font-semibold text-sm text-white group-hover:text-cyan-400 transition-colors">
                                {product.name}
                              </span>
                            </div>
                            {product.badge && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 border border-white/10">
                                {product.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <a
                href="#solutions"
                onClick={(e) => { e.preventDefault(); handleAnchorClick('#solutions'); }}
                className="px-3.5 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                Solutions
              </a>
              <a
                href="#pricing"
                onClick={(e) => { e.preventDefault(); handleAnchorClick('#pricing'); }}
                className="px-3.5 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                Pricing
              </a>
              <Link
                to="/about"
                className="px-3.5 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="px-3.5 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                Contact
              </Link>
            </nav>

            {/* Desktop Right */}
            <div className="hidden md:flex items-center gap-3">
              <button
                aria-label="Toggle color theme"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {mounted && theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
                    <span className="hidden lg:inline">{user.user_metadata?.full_name?.split(' ')[0] || 'User'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <m.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-2 w-60 bg-neutral-950/95 border border-white/15 backdrop-blur-2xl rounded-xl shadow-2xl py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-sm font-medium text-white">{user.user_metadata?.full_name || 'User'}</p>
                          <p className="text-xs text-neutral-400">{user.email}</p>
                        </div>
                        <div className="py-1">
                          {effectiveRole ? (
                            <>
                              <button
                                onClick={() => { setProfileOpen(false); navigate(`/${effectiveRole}/dashboard`); }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                              >
                                <LayoutDashboard className="w-4 h-4" /> Dashboard
                              </button>
                              {companyAccess?.hasAccess && effectiveRole !== 'company' && (
                                companyAccess.companies && companyAccess.companies.length > 1 ? (
                                  companyAccess.companies.map((c) => (
                                    <button
                                      key={c.company.id}
                                      onClick={async () => {
                                        setProfileOpen(false);
                                        try { localStorage.setItem('zyro_last_workspace', 'company'); } catch {}
                                        await companyAccess.switchCompany(c.company.id);
                                        navigate('/company/dashboard');
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-cyan-400 hover:bg-white/5 font-medium transition-colors border-t border-b border-white/10 my-1 py-2 text-left"
                                    >
                                      <Building2 className="w-4 h-4" /> Switch to {c.company.name}
                                    </button>
                                  ))
                                ) : (
                                  <button
                                    onClick={() => {
                                      setProfileOpen(false);
                                      try { localStorage.setItem('zyro_last_workspace', 'company'); } catch {}
                                      navigate('/company/dashboard');
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-cyan-400 hover:bg-white/5 font-medium transition-colors border-t border-b border-white/10 my-1 py-2"
                                  >
                                    <Building2 className="w-4 h-4" /> Switch to {companyAccess.company?.name || 'Company'}
                                  </button>
                                )
                              )}
                              <button
                                onClick={() => { setProfileOpen(false); navigate(`/${effectiveRole}/profile`); }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                              >
                                <User className="w-4 h-4" /> Profile
                              </button>
                              <button
                                onClick={() => { setProfileOpen(false); navigate(`/${effectiveRole}/settings`); }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                              >
                                <Settings className="w-4 h-4" /> Settings
                              </button>
                            </>
                          ) : (
                            <div className="px-4 py-2 text-sm text-neutral-400">Loading...</div>
                          )}
                        </div>
                        <div className="border-t border-white/10 pt-1">
                          <button
                            onClick={async () => { await signOut(); navigate('/'); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3.5 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl transition-all shadow-md shadow-white/10 hover:shadow-white/20 active:scale-95"
                  >
                    Get Started
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center gap-2">
                {!user && (
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white"
                  >
                    Sign In
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-neutral-300 hover:text-white rounded-lg bg-white/5 border border-white/10"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu Button (when not logged in on desktop - hidden, but needed for mobile) */}
            <div className="md:hidden hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-neutral-300 hover:text-white rounded-lg bg-white/5 border border-white/10"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <m.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden mt-4 pt-4 border-t border-white/10 overflow-hidden"
              >
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 px-1 mb-2">
                  Products
                </div>
                <div className="grid grid-cols-1 gap-1.5 mb-3">
                  {productsList.map((product) => {
                    const Icon = iconMap[product.icon?.name] || product.icon;
                    return (
                      <Link
                        key={product.id}
                        to={product.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5"
                            style={{ color: product.color }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{product.name}</div>
                            <div className="text-[11px] text-neutral-400">{product.badge}</div>
                          </div>
                        </div>
                        <ChevronDown className="w-4 h-4 -rotate-90 text-neutral-500" />
                      </Link>
                    );
                  })}
                </div>

                <div className="h-[1px] bg-white/10 my-1" />

                <div className="flex flex-col gap-1 text-sm font-medium text-neutral-300 py-2">
                  <a href="#solutions" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); handleAnchorClick('#solutions'); }} className="px-2 py-2 hover:text-white">Solutions</a>
                  <a href="#pricing" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); handleAnchorClick('#pricing'); }} className="px-2 py-2 hover:text-white">Pricing</a>
                  <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="px-2 py-2 hover:text-white">About Us</Link>
                  <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="px-2 py-2 hover:text-white">Contact</Link>
                </div>

                {user ? (
                  <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                    {effectiveRole ? (
                      <>
                        <Link
                          to={`/${effectiveRole}/dashboard`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full py-2.5 text-center text-sm font-semibold text-white bg-white/10 rounded-xl flex items-center justify-center gap-2"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                        </Link>
                        {companyAccess?.hasAccess && effectiveRole !== 'company' && (
                          companyAccess.companies && companyAccess.companies.length > 1 ? (
                            companyAccess.companies.map((c) => (
                              <button
                                key={c.company.id}
                                onClick={async () => {
                                  setMobileMenuOpen(false);
                                  try { localStorage.setItem('zyro_last_workspace', 'company'); } catch {}
                                  await companyAccess.switchCompany(c.company.id);
                                  navigate('/company/dashboard');
                                }}
                                className="w-full py-2.5 text-center text-sm font-medium border border-white/20 text-white rounded-xl flex items-center justify-center gap-2"
                              >
                                <Building2 className="w-4 h-4" /> Switch to {c.company.name}
                              </button>
                            ))
                          ) : (
                            <Link
                              to="/company/dashboard"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                try { localStorage.setItem('zyro_last_workspace', 'company'); } catch {}
                              }}
                              className="w-full py-2.5 text-center text-sm font-medium border border-white/20 text-white rounded-xl flex items-center justify-center gap-2"
                            >
                              <Building2 className="w-4 h-4" /> Switch to {companyAccess.company?.name || 'Company'}
                            </Link>
                          )
                        )}
                      </>
                    ) : (
                      <div className="px-4 py-2 text-sm text-neutral-400">Loading...</div>
                    )}
                    <button
                      onClick={async () => { await signOut(); setMobileMenuOpen(false); navigate('/'); }}
                      className="w-full py-2.5 text-center text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-2 w-full py-2.5 text-center text-sm font-semibold text-black bg-white rounded-xl shadow-lg"
                  >
                    Get Started Free
                  </Link>
                )}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
}
