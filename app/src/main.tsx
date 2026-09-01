import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { HelmetProvider } from 'react-helmet-async';
import Lenis from 'lenis';
import './index.css';
import App from './App.tsx';
import { ErrorBoundary } from './ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';

const PUBLIC_PREFIXES = ['/', '/internships', '/companies', '/about', '/contact', '/faq', '/careers', '/research', '/studio', '/school', '/edu', '/verify'];

function initLenisIfPublic() {
  const path = window.location.pathname;
  const isPublic = PUBLIC_PREFIXES.some(p => p === '/' ? path === '/' : path.startsWith(p));
  if (!isPublic) return;

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    touchMultiplier: 2,
  });

  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

initLenisIfPublic();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="dark">
              <App />
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
);
