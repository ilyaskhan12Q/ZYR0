import { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteBannerBar } from '@/components/SiteBannerBar';
import PlatformNav from '@/components/nav/PlatformNav';
import PlatformFooter from '@/components/nav/PlatformFooter';

export default function PublicLayout() {
  const location = useLocation();
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

  if (isAuthPage) {
    return <div className="min-h-screen bg-transparent"><Outlet /></div>;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50">
        <SiteBannerBar onVisibilityChange={handleBannerVisibility} />
      </header>

      <PlatformNav />

      <main
        className="relative z-10"
        style={bannerVisible ? { paddingTop: headerHeight } : undefined}
      >
        <Outlet />
      </main>

      <PlatformFooter />
    </div>
  );
}
