import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Menu, X, ChevronDown, LogOut, User, LayoutDashboard,
  Settings, Sun, Moon, Building2, LogIn, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOptionalCompanyAccess } from '@/contexts/CompanyAccessContext';
import { productsNav, productsMegaColumns, resourcesNav, companyNav } from '@/config/navigation';

// Dark translucent glass pill (the "/" look): blur layer over the hero so the
// page background bleeds through and the nav feels part of the page, not on top
// of it. Frosts denser on scroll for readability over busy content.
// Padding stays constant across both states: the height drives the page's top
// offset (--zyro-header-h), so a scrolled shrink would shift the whole page.
const desktopPillClass = (scrolled: boolean) =>
  `relative transition-all duration-300 flex items-center justify-between gap-4 ${
    scrolled
      ? 'w-full max-w-[1560px] mx-auto rounded-2xl border border-white/15 bg-black/80 supports-[backdrop-filter]:bg-black/65 backdrop-blur-2xl ring-1 ring-inset ring-white/5 shadow-2xl shadow-black/80 px-5 sm:px-8 py-2.5'
      : 'w-full max-w-full rounded-none border-b border-border/10 dark:border-white/5 bg-background/10 dark:bg-black/15 supports-[backdrop-filter]:bg-background/5 dark:supports-[backdrop-filter]:bg-black/10 backdrop-blur-md px-5 sm:px-10 py-3.5'
  }`;

const mobilePillClass = (scrolled: boolean) =>
  `relative rounded-2xl border ring-1 ring-inset ring-white/5 backdrop-blur-2xl transition-all duration-300 flex items-center justify-between gap-3 px-4 sm:px-5 py-3 ${
    scrolled
      ? 'bg-black/80 supports-[backdrop-filter]:bg-black/65 border-white/15 shadow-2xl shadow-black/80'
      : 'bg-black/60 supports-[backdrop-filter]:bg-black/35 border-white/10 shadow-lg shadow-black/40'
  }`;

const triggerClass = (open: boolean, scrolled: boolean = false) =>
  `relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
    scrolled
      ? open
        ? 'text-white bg-white/10 font-medium'
        : 'text-neutral-300 hover:text-white hover:bg-white/5'
      : open
        ? 'text-foreground bg-foreground/10 font-medium'
        : 'text-foreground/85 hover:text-foreground hover:bg-foreground/5'
  }`;

const activeIndicator = 'after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[#0051C3]';

const panelClass = (width: string, align: 'left' | 'right' = 'left') =>
  `absolute top-full ${align === 'left' ? 'left-0' : 'right-0'} mt-2 ${width} bg-card rounded-xl border border-border shadow-2xl backdrop-blur-xl p-1.5 z-50`;

const menuItemClass =
  'flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-foreground/90 hover:bg-[#0051C3]/5 dark:hover:bg-[#0051C3]/20 hover:text-foreground transition-colors w-full text-left';

const primaryPanelClass = (width: string, align: 'left' | 'right' = 'left') =>
  `absolute top-full ${align === 'left' ? 'left-0' : 'right-0'} mt-2 ${width} bg-[#0051C3] text-white rounded-xl border border-white/15 shadow-2xl backdrop-blur-xl p-1.5 z-50`;

const primaryMenuItemClass =
  'flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-white/85 hover:bg-white/10 hover:text-white transition-colors w-full text-left';

