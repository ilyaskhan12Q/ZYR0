import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { HelmetProvider } from 'react-helmet-async';
import { PostHogProvider, usePostHog } from '@posthog/react';
import Lenis from 'lenis';
import './index.css';
import '@bible-strong/avatar-react/styles.css';
import App from './App.tsx';
import { ErrorBoundary } from './ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { SiteMascot } from './components/SiteMascot';

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

// Module-level so we can pause Lenis while a modal dialog is open.
let lenisInstance: Lenis | null = null;

function initLenisIfPublic() {
  const path = window.location.pathname;
  const isPublic = PUBLIC_PREFIXES.some(p => p === '/' ? path === '/' : path.startsWith(p));
  if (!isPublic) return;

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    touchMultiplier: 2,
  });
  lenisInstance = lenis;

  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

/**
 * Radix Dialog (via react-remove-scroll) sets `data-scroll-locked` on <body>
 * while a modal is open. Lenis's rAF loop would otherwise keep scrolling the
 * page behind the dialog, so pause it while locked and resume on unlock.
 */
function useLenisModalScrollLock() {
  useEffect(() => {
    const body = document.body;

    const apply = () => {
      if (!lenisInstance) return;
      const locked = body.getAttribute('data-scroll-locked') === '1';
      if (locked) {
        lenisInstance.stop();
      } else {
        lenisInstance.start();
      }
    };

    // Apply immediately (a dialog may already be open on mount).
    apply();

    const observer = new MutationObserver(apply);
    observer.observe(body, { attributes: true, attributeFilter: ['data-scroll-locked'] });
    return () => observer.disconnect();
  }, []);
}

// Global error handlers for observability
window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.error);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Rejection]', event.reason);
});

function Root() {
  useEffect(() => {
    initLenisIfPublic();
  }, []);
  useLenisModalScrollLock();

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
              <AuthProvider>
                <ThemeProvider attribute="class" defaultTheme="light">
                  <App />
                  <SiteMascot />
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
