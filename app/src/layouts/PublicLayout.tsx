import { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteBannerBar } from '@/components/SiteBannerBar';
import SiteNav from '@/components/nav/SiteNav';
import SiteFooter from '@/components/nav/SiteFooter';

const AUTH_PREFIXES = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function PublicLayout() {
  const location = useLocation();
  const [bannerVisible, setBannerVisible] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const isAuthPage = AUTH_PREFIXES.some((p) => location.pathname.startsWith(p));

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

  if (isAuthPage) {
    return <div className="min-h-screen bg-transparent"><Outlet /></div>;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50">
        <SiteBannerBar onVisibilityChange={handleBannerVisibility} />
        <SiteNav />
      </header>

      <main
        className="relative z-10"
        style={bannerVisible ? { paddingTop: headerHeight } : undefined}
      >
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}
