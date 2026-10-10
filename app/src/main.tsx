import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { HelmetProvider } from 'react-helmet-async';
import { PostHogProvider, usePostHog } from '@posthog/react';
import Lenis from 'lenis';
import './index.css';
import App from './App.tsx';
import { ErrorBoundary } from './ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';

const posthogOptions = {
  api_host: import.meta.env.POSTHOG_HOST,
  ui_host: 'https://us.posthog.com',
  person_profiles: 'identified_only',
  defaults: '2026-05-30',
} as const;

function PageTracker() {
  const location = useLocation();
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('$pageview');
  }, [location, posthog]);

  return null;
}

const PUBLIC_PREFIXES = ['/', '/internships', '/companies', '/about', '/contact', '/faq', '/careers', '/research', '/studio', '/school', '/edu', '/verify'];

// Match a whole path segment: '/research' must not match '/research-agent'.
function isPublicPath(path: string): boolean {
  return PUBLIC_PREFIXES.some((p) => (p === '/' ? path === '/' : path === p || path.startsWith(`${p}/`)));
}

/**
 * Smooth (Lenis) scrolling is only for the public, window-scrolling pages.
 * Inner-scrolling routes such as /research-agent must keep native wheel input,
 * so Lenis is created per public route and fully torn down when leaving it.
 */
function LenisManager() {
  const location = useLocation();

  useEffect(() => {
    if (!isPublicPath(location.pathname)) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    let rafId = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [location.pathname]);

  return null;
}

// Global error handlers for observability
window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.error);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Rejection]', event.reason);
});

function Root() {
  return (
    <StrictMode>
      <PostHogProvider
        apiKey={import.meta.env.POSTHOG_PROJECT_TOKEN}
        options={posthogOptions}
      >
        <ErrorBoundary>
          <HelmetProvider>
            <BrowserRouter>
              <PageTracker />
              <LenisManager />
              <AuthProvider>
                <ThemeProvider attribute="class" defaultTheme="light">
                  <App />
                </ThemeProvider>
              </AuthProvider>
            </BrowserRouter>
          </HelmetProvider>
        </ErrorBoundary>
      </PostHogProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<Root />);
