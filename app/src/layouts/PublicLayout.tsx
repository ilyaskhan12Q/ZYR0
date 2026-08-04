import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Menu, X, Bell, ChevronDown, LogOut, User, LayoutDashboard,
  Briefcase, Settings, Mail, Sun, Moon,
  Linkedin, Github
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CommunitySocialNav } from '@/components/navigation/CommunitySocialNav';
import { SiteBannerBar } from '@/components/SiteBannerBar';
import { SITE_CONFIG } from '@/config/site';
import { WhatsAppIcon, LinkedInIcon } from '@/components/icons/BrandIcons';
const navLinks = [
  { label: 'Internships', href: '/internships' },
  { label: 'Companies', href: '/companies' },
  { label: 'Verify', href: '/verify' },
  { label: 'About', href: '/about' },
  { label: 'Careers', href: '/careers' },
];

export default function PublicLayout() {
  const { user, profile, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  }, [location.pathname]);

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

            {/* Desktop Center Navigation & Community Slot */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-colors hover:text-accent relative group text-foreground/90 dark:text-white/90 ${location.pathname === link.href ? 'text-accent font-semibold' : ''}`}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-200 group-hover:w-full" />
                </Link>
              ))}

              {/* Reserved Community/Social CTA Container Slot */}
              <div id="header-community-cta-slot" className="hidden lg:flex items-center gap-2 pl-4 border-l border-border/20">
                <CommunitySocialNav scrolled={scrolled} />
              </div>
            </div>

            {/* Right Side Controls / Auth */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4 shrink-0">
              <button
                aria-label="Toggle color theme"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`relative p-2 rounded-lg transition-colors ${scrolled ? 'hover:bg-muted text-foreground' : 'hover:bg-slate-900/10 text-slate-900 dark:hover:bg-white/10 dark:text-white'}`}
              >
                {mounted && theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {user ? (
                <>
                  <button className={`relative p-2 rounded-lg transition-colors ${scrolled ? 'hover:bg-muted text-foreground' : 'hover:bg-slate-900/10 text-slate-900 dark:hover:bg-white/10 dark:text-white'}`}>
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${scrolled ? 'hover:bg-muted' : 'hover:bg-slate-900/10 dark:hover:bg-white/10'}`}
                    >
                      <img src={user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User'} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <span className={`text-sm font-medium ${scrolled ? 'text-foreground' : 'text-slate-900 dark:text-white'}`}>
                        {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                      </span>
                      <ChevronDown className={`w-4 h-4 ${scrolled ? 'text-muted-foreground' : 'text-slate-900/70 dark:text-white/70'}`} />
                    </button>
                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute right-0 mt-2 w-56 bg-card rounded-xl border border-border shadow-lg py-2 z-50"
                        >
                          <div className="px-4 py-3 border-b border-border">
                            <p className="text-sm font-medium">{user.user_metadata?.full_name || 'User'}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                          <div className="py-1">
                            <button onClick={() => navigate(`/${profile?.role || 'student'}/dashboard`)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                              <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </button>
                            <button onClick={() => navigate(`/${profile?.role || 'student'}/profile`)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                              <User className="w-4 h-4" /> Profile
                            </button>
                            <button onClick={() => navigate(`/${profile?.role || 'student'}/settings`)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
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
                    className="text-sm font-medium text-foreground hover:text-accent transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-foreground hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-card border-t border-border overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block px-4 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Mobile Community CTA Slot */}
                <div id="mobile-community-cta-slot" className="pt-2 border-t border-border">
                  <CommunitySocialNav mobile />
                </div>

                <div className="pt-3 border-t border-border flex gap-3">
                  <Link to="/login" className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors">
                    Log in
                  </Link>
                  <Link to="/register" className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors">
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </nav>
      </header>

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
