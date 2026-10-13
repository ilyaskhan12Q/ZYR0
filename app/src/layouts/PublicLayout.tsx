import { Outlet, useLocation } from 'react-router-dom';
import { SiteBannerBar } from '@/components/SiteBannerBar';
import SiteNav from '@/components/nav/SiteNav';
import SiteFooter from '@/components/nav/SiteFooter';

const AUTH_PREFIXES = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function PublicLayout() {
  const location = useLocation();
  const isAuthPage = AUTH_PREFIXES.some((p) => location.pathname.startsWith(p));

  if (isAuthPage) {
    return <div className="min-h-screen bg-transparent"><Outlet /></div>;
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Fixed, overlay-only chrome: banner + pill float over the hero. Pages
          carry their own top padding — never pad main here or the hero gets
          pushed down whenever the banner shows. */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <SiteBannerBar />
        <SiteNav />
      </header>

      <main className="relative z-10">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}
