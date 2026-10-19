import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Menu, X, ChevronDown, LogOut, User, LayoutDashboard,
  Settings, Sun, Moon, Building2, LogIn, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOptionalCompanyAccess } from '@/contexts/CompanyAccessContext';
import { productsNav, resourcesNav, companyNav } from '@/config/navigation';

// Dark translucent glass pill (the "/" look): blur layer over the hero so the
// page background bleeds through and the nav feels part of the page, not on top
// of it. Frosts denser on scroll for readability over busy content.
// Padding stays constant across both states: the height drives the page's top
// offset (--zyro-header-h), so a scrolled shrink would shift the whole page.
const pillClass = (scrolled: boolean) =>
  `rounded-2xl border backdrop-blur-xl transition-all duration-300 flex items-center justify-between gap-3 px-4 sm:px-5 py-3 ${
    scrolled
      ? 'bg-black/85 dark:bg-black/85 border-white/15 shadow-2xl shadow-black/80'
      : 'bg-black/50 dark:bg-black/40 border-white/10 shadow-lg shadow-black/40'
  }`;

const triggerClass = (open: boolean) =>
  `flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
    open
      ? 'text-white bg-white/10'
      : 'text-neutral-300 hover:text-white hover:bg-white/5'
  }`;

const panelClass = (width: string, align: 'left' | 'right' = 'left') =>
  `absolute top-full ${align === 'left' ? 'left-0' : 'right-0'} mt-2 ${width} bg-card rounded-xl border border-border shadow-2xl backdrop-blur-xl p-1.5 z-50`;

const menuItemClass =
  'flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-foreground/90 hover:bg-muted/70 hover:text-foreground transition-colors w-full text-left';

function Badge({ text }: { text: string }) {
  return (
    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
      {text}
    </span>
  );
}

