import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteBannerBar } from '@/components/SiteBannerBar';
import SiteNav from '@/components/nav/SiteNav';
import SiteFooter from '@/components/nav/SiteFooter';

const AUTH_PREFIXES = ['/login', '/register', '/forgot-password', '/reset-password'];

// Bare pill height (pt-4 + ~64px) so the first paint is already right; the
// banner loads async and the measured height grows to include it.
const NAV_FALLBACK_HEIGHT = 80;

export default function PublicLayout() {
  const location = useLocation();
  const isAuthPage = AUTH_PREFIXES.some((p) => location.pathname.startsWith(p));
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(NAV_FALLBACK_HEIGHT);

  // The banner + pill are a fixed overlay, so their height is measured here and
  // published as --zyro-header-h. `main` reserves it (pages must NOT add their
  // own top padding) — a new page is correctly offset for free. Full-bleed
  // heroes pull back up with `-mt-[var(--zyro-header-h)]`.
  useEffect(() => {
    if (isAuthPage) return;
    const el = headerRef.current;
    if (!el) return;
    const update = () => setHeaderHeight(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isAuthPage]);

  if (isAuthPage) {
    return <div className="min-h-screen bg-transparent"><Outlet /></div>;
  }

  return (
    <div
      className="min-h-screen bg-transparent"
      style={{ '--zyro-header-h': `${headerHeight}px` } as CSSProperties}
    >
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50">
        <SiteBannerBar />
        <SiteNav />
      </header>

      <main className="relative z-10 pt-[var(--zyro-header-h)]">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}
