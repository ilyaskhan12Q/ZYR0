import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, useMemo } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';
import PublicLayout from '@/layouts/PublicLayout';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/ProtectedRoute';
import { CompanyAccessRoute } from '@/components/CompanyAccessRoute';
import { CompanyAccessProvider } from '@/contexts/CompanyAccessContext';
import { Toaster } from '@/components/ui/sonner';
import { RouteLoading } from '@/components/RouteLoading';
import ScrollToTop from '@/components/ScrollToTop';

const AGENT_HOST = 'research.zyroo.org';

function useIsAgentSubdomain() {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.location.hostname === AGENT_HOST;
  }, []);
}

// Public Pages
const PlatformHome = lazy(() => import('@/pages/public/PlatformHome'));
const Landing = lazy(() => import('@/pages/public/Landing'));
const BrowseInternships = lazy(() => import('@/pages/public/BrowseInternships'));
const InternshipDetail = lazy(() => import('@/pages/public/InternshipDetail'));
const Companies = lazy(() => import('@/pages/public/Companies'));
const CompanyDetail = lazy(() => import('@/pages/public/CompanyDetail'));
const Verify = lazy(() => import('@/pages/public/Verify'));
const VerifyOffer = lazy(() => import('@/pages/public/VerifyOffer'));
const About = lazy(() => import('@/pages/public/About'));
const Contact = lazy(() => import('@/pages/public/Contact'));
const PrivacyPolicy = lazy(() => import('@/pages/public/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/public/TermsOfService'));
const CookiePolicy = lazy(() => import('@/pages/public/CookiePolicy'));
const FAQ = lazy(() => import('@/pages/public/FAQ'));
const HelpCenter = lazy(() => import('@/pages/public/HelpCenter'));
const Careers = lazy(() => import('@/pages/public/Careers'));
const TeamApply = lazy(() => import('@/pages/public/TeamApply'));
const NotFound = lazy(() => import('@/pages/public/NotFound'));
const CompleteProfileRedirect = lazy(() => import('@/pages/public/CompleteProfileRedirect'));
const AcceptInvite = lazy(() => import('@/pages/public/AcceptInvite'));

// Auth Pages
const AuthCallback = lazy(() => import('@/pages/auth/AuthCallback'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));

// 0-AI Deep Research Workspace (isolated experimental surface, no public chrome)
const ZeroAIWorkspace = lazy(() => import('@/pages/zeroai/ZeroAIWorkspace'));

// Research Agent (Phase 1: gateway chat; isolated module, requires login)
const ResearchAgentPage = lazy(() => import('@/agent/ResearchAgentPage'));

// Research Landing Page (premium editorial landing for the Research Agent)
const ResearchLanding = lazy(() => import('@/pages/research/ResearchLanding'));

// Role-Based Portals (Each is its own dynamically-loaded bundle containing statically-loaded pages)
const StudentPortal = lazy(() => import('@/pages/student/StudentPortal'));
const CompanyPortal = lazy(() => import('@/pages/company/CompanyPortal'));
const MentorPortal = lazy(() => import('@/pages/mentor/MentorPortal'));
const AdminPortal = lazy(() => import('@/pages/admin/AdminPortal'));

const LazyDashboardLayout = lazy(() => import('@/layouts/DashboardLayout'));

function SubdomainRedirect() {
  const location = useLocation();
  const target = `https://zyroo.org${location.pathname}${location.search}`;
  window.location.href = target;
  return <RouteLoading />;
}

function App() {
  const isAgentSubdomain = useIsAgentSubdomain();

  if (isAgentSubdomain) {
    return (
      <LazyMotion features={domAnimation}>
        <CompanyAccessProvider>
          <ScrollToTop />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              {/* Subdomain: research.zyroo.org — agent-only routes */}
              <Route path="/" element={<ResearchLanding />} />
              <Route
                path="/research-agent"
                element={
                  <ProtectedRoute>
                    <ResearchAgentPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
              <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
              <Route path="/reset-password" element={<ResetPassword />} />
              {/* Redirect all other paths to main domain */}
              <Route path="*" element={<SubdomainRedirect />} />
            </Routes>
            <Toaster />
          </Suspense>
        </CompanyAccessProvider>
      </LazyMotion>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <CompanyAccessProvider>
        <ScrollToTop />
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<PlatformHome />} />
              <Route path="/internships" element={<Landing />} />
              <Route path="/internships/browse" element={<BrowseInternships />} />
              <Route path="/internships/:id" element={<InternshipDetail />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:id" element={<CompanyDetail />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/verify/:code" element={<Verify />} />
              <Route path="/verify-certificate" element={<Verify />} />
              <Route path="/verify-certificate/:code" element={<Verify />} />
              <Route path="/verify-offer" element={<VerifyOffer />} />
              <Route path="/verify-offer/:id" element={<VerifyOffer />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/careers/apply" element={<TeamApply />} />
            </Route>

            {/* Auth Routes — redirect to dashboard if already logged in */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
            <Route path="/register/:role" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
            <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/complete-profile" element={<CompleteProfileRedirect />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />

            {/* 0-AI Deep Research Workspace — isolated, outside PublicLayout */}
            <Route path="/0-ai" element={<ZeroAIWorkspace />} />

            {/* Research Landing — public, outside PublicLayout */}
            <Route path="/research" element={<ResearchLanding />} />

            {/* Research Agent — login required (per-user metering) */}
            <Route
              path="/research-agent"
              element={
                <ProtectedRoute>
                  <ResearchAgentPage />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route path="/student/*" element={<ProtectedRoute role="student"><Suspense fallback={<RouteLoading />}><LazyDashboardLayout role="student" /></Suspense></ProtectedRoute>}>
              <Route path="*" element={<Suspense fallback={<RouteLoading />}><StudentPortal /></Suspense>} />
            </Route>

            {/* Company Routes — owners and accepted team members, tabs gated by role */}
            <Route path="/company/*" element={
              <CompanyAccessRoute>
                <Suspense fallback={<RouteLoading />}><LazyDashboardLayout role="company" /></Suspense>
              </CompanyAccessRoute>
            }>
              <Route path="*" element={<Suspense fallback={<RouteLoading />}><CompanyPortal /></Suspense>} />
            </Route>

            {/* Mentor Routes */}
            <Route path="/mentor/*" element={<ProtectedRoute role="mentor"><Suspense fallback={<RouteLoading />}><LazyDashboardLayout role="mentor" /></Suspense></ProtectedRoute>}>
              <Route path="*" element={<Suspense fallback={<RouteLoading />}><MentorPortal /></Suspense>} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/*" element={<ProtectedRoute role="admin"><Suspense fallback={<RouteLoading />}><LazyDashboardLayout role="admin" /></Suspense></ProtectedRoute>}>
              <Route path="*" element={<Suspense fallback={<RouteLoading />}><AdminPortal /></Suspense>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Suspense>
      </CompanyAccessProvider>
    </LazyMotion>
  );
}

export default App;
