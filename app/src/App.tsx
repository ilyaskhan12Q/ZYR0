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

// Subdomain Hosts
const RESEARCH_HOST = 'research.zyroo.org';
const STUDIO_HOST = 'studio.zyroo.org';
const SCHOOL_HOST = 'school.zyroo.org';
const EDU_HOST = 'edu.zyroo.org';
const WORK_HOST = 'work.zyroo.org';

type ProductSubdomain = 'research' | 'studio' | 'school' | 'work' | null;

function useProductSubdomain(): ProductSubdomain {
  return useMemo(() => {
    if (typeof window === 'undefined') return null;
    const host = window.location.hostname;
    if (host === RESEARCH_HOST) return 'research';
    if (host === STUDIO_HOST) return 'studio';
    if (host === SCHOOL_HOST || host === EDU_HOST) return 'school';
    if (host === WORK_HOST) return 'work';
    return null;
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

// ZYR0 Studio Surface
const StudioLanding = lazy(() => import('@/pages/studio/StudioLanding'));

// ZYR0 Edu / School OS Surface
const SchoolOSLanding = lazy(() => import('@/pages/edu/SchoolOSLanding'));

// 0-AI Deep Research Workspace & Landing
const ZeroAIWorkspace = lazy(() => import('@/pages/zeroai/ZeroAIWorkspace'));
const ResearchAgentPage = lazy(() => import('@/agent/ResearchAgentPage'));
const ResearchLanding = lazy(() => import('@/pages/research/ResearchLanding'));

// Role-Based Portals
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

export default function App() {
  const productSubdomain = useProductSubdomain();

  // 1. Research Subdomain Gateway (research.zyroo.org)
  if (productSubdomain === 'research') {
    return (
      <LazyMotion features={domAnimation}>
        <CompanyAccessProvider>
          <ScrollToTop />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<ResearchLanding />} />
              <Route
                path="/research-agent"
                element={
                  <ProtectedRoute>
                    <ResearchAgentPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/0-ai" element={<ZeroAIWorkspace />} />
              <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
              <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<SubdomainRedirect />} />
            </Routes>
            <Toaster />
          </Suspense>
        </CompanyAccessProvider>
      </LazyMotion>
    );
  }

  // 2. Studio Subdomain Gateway (studio.zyroo.org)
  if (productSubdomain === 'studio') {
    return (
      <LazyMotion features={domAnimation}>
        <CompanyAccessProvider>
          <ScrollToTop />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<StudioLanding />} />
              <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
              <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<SubdomainRedirect />} />
            </Routes>
            <Toaster />
          </Suspense>
        </CompanyAccessProvider>
      </LazyMotion>
    );
  }

  // 3. School OS Subdomain Gateway (school.zyroo.org / edu.zyroo.org)
  if (productSubdomain === 'school') {
    return (
      <LazyMotion features={domAnimation}>
        <CompanyAccessProvider>
          <ScrollToTop />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<SchoolOSLanding />} />
              <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
              <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<SubdomainRedirect />} />
            </Routes>
            <Toaster />
          </Suspense>
        </CompanyAccessProvider>
      </LazyMotion>
    );
  }

  // 4. Main Domain Ecosystem Router (zyroo.org, localhost, Vercel deployments)
  return (
    <LazyMotion features={domAnimation}>
      <CompanyAccessProvider>
        <ScrollToTop />
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            {/* Platform Master Homepage */}
            <Route path="/" element={<PlatformHome />} />

            {/* ZYR0 Studio Dedicated Product Route */}
            <Route path="/studio" element={<StudioLanding />} />

            {/* ZYR0 Edu / School OS Dedicated Product Routes */}
            <Route path="/school" element={<SchoolOSLanding />} />
            <Route path="/edu" element={<SchoolOSLanding />} />

            {/* ZYR0 Research / 0-AI Routes */}
            <Route path="/research" element={<ResearchLanding />} />
            <Route path="/0-ai" element={<ZeroAIWorkspace />} />
            <Route
              path="/research-agent"
              element={
                <ProtectedRoute>
                  <ResearchAgentPage />
                </ProtectedRoute>
              }
            />

            {/* ZYR0 Work / Internships Dedicated Routes & Public Portal */}
            <Route element={<PublicLayout />}>
              {/* /internships is the ZYR0 Work overview/landing page */}
              <Route path="/internships" element={<Landing />} />
              {/* /internships/browse is the uploaded internships searchable catalog */}
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

            {/* Auth Routes */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
            <Route path="/register/:role" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
            <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/complete-profile" element={<CompleteProfileRedirect />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />

            {/* Student Role Routes */}
            <Route path="/student/*" element={<ProtectedRoute role="student"><Suspense fallback={<RouteLoading />}><LazyDashboardLayout role="student" /></Suspense></ProtectedRoute>}>
              <Route path="*" element={<Suspense fallback={<RouteLoading />}><StudentPortal /></Suspense>} />
            </Route>

            {/* Company Role Routes */}
            <Route path="/company/*" element={
              <CompanyAccessRoute>
                <Suspense fallback={<RouteLoading />}><LazyDashboardLayout role="company" /></Suspense>
              </CompanyAccessRoute>
            }>
              <Route path="*" element={<Suspense fallback={<RouteLoading />}><CompanyPortal /></Suspense>} />
            </Route>

            {/* Mentor Role Routes */}
            <Route path="/mentor/*" element={<ProtectedRoute role="mentor"><Suspense fallback={<RouteLoading />}><LazyDashboardLayout role="mentor" /></Suspense></ProtectedRoute>}>
              <Route path="*" element={<Suspense fallback={<RouteLoading />}><MentorPortal /></Suspense>} />
            </Route>

            {/* Admin Role Routes */}
            <Route path="/admin/*" element={<ProtectedRoute role="admin"><Suspense fallback={<RouteLoading />}><LazyDashboardLayout role="admin" /></Suspense></ProtectedRoute>}>
              <Route path="*" element={<Suspense fallback={<RouteLoading />}><AdminPortal /></Suspense>} />
            </Route>

            {/* Fallback 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Suspense>
      </CompanyAccessProvider>
    </LazyMotion>
  );
}
