import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Menu, X, ChevronDown, LogOut, User, LayoutDashboard,
  Briefcase, Settings, Mail, Sun, Moon,
  Linkedin, Github, Building2, LogIn, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOptionalCompanyAccess } from '@/contexts/CompanyAccessContext';
import { CommunitySocialNav } from '@/components/navigation/CommunitySocialNav';
import { SiteBannerBar } from '@/components/SiteBannerBar';
import { SITE_CONFIG } from '@/config/site';
import { WhatsAppIcon, LinkedInIcon } from '@/components/icons/BrandIcons';
import { getLastEmail } from '@/lib/auth';
import ProductsDropdown from '@/components/nav/ProductsDropdown';
import ResourcesDropdown from '@/components/nav/ResourcesDropdown';

const mobileNavLinks = [
  { label: 'Internships', href: '/internships' },
  { label: 'Research', href: '/research' },
  { label: 'About', href: '/about' },
  { label: 'Careers', href: '/careers' },
];

export default function PublicLayout() {
  const { user, profile, signOut } = useAuth();
  const companyAccess = useOptionalCompanyAccess();
  const effectiveRole = profile?.role || (user?.user_metadata?.role as string) || 'student';
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [lastEmail, setLastEmail] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [bannerVisible, setBannerVisible] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const isAuthPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/register') || location.pathname.startsWith('/forgot-password') || location.pathname.startsWith('/reset-password');

  const handleBannerVisibility = useCallback((visible: boolean) => {
    setBannerVisible(visible);
  }, []);

  useEffect(() => {
    if (!bannerVisible) {
      setHeaderHeight(0);
      return;
    }
    const el = headerRef.current;
    if (!el) return;
    const update = () => setHeaderHeight(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [bannerVisible]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Lock body scroll while a full-screen mobile sheet is open
  useEffect(() => {
    if (!mobileMenuOpen && !accountOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileMenuOpen, accountOpen]);

  if (isAuthPage) {
    return <div className="min-h-screen bg-transparent"><Outlet /></div>;
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Fixed header: optional announcement bar + navigation */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50">
        <SiteBannerBar onVisibilityChange={handleBannerVisibility} />
        <nav
          className={`transition-all duration-300 ${scrolled ? 'glass shadow-sm' : 'bg-transparent'
            }`}
        >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src="/zyro-logo.webp" alt="ZYR0 Logo" width="32" height="32" className="w-8 h-8 object-contain rounded-md" />
              </div>
              <span className="text-xl font-bold text-foreground transition-colors">
                ZYR0
              </span>
            </Link>

            {/* Desktop Center Navigation */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <ProductsDropdown scrolled={scrolled} />
              <Link
                to="/research"
                className={`text-sm font-medium transition-colors hover:text-accent text-foreground/90 dark:text-white/90 ${location.pathname === '/research' ? 'text-accent font-semibold' : ''}`}
              >
                Research
              </Link>
              <Link
                to="/about"
                className={`text-sm font-medium transition-colors hover:text-accent text-foreground/90 dark:text-white/90 ${location.pathname === '/about' ? 'text-accent font-semibold' : ''}`}
              >
                About
              </Link>
              <ResourcesDropdown scrolled={scrolled} />

              {/* Community Slot */}
              <div id="header-community-cta-slot" className="hidden lg:flex items-center gap-2 pl-4 border-l border-border/20">
                <CommunitySocialNav scrolled={scrolled} />
              </div>
            </div>

            {/* Right Side Controls / Auth */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
              <button
                aria-label="Toggle color theme"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`relative inline-flex items-center justify-center min-w-11 min-h-11 rounded-lg transition-colors ${scrolled ? 'hover:bg-muted text-foreground' : 'hover:bg-slate-900/10 text-slate-900 dark:hover:bg-white/10 dark:text-white'}`}
              >
                {mounted && theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {user ? (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      aria-haspopup="true"
                      aria-expanded={profileOpen}
                      className={`flex items-center gap-2 min-h-11 rounded-lg transition-colors ${scrolled ? 'hover:bg-muted' : 'hover:bg-slate-900/10 dark:hover:bg-white/10'}`}
                    >
                      <img src={user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User'} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <span className={`hidden sm:inline text-sm font-medium ${scrolled ? 'text-foreground' : 'text-slate-900 dark:text-white'}`}>
                        {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                      </span>
                      <ChevronDown className={`hidden sm:block w-4 h-4 ${scrolled ? 'text-muted-foreground' : 'text-slate-900/70 dark:text-white/70'}`} />
                    </button>
                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-1.5rem)] bg-card rounded-xl border border-border shadow-lg py-2 z-50"
                        >
                          <div className="px-4 py-3 border-b border-border">
                            <p className="text-sm font-medium">{user.user_metadata?.full_name || 'User'}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                          <div className="py-1">
                            <button onClick={() => { setProfileOpen(false); navigate(`/${effectiveRole}/dashboard`); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                              <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </button>
                            {companyAccess?.hasAccess && effectiveRole !== 'company' && (
                              <button onClick={() => { setProfileOpen(false); navigate('/company/dashboard'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-accent hover:bg-accent/10 font-medium transition-colors border-t border-b border-border my-1 py-2">
                                <Building2 className="w-4 h-4 text-accent" /> Switch to {companyAccess.company?.name || 'Company'} Workspace
                              </button>
                            )}
                            <button onClick={() => { setProfileOpen(false); navigate(`/${effectiveRole}/profile`); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                              <User className="w-4 h-4" /> Profile
                            </button>
                            <button onClick={() => { setProfileOpen(false); navigate(`/${effectiveRole}/settings`); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                              <Settings className="w-4 h-4" /> Settings
                            </button>
                          </div>
                          <div className="border-t border-border pt-1">
                            <button onClick={async () => { await signOut(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                              <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex items-center text-sm font-medium text-foreground hover:text-accent transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:inline-flex items-center text-sm font-medium bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors"
                  >
                    Get Started
                  </Link>
                  <button
                    onClick={() => { setLastEmail(getLastEmail()); setAccountOpen(true); }}
                    aria-haspopup="true"
                    aria-expanded={accountOpen}
                    className="md:hidden inline-flex items-center gap-1.5 min-h-11 px-3 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Log in
                  </button>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-haspopup="true"
                aria-expanded={mobileMenuOpen}
                className="md:hidden inline-flex items-center justify-center min-w-11 min-h-11 rounded-lg text-foreground hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        </nav>
      </header>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] md:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="absolute top-0 inset-x-0 max-h-[100dvh] overflow-y-auto bg-card border-b border-border shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-label="Main menu"
            >
              <div className="flex items-center justify-between px-4 h-16">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img src="/zyro-logo.webp" alt="ZYR0 Logo" width="32" height="32" className="w-8 h-8 object-contain rounded-md" />
                  </div>
                  <span className="text-xl font-bold text-foreground">ZYR0</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex items-center justify-center min-w-11 min-h-11 rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="px-4 pb-8">
                <nav className="flex flex-col">
                  {mobileNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center min-h-12 px-4 rounded-lg text-base font-medium transition-colors ${location.pathname === link.href ? 'text-accent bg-accent/5' : 'text-foreground hover:bg-muted'}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div id="mobile-community-cta-slot" className="pt-3 mt-3 border-t border-border">
                  <CommunitySocialNav mobile />
                </div>

                <div className="pt-3 mt-3 border-t border-border flex flex-col gap-2">
                  {user ? (
                    <>
                      <Link
                        to={`/${effectiveRole}/dashboard`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2.5 min-h-11 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                      </Link>
                      {companyAccess?.hasAccess && effectiveRole !== 'company' && (
                        <Link
                          to="/company/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full text-center py-2.5 min-h-11 rounded-lg text-sm font-medium border border-accent text-accent hover:bg-accent/10 transition-colors flex items-center justify-center gap-2"
                        >
                          <Building2 className="w-4 h-4" /> Switch to {companyAccess.company?.name || 'Company'} Workspace
                        </Link>
                      )}
                      <div className="pt-2 border-t border-border flex flex-col gap-1">
                        <Link
                          to={`/${effectiveRole}/profile`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 min-h-11 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          <User className="w-4 h-4 text-muted-foreground" /> Profile
                        </Link>
                        <Link
                          to={`/${effectiveRole}/settings`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 min-h-11 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          <Settings className="w-4 h-4 text-muted-foreground" /> Settings
                        </Link>
                        <button
                          onClick={async () => { await signOut(); navigate('/'); }}
                          className="flex items-center gap-3 px-4 py-2.5 min-h-11 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 text-center py-2.5 min-h-11 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-4 h-4" /> Log in
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 text-center py-2.5 min-h-11 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors flex items-center justify-center"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen mobile account sheet (logged out) */}
      <AnimatePresence>
        {accountOpen && !user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] md:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setAccountOpen(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute bottom-0 inset-x-0 max-h-[85vh] overflow-y-auto bg-card rounded-t-2xl border-t border-border shadow-2xl p-6 pb-8"
              role="dialog"
              aria-modal="true"
              aria-label="Sign in"
            >
              <div className="flex items-start justify-between mb-1">
                <h2 className="text-xl font-bold text-foreground">{lastEmail ? 'Welcome back' : 'Sign in to ZYR0'}</h2>
                <button
                  onClick={() => setAccountOpen(false)}
                  aria-label="Close"
                  className="inline-flex items-center justify-center min-w-11 min-h-11 rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Sign in to your account or create a new one.</p>

              {lastEmail && (
                <>
                  <button
                    onClick={() => navigate(`/login?email=${encodeURIComponent(lastEmail)}`)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white/80">Continue as</p>
                      <p className="text-sm font-semibold truncate">{lastEmail}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                  <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex-1 h-px bg-border" />
                    or
                    <div className="flex-1 h-px bg-border" />
                  </div>
                </>
              )}

              <Link
                to="/login"
                className={`w-full flex items-center justify-center gap-2 min-h-12 rounded-xl text-sm font-medium transition-colors ${lastEmail ? 'border border-border hover:bg-muted text-foreground' : 'bg-accent text-white font-semibold hover:bg-accent/90'}`}
              >
                <LogIn className="w-4 h-4" /> {lastEmail ? 'Use another account' : 'Log in'}
              </Link>
              <Link
                to="/register"
                className={`mt-3 w-full flex items-center justify-center gap-2 min-h-12 rounded-xl text-sm font-medium transition-colors ${lastEmail ? 'bg-accent text-white font-semibold hover:bg-accent/90' : 'border border-border hover:bg-muted text-foreground'}`}
              >
                Create a new account
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className="relative z-10"
        style={bannerVisible ? { paddingTop: headerHeight } : undefined}
      >
        <Outlet />
      </main>

      {/* Footer (hidden on auth pages) */}
      {!isAuthPage && (
        <footer className="bg-white/75 dark:bg-slate-900/60 backdrop-blur-md text-slate-900 dark:text-slate-200 border-t border-slate-200 dark:border-white/10 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {/* Brand */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img src="/zyro-logo.webp" alt="ZYR0 Logo" width="32" height="32" className="w-8 h-8 object-contain rounded-md" />
                  </div>
                  <span className="text-xl font-bold">ZYR0</span>
                </div>
                <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed">
                  A professional internship platform connecting students, companies, and mentors through a structured internship lifecycle.
                </p>
                <div className="flex items-center gap-4 mt-6">
                  <a
                    href={SITE_CONFIG.social.whatsappChannel}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="ZYR0 WhatsApp Channel"
                    title="Join ZYR0 WhatsApp Channel for instant announcements"
                    className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-500 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-current" />
                  </a>
                  <a
                    href={SITE_CONFIG.social.whatsappSupportGroup}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="ZYR0 WhatsApp Support Group"
                    title="Join ZYR0 WhatsApp Support Group for help & discussions"
                    className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-500 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-current" />
                  </a>
                  <a
                    href={SITE_CONFIG.social.linkedinCompany}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    title="LinkedIn Page"
                    className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center hover:bg-blue-600 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
                  >
                    <LinkedInIcon className="w-4 h-4 fill-current" />
                  </a>
                  <a href="https://ilyaskhan12q.github.io/portfolio" target="_blank" rel="noopener noreferrer" aria-label="Portfolio" className="text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href={`mailto:${SITE_CONFIG.supportEmail}`} aria-label="Email support" className="text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Students */}
              <div>
                <h4 className="font-semibold mb-4">For Students</h4>
                <ul className="space-y-2.5">
                  <li><Link to="/internships" className="text-slate-600 dark:text-white/60 text-sm hover:text-slate-900 dark:hover:text-white transition-colors">Browse Internships</Link></li>
                  <li><Link to="/student/applications" className="text-slate-600 dark:text-white/60 text-sm hover:text-slate-900 dark:hover:text-white transition-colors">My Applications</Link></li>
                  <li><Link to="/student/workspace" className="text-slate-600 dark:text-white/60 text-sm hover:text-slate-900 dark:hover:text-white transition-colors">Workspace</Link></li>
                  <li><Link to="/student/certificates" className="text-slate-600 dark:text-white/60 text-sm hover:text-slate-900 dark:hover:text-white transition-colors">Certificates</Link></li>
                  <li><Link to="/verify" className="text-slate-600 dark:text-white/60 text-sm hover:text-slate-900 dark:hover:text-white transition-colors">Verify Certificate</Link></li>
                </ul>
              </div>

              {/* Companies */}
              <div>
                <h4 className="font-semibold mb-4">For Companies</h4>
                <ul className="space-y-2.5">
                  <li><Link to="/company/internships/new" className="text-slate-600 dark:text-white/60 text-sm hover:text-slate-900 dark:hover:text-white transition-colors">Post Internship</Link></li>
                  <li><Link to="/company/dashboard" className="text-slate-600 dark:text-white/60 text-sm hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link></li>
                  <li><Link to="/companies" className="text-slate-600 dark:text-white/60 text-sm hover:text-slate-900 dark:hover:text-white transition-colors">Browse Companies</Link></li>
                  <li><Link to="/careers" className="text-slate-600 dark:text-white/60 text-sm hover:text-slate-900 dark:hover:text-white transition-colors">Careers</Link></li>
                </ul>
              </div>

              {/* Community & Support */}
              <div>
                <h4 className="font-semibold mb-4">Community & Support</h4>
                <ul className="space-y-2.5">
                  <li>
                    <a
                      href={SITE_CONFIG.social.whatsappChannel}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 font-medium text-sm hover:underline inline-flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      WhatsApp Channel
                    </a>
                  </li>
                  <li>
                    <a
                      href={SITE_CONFIG.social.whatsappSupportGroup}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 font-medium text-sm hover:underline inline-flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      WhatsApp Support Group
                    </a>
                  </li>
                  <li>
                    <a
                      href={SITE_CONFIG.social.linkedinCompany}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 font-medium text-sm hover:underline inline-flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      LinkedIn Page
                    </a>
                  </li>
                  <li><Link to="/help" className="text-slate-600 dark:text-white/60 text-sm hover:text-slate-900 dark:hover:text-white transition-colors">Help Center</Link></li>
                  <li><Link to="/faq" className="text-slate-600 dark:text-white/60 text-sm hover:text-slate-900 dark:hover:text-white transition-colors">FAQ</Link></li>
                  <li><Link to="/contact" className="text-slate-600 dark:text-white/60 text-sm hover:text-slate-900 dark:hover:text-white transition-colors">Contact Us</Link></li>
                  <li><Link to="/privacy" className="text-slate-600 dark:text-white/60 text-sm hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-slate-600 dark:text-white/60 text-sm hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link to="/cookies" className="text-slate-600 dark:text-white/60 text-sm hover:text-slate-900 dark:hover:text-white transition-colors">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-slate-500 dark:text-white/40 text-sm">&copy; 2026 ZYR0. All rights reserved.</p>
              <p className="text-slate-500 dark:text-white/40 text-sm">Designed for the modern workforce.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