function Badge({ text }: { text: string }) {
  return (
    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
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
  const [previewId, setPreviewId] = useState(productsNav[0]?.id);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<'products' | 'resources' | 'company' | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isSectionActive = (hrefs: string[]) =>
    hrefs.some((href) => location.pathname === href || location.pathname.startsWith(`${href}/`));
  const productsActive = isSectionActive(productsNav.map((item) => item.href));
  const companyActive = isSectionActive(companyNav.map((item) => item.href));
  const resourcesActive =
    !productsActive &&
    !companyActive &&
    isSectionActive(resourcesNav.map((item) => item.href).filter((href) => href !== '/pricing'));

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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
  const previewProduct = productsNav.find((p) => p.id === previewId) ?? productsNav[0];

  const dropdownButton = (id: 'products' | 'resources' | 'company', label: string, active = false) => (
    <button
      type="button"
      onClick={() => toggle(id)}
      onMouseEnter={() => setOpenMenu(id)}
      aria-haspopup="true"
      aria-expanded={openMenu === id}
      aria-controls={`nav-${id}-menu`}
      className={`${triggerClass(openMenu === id, scrolled)} ${active ? activeIndicator : ''}`}
    >
      {label}
      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === id ? 'rotate-180' : ''}`} />
    </button>
  );

  return (
    <div ref={navRef} className="pointer-events-none relative w-full">
      {/* Desktop / tablet nav */}
      <div className="hidden md:flex items-center pointer-events-auto w-full transition-all duration-300">
        <div className={`w-full transition-all duration-300 ${scrolled ? 'max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 pt-3' : 'px-0 pt-0'}`}>
          <div className={desktopPillClass(scrolled)}>
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <img src="/zyro-logo.webp" alt="" width="28" height="28" className="w-7 h-7 object-contain rounded-md bg-[#0051C3]/10 ring-1 ring-[#0051C3]/30" />
              <span className={`text-xl font-display tracking-tight transition-colors ${scrolled ? 'text-white' : 'text-foreground'}`}>ZYR0</span>
            </Link>

          <nav className="flex items-center gap-0.5" aria-label="Primary">
            <div>
              {dropdownButton('products', 'Products', productsActive)}
              <AnimatePresence>
                {openMenu === 'products' && (
                  <m.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    id="nav-products-menu"
                    className="absolute inset-x-0 top-full mt-2 rounded-3xl bg-[#0051C3] border border-white/15 shadow-[0_28px_90px_-20px_rgba(0,0,0,0.65)] ring-1 ring-white/10 backdrop-blur-xl z-50 overflow-hidden"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <div className="pointer-events-none absolute -top-24 right-0 h-56 w-72 bg-white/10 blur-3xl" />
                    <div
                      className="relative grid grid-cols-1 gap-2 p-2.5 lg:[grid-template-columns:var(--mega-cols)]"
                      style={{ '--mega-cols': `repeat(${productsMegaColumns.length}, minmax(0, 1fr)) minmax(240px, 300px)` } as CSSProperties}
                    >
                      {productsMegaColumns.map((column, i) => (
                        <div key={i} className="flex flex-col gap-0.5">
                          <div className="px-3 pt-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/70 select-none">
                            {column.title}
                          </div>
                          {column.items.map((product) => (
                            <Link
                              key={product.id}
                              to={product.href}
                              onClick={() => setOpenMenu(null)}
                              onMouseEnter={() => setPreviewId(product.id)}
                              onFocus={() => setPreviewId(product.id)}
                              className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none transition-colors group"
                            >
                              <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-all">
                                {product.logo ? (
                                  <img src={product.logo} alt="" className="w-full h-full object-cover" />
                                ) : product.icon ? (
                                  <product.icon className="w-4 h-4 text-[#0051C3]" />
                                ) : (
                                  <span className="font-display text-sm text-[#0051C3]/50">{product.name.charAt(0)}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium tracking-tight text-white transition-colors">{product.name}</span>
                                  {product.badge && <Badge text={product.badge} />}
                                </div>
                                <p className="block text-xs text-white/70 mt-0.5 leading-relaxed line-clamp-2">{product.description}</p>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-white/40 mt-1 shrink-0 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </Link>
                          ))}
                        </div>
                      ))}

                      {/* Preview column: mirrors whichever product is hovered/focused */}
                      {previewProduct && (
                        <Link
                          to={previewProduct.href}
                          onClick={() => setOpenMenu(null)}
                          aria-hidden
                          tabIndex={-1}
                          className="hidden lg:flex flex-col rounded-2xl bg-white/5 border border-white/15 p-3 shadow-sm hover:border-white/30 transition-colors"
                        >
                          <div className="aspect-[4/3] rounded-xl bg-white/90 ring-1 ring-white/20 shadow-inner overflow-hidden flex items-center justify-center p-5">
                            {previewProduct.logo ? (
                              <img src={previewProduct.logo} alt="" className="w-full h-full object-contain drop-shadow-sm" />
                            ) : previewProduct.icon ? (
                              <previewProduct.icon className="w-14 h-14 text-[#0051C3]" />
                            ) : (
                              <span className="font-display text-4xl text-[#0051C3]/50">{previewProduct.name.charAt(0)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-sm font-semibold tracking-tight text-white">{previewProduct.name}</span>
                            {previewProduct.badge && <Badge text={previewProduct.badge} />}
                          </div>
                          <p className="text-xs text-white/70 mt-1 leading-relaxed line-clamp-3">{previewProduct.description}</p>
                          <span className="mt-auto pt-3 inline-flex items-center gap-1 text-xs font-semibold text-white">
                            Explore <ChevronRight className="w-3 h-3" />
                          </span>
                        </Link>
                      )}
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/pricing"
              className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === '/pricing'
                  ? `${scrolled ? 'text-white bg-white/10' : 'text-[#0051C3] bg-[#0051C3]/10'} ${activeIndicator}`
                  : triggerClass(false, scrolled)
              }`}
            >
              Pricing
            </Link>

            <div className="relative">
              {dropdownButton('company', 'Company', companyActive)}
              <AnimatePresence>
                {openMenu === 'company' && (
                  <m.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    id="nav-company-menu"
                    className={primaryPanelClass('w-[220px]')}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-t-xl" />
                    {companyNav.map((item) => (
                      <Link key={item.href} to={item.href} onClick={() => setOpenMenu(null)} className={primaryMenuItemClass}>
                        {item.icon && <item.icon className="w-4 h-4 text-white/60" />}
                        <span className="flex-1">{item.label}</span>
                        <ChevronRight className="w-3 h-3 text-white/40" />
                      </Link>
                    ))}
                  </m.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              {dropdownButton('resources', 'Resources', resourcesActive)}
              <AnimatePresence>
                {openMenu === 'resources' && (
                  <m.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    id="nav-resources-menu"
                    className={primaryPanelClass('w-[250px]', 'right')}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-t-xl" />
                    {resourcesNav.map((item) => (
                      <Link key={item.href} to={item.href} onClick={() => setOpenMenu(null)} className={primaryMenuItemClass}>
                        {item.icon && <item.icon className="w-4 h-4 text-white/60" />}
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
              type="button"
              aria-label="Toggle color theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95 group shrink-0 ${
                scrolled
                  ? 'border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white'
                  : 'border border-border/60 hover:border-border bg-foreground/5 hover:bg-foreground/10 text-foreground'
              }`}
            >
              {mounted ? (
                <m.div
                  key={theme === 'dark' ? 'dark' : 'light'}
                  initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="flex items-center justify-center"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors" />
                  ) : (
                    <Moon className={`w-4 h-4 transition-colors ${scrolled ? 'text-sky-200 group-hover:text-white' : 'text-foreground/80 group-hover:text-foreground'}`} />
                  )}
                </m.div>
              ) : (
                <div className="w-4 h-4" />
              )}
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
                  className={`px-3.5 py-2 text-sm font-medium transition-colors ${
                    scrolled
                      ? 'text-neutral-300 hover:text-white'
                      : 'text-foreground/85 hover:text-foreground'
                  }`}
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
      </div>

      {/* Mobile compact pill */}
      <div className="md:hidden max-w-7xl mx-auto px-4 pt-4 pointer-events-auto">
        <div className={mobilePillClass(scrolled)}>
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/zyro-logo.webp" alt="" width="24" height="24" className="w-6 h-6 object-contain rounded-md bg-[#0051C3]/10 ring-1 ring-[#0051C3]/30" />
            <span className="text-lg font-display tracking-tight text-white">ZYR0</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              aria-label="Toggle color theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95 group shrink-0"
            >
              {mounted ? (
                <m.div
                  key={theme === 'dark' ? 'dark' : 'light'}
                  initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="flex items-center justify-center"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-300 group-hover:text-amber-200 transition-colors" />
                  ) : (
                    <Moon className="w-4 h-4 text-sky-200 group-hover:text-white transition-colors" />
                  )}
                </m.div>
              ) : (
                <div className="w-4 h-4" />
              )}
            </button>

            {user ? (
              <Link
                to={effectiveRole ? `/${effectiveRole}/dashboard` : '/'}
                aria-label="Account Dashboard"
                className="relative inline-flex items-center justify-center w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/20 hover:ring-accent transition-all shrink-0"
              >
                <img
                  src={user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User'}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </Link>
            ) : (
              <Link
                to={`/login?redirect=${redirect}`}
                className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-white bg-accent hover:bg-accent/90 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-102 active:scale-98 shrink-0"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-haspopup="true"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-sheet"
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-white bg-white/10 border border-white/15 hover:bg-white/20 transition-all shrink-0"
            >
              <Menu className="w-4 h-4" />
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
                  <img src="/zyro-logo.webp" alt="" width="24" height="24" className="w-6 h-6 object-contain rounded-md bg-[#0051C3]/10 ring-1 ring-[#0051C3]/30" />
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
                      className={`w-full flex items-center justify-between px-3 py-3.5 text-sm font-semibold transition-colors ${mobileSection === section.id ? 'text-[#0051C3] dark:text-[#7FA9E8]' : 'text-foreground'}`}
                    >
                      {section.label}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileSection === section.id ? 'rotate-180 text-[#0051C3] dark:text-[#7FA9E8]' : 'text-muted-foreground'}`} />
                    </button>
                    {mobileSection === section.id && (
                      <div id={`mobile-${section.id}-links`} className="mb-3 flex flex-col gap-0.5 rounded-2xl bg-[#0051C3] p-1.5">
                        {section.items.map((item) => (
                          <Link
                            key={item.key}
                            to={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 min-h-12 px-3 rounded-xl text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white overflow-hidden">
                              {'logo' in item && item.logo ? (
                                <img src={item.logo} alt="" className="h-full w-full object-cover" />
                              ) : 'icon' in item && item.icon ? (
                                <item.icon className="h-4 w-4 text-[#0051C3]" />
                              ) : null}
                            </span>
                            <span className="min-w-0 flex-1 truncate">{item.label}</span>
                            {'badge' in item && item.badge && <Badge text={item.badge} />}
                            <ChevronRight className="h-4 w-4 shrink-0 text-white/40" />
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
                    className={`flex items-center justify-between min-h-12 px-3 rounded-xl text-sm font-semibold transition-colors hover:bg-[#0051C3]/5 dark:hover:bg-[#0051C3]/20 ${location.pathname === '/pricing' ? 'text-[#0051C3] dark:text-[#7FA9E8]' : 'text-foreground'}`}
                  >
                    Pricing
                    {location.pathname === '/pricing' && (
                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#0051C3]" />
                    )}
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
