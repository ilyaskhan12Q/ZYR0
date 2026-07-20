import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';
import PublicLayout from '@/layouts/PublicLayout';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';
import { RouteLoading } from '@/components/RouteLoading';

// Public Pages
const Landing = lazy(() => import('@/pages/public/Landing'));
const BrowseInternships = lazy(() => import('@/pages/public/BrowseInternships'));
const InternshipDetail = lazy(() => import('@/pages/public/InternshipDetail'));
const Companies = lazy(() => import('@/pages/public/Companies'));
const CompanyDetail = lazy(() => import('@/pages/public/CompanyDetail'));
const Verify = lazy(() => import('@/pages/public/Verify'));
const About = lazy(() => import('@/pages/public/About'));
const Contact = lazy(() => import('@/pages/public/Contact'));
const PrivacyPolicy = lazy(() => import('@/pages/public/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/public/TermsOfService'));
const CookiePolicy = lazy(() => import('@/pages/public/CookiePolicy'));
const FAQ = lazy(() => import('@/pages/public/FAQ'));
const HelpCenter = lazy(() => import('@/pages/public/HelpCenter'));
const Careers = lazy(() => import('@/pages/public/Careers'));
const NotFound = lazy(() => import('@/pages/public/NotFound'));
const CompleteProfileRedirect = lazy(() => import('@/pages/public/CompleteProfileRedirect'));

// Auth Pages
const AuthCallback = lazy(() => import('@/pages/auth/AuthCallback'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));

// Role-Based Portals (Each is its own dynamically-loaded bundle containing statically-loaded pages)
const StudentPortal = lazy(() => import('@/pages/student/StudentPortal'));
const CompanyPortal = lazy(() => import('@/pages/company/CompanyPortal'));
const MentorPortal = lazy(() => import('@/pages/mentor/MentorPortal'));
const AdminPortal = lazy(() => import('@/pages/admin/AdminPortal'));

const LazyDashboardLayout = lazy(() => import('@/layouts/DashboardLayout'));

function App() {
  return (
    <LazyMotion features={domAnimation}>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/internships" element={<BrowseInternships />} />
            <Route path="/internships/:id" element={<InternshipDetail />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/verify/:code" element={<Verify />} />
            <Route path="/verify-certificate" element={<Verify />} />
            <Route path="/verify-certificate/:code" element={<Verify />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/careers" element={<Careers />} />
          </Route>

          {/* Auth Routes — redirect to dashboard if already logged in */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
          <Route path="/register/:role" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
          <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/complete-profile" element={<CompleteProfileRedirect />} />

          {/* Student Routes */}
          <Route path="/student/*" element={<ProtectedRoute role="student"><Suspense fallback={<RouteLoading />}><LazyDashboardLayout role="student" /></Suspense></ProtectedRoute>}>
            <Route path="*" element={<Suspense fallback={<RouteLoading />}><StudentPortal /></Suspense>} />
          </Route>

          {/* Company Routes */}
          <Route path="/company/*" element={<ProtectedRoute role="company"><Suspense fallback={<RouteLoading />}><LazyDashboardLayout role="company" /></Suspense></ProtectedRoute>}>
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
    </LazyMotion>
  );
}

export default App;