export default function SiteNav() {
  const { user, profile, profileLoaded, signOut } = useAuth();
  const companyAccess = useOptionalCompanyAccess();
  const effectiveRole = profile?.role || null;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<'products' | 'resources' | 'company' | 'profile' | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<'products' | 'resources' | 'company' | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
    setMobileSection(null);
  }, [location.pathname]);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpenMenu(null); setMobileOpen(false); }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Lock body scroll while mobile sheet is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  const toggle = (menu: typeof openMenu) => setOpenMenu(openMenu === menu ? null : menu);

  const switchToCompany = async (companyId?: string) => {
    setOpenMenu(null);
    setMobileOpen(false);
    try { localStorage.setItem('zyro_last_workspace', 'company'); } catch { /* ignore */ }
    if (companyId && companyAccess) await companyAccess.switchCompany(companyId);
    navigate('/company/dashboard');
  };

  const redirect = encodeURIComponent(location.pathname);

  const dropdownButton = (id: 'products' | 'resources' | 'company', label: string) => (
    <button
      type="button"
      onClick={() => toggle(id)}
      onMouseEnter={() => setOpenMenu(id)}
      aria-haspopup="true"
      aria-expanded={openMenu === id}
      aria-controls={`nav-${id}-menu`}
      className={triggerClass(openMenu === id)}
    >
      {label}
      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === id ? 'rotate-180' : ''}`} />
    </button>
  );

  return (
    <div ref={navRef} className="pointer-events-none relative">
      {/* Desktop / tablet pill */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pointer-events-auto">
        <div className={pillClass(scrolled)}>
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/zyro-logo.webp" alt="" width="28" height="28" className="w-7 h-7 object-contain rounded-md" />
            <span className="text-xl font-display tracking-tight text-white">ZYR0</span>
          </Link>

          <nav className="flex items-center gap-0.5" aria-label="Primary">
            <div className="relative">
              {dropdownButton('products', 'Products')}
              <AnimatePresence>
                {openMenu === 'products' && (
                  <m.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    id="nav-products-menu"
                    className={panelClass('w-[340px] sm:w-[420px]')}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent rounded-t-xl" />
                    {productsNav.map((product) => (
                      <Link
                        key={product.id}
                        to={product.href}
                        onClick={() => setOpenMenu(null)}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/70 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-muted ring-1 ring-border flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                          {product.logo ? (
                            <img src={product.logo} alt="" className="w-full h-full object-cover" />
                          ) : product.icon ? (
                            <product.icon className="w-5 h-5 text-accent" />
                          ) : (
                            <span className="font-display text-sm text-muted-foreground">{product.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{product.name}</span>
                            {product.badge && <Badge text={product.badge} />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{product.description}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 mt-1 shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ))}
                  </m.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/pricing"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${location.pathname === '/pricing' ? 'text-accent bg-accent/10' : triggerClass(false)}`}
            >
              Pricing
            </Link>

            <div className="relative">
              {dropdownButton('company', 'Company')}
              <AnimatePresence>
                {openMenu === 'company' && (
                  <m.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    id="nav-company-menu"
                    className={panelClass('w-[220px]')}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent rounded-t-xl" />
                    {companyNav.map((item) => (
                      <Link key={item.href} to={item.href} onClick={() => setOpenMenu(null)} className={menuItemClass}>
                        {item.icon && <item.icon className="w-4 h-4 text-muted-foreground" />}
                        <span className="flex-1">{item.label}</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                      </Link>
                    ))}
                  </m.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              {dropdownButton('resources', 'Resources')}
              <AnimatePresence>
                {openMenu === 'resources' && (
                  <m.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    id="nav-resources-menu"
                    className={panelClass('w-[250px]', 'right')}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent rounded-t-xl" />
                    {resourcesNav.map((item) => (
                      <Link key={item.href} to={item.href} onClick={() => setOpenMenu(null)} className={menuItemClass}>
                        {item.icon && <item.icon className="w-4 h-4 text-muted-foreground" />}
                        <span className="flex-1">{item.label}</span>
                        {item.badge && <Badge text={item.badge} />}
                      </Link>
                    ))}
                  </m.div>
                )}
              </AnimatePresence>
            </div>

          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              aria-label="Toggle color theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="inline-flex items-center justify-center min-w-10 min-h-10 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {mounted && theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => toggle('profile')}
                  aria-haspopup="true"
                  aria-expanded={openMenu === 'profile'}
                  aria-controls="nav-profile-menu"
                  className={triggerClass(openMenu === 'profile')}
                >
                  <img
                    src={user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User'}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="hidden lg:inline max-w-[10ch] truncate">
                    {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === 'profile' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openMenu === 'profile' && (
                    <m.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      id="nav-profile-menu"
                      className={panelClass('w-60', 'right')}
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-foreground">{user.user_metadata?.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        {effectiveRole ? (
                          <>
                            <button onClick={() => { setOpenMenu(null); navigate(`/${effectiveRole}/dashboard`); }} className={menuItemClass}>
                              <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> Dashboard
                            </button>
                            {companyAccess?.hasAccess && effectiveRole !== 'company' && (
                              companyAccess.companies && companyAccess.companies.length > 1 ? (
                                companyAccess.companies.map((c) => (
                                  <button key={c.company.id} onClick={() => switchToCompany(c.company.id)} className={`${menuItemClass} text-accent font-medium`}>
                                    <Building2 className="w-4 h-4" /> Switch to {c.company.name}
                                  </button>
                                ))
                              ) : (
                                <button onClick={() => switchToCompany()} className={`${menuItemClass} text-accent font-medium border-y border-border my-1`}>
                                  <Building2 className="w-4 h-4" /> Switch to {companyAccess.company?.name || 'Company'}
                                </button>
                              )
                            )}
                            <button onClick={() => { setOpenMenu(null); navigate(`/${effectiveRole}/profile`); }} className={menuItemClass}>
                              <User className="w-4 h-4 text-muted-foreground" /> Profile
                            </button>
                            <button onClick={() => { setOpenMenu(null); navigate(`/${effectiveRole}/settings`); }} className={menuItemClass}>
                              <Settings className="w-4 h-4 text-muted-foreground" /> Settings
                            </button>
                          </>
                        ) : (
                          <div className="px-4 py-2 text-sm text-muted-foreground">
                            {profileLoaded ? 'Account' : 'Loading...'}
                          </div>
                        )}
                      </div>
                      <div className="border-t border-border pt-1">
                        <button
                          onClick={async () => { setOpenMenu(null); await signOut(); navigate('/'); }}
                          className={`${menuItemClass} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30`}
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
                  to={`/login?redirect=${redirect}`}
                  className="px-3.5 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to={`/register?redirect=${redirect}`}
                  className="px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent/90 rounded-xl transition-colors shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile compact pill */}
      <div className="md:hidden max-w-7xl mx-auto px-4 pt-4 pointer-events-auto">
        <div className={pillClass(scrolled)}>
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/zyro-logo.webp" alt="" width="24" height="24" className="w-6 h-6 object-contain rounded-md" />
            <span className="text-lg font-display tracking-tight text-white">ZYR0</span>
          </Link>
          <div className="flex items-center gap-1">
            <button
              aria-label="Toggle color theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="inline-flex items-center justify-center min-w-10 min-h-10 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {mounted && theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-haspopup="true"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-sheet"
              className="inline-flex items-center justify-center min-w-10 min-h-10 rounded-lg text-white bg-white/10 border border-white/15 hover:bg-white/20 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile full-screen sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] md:hidden pointer-events-auto"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <m.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              id="mobile-nav-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Main menu"
              className="absolute top-0 inset-x-0 max-h-[100dvh] overflow-y-auto bg-card border-b border-border shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 h-16">
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                  <img src="/zyro-logo.webp" alt="" width="24" height="24" className="w-6 h-6 object-contain rounded-md" />
                  <span className="text-lg font-display tracking-tight text-foreground">ZYR0</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex items-center justify-center min-w-11 min-h-11 rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="px-5 pb-8">
                {/* Logged-in user card */}
                {user && (
                  <div className="mb-4 p-4 rounded-2xl bg-muted/60 border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User'}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">{user.user_metadata?.full_name || 'User'}</div>
                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                      </div>
                    </div>
                    {effectiveRole ? (
                      <Link
                        to={`/${effectiveRole}/dashboard`}
                        onClick={() => setMobileOpen(false)}
                        className="w-full py-2.5 text-center text-sm font-semibold text-white bg-accent rounded-xl flex items-center justify-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                      </Link>
                    ) : (
                      <div className="w-full py-2.5 text-center text-sm text-muted-foreground">Loading...</div>
                    )}
                  </div>
                )}

                {/* Accordions */}
                {([
                  { id: 'products' as const, label: 'Products', items: productsNav.map((p) => ({ key: p.id, label: p.name, href: p.href, logo: p.logo, icon: p.icon, badge: p.badge })) },
                  { id: 'resources' as const, label: 'Resources', items: resourcesNav.map((r) => ({ key: r.href, label: r.label, href: r.href, icon: r.icon, badge: r.badge })) },
                  { id: 'company' as const, label: 'Company', items: companyNav.map((c) => ({ key: c.href, label: c.label, href: c.href, icon: c.icon })) },
                ]).map((section) => (
                  <div key={section.id} className="border-t border-border first:border-t-0">
                    <button
                      type="button"
                      onClick={() => setMobileSection(mobileSection === section.id ? null : section.id)}
                      aria-expanded={mobileSection === section.id}
                      aria-controls={`mobile-${section.id}-links`}
                      className="w-full flex items-center justify-between py-3.5 text-sm font-semibold text-foreground"
                    >
                      {section.label}
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${mobileSection === section.id ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileSection === section.id && (
                      <div id={`mobile-${section.id}-links`} className="flex flex-col gap-1 pb-3">
                        {section.items.map((item) => (
                          <Link
                            key={item.key}
                            to={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 min-h-11 px-3 rounded-lg text-sm font-medium text-foreground/90 hover:bg-muted transition-colors"
                          >
                            {'logo' in item && item.logo ? (
                              <img src={item.logo} alt="" className="w-6 h-6 rounded object-cover" />
                            ) : 'icon' in item && item.icon ? (
                              <item.icon className="w-4 h-4 text-muted-foreground" />
                            ) : null}
                            <span className="flex-1">{item.label}</span>
                            {'badge' in item && item.badge && <Badge text={item.badge} />}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="border-t border-border">
                  <Link
                    to="/pricing"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center min-h-12 text-sm font-semibold ${location.pathname === '/pricing' ? 'text-accent' : 'text-foreground'}`}
                  >
                    Pricing
                  </Link>
                </div>

                {/* Auth section */}
                <div className="pt-4 mt-1 border-t border-border flex flex-col gap-2">
                  {user ? (
                    <div className="flex flex-col gap-1">
                      {companyAccess?.hasAccess && effectiveRole && effectiveRole !== 'company' && (
                        companyAccess.companies && companyAccess.companies.length > 1 ? (
                          companyAccess.companies.map((c) => (
                            <button
                              key={c.company.id}
                              onClick={() => switchToCompany(c.company.id)}
                              className="flex items-center gap-3 min-h-11 px-3 rounded-lg text-sm font-medium text-accent hover:bg-accent/10 transition-colors w-full text-left"
                            >
                              <Building2 className="w-4 h-4" /> Switch to {c.company.name}
                            </button>
                          ))
                        ) : (
                          <button
                            onClick={() => switchToCompany()}
                            className="flex items-center gap-3 min-h-11 px-3 rounded-lg text-sm font-medium text-accent hover:bg-accent/10 transition-colors w-full text-left"
                          >
                            <Building2 className="w-4 h-4" /> Switch to {companyAccess.company?.name || 'Company'}
                          </button>
                        )
                      )}
                      {effectiveRole && (
                        <>
                          <Link to={`/${effectiveRole}/profile`} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 min-h-11 px-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                            <User className="w-4 h-4 text-muted-foreground" /> Profile
                          </Link>
                          <Link to={`/${effectiveRole}/settings`} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 min-h-11 px-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                            <Settings className="w-4 h-4 text-muted-foreground" /> Settings
                          </Link>
                        </>
                      )}
                      <button
                        onClick={async () => { setMobileOpen(false); await signOut(); navigate('/'); }}
                        className="flex items-center gap-3 min-h-11 px-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link
                        to={`/register?redirect=${redirect}`}
                        onClick={() => setMobileOpen(false)}
                        className="w-full py-2.5 text-center text-sm font-semibold text-white bg-accent rounded-xl"
                      >
                        Get Started
                      </Link>
                      <Link
                        to={`/login?redirect=${redirect}`}
                        onClick={() => setMobileOpen(false)}
                        className="w-full py-2.5 text-center text-sm font-medium text-foreground border border-border rounded-xl hover:bg-muted transition-colors flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-4 h-4" /> Sign In
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
