import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/ProtectedRoute';
import { Spinner } from '@/components/ui/spinner';

// Loading fallback component
function RouteLoading() {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center">
      <Spinner className="size-8 text-primary animate-spin" />
    </div>
  );
}

// Public Pages
const Landing = lazy(() => import('@/pages/public/Landing'));
const BrowseInternships = lazy(() => import('@/pages/public/BrowseInternships'));
const InternshipDetail = lazy(() => import('@/pages/public/InternshipDetail'));
const Companies = lazy(() => import('@/pages/public/Companies'));
const CompanyDetail = lazy(() => import('@/pages/public/CompanyDetail'));
const Verify = lazy(() => import('@/pages/public/Verify'));
const About = lazy(() => import('@/pages/public/About'));
const Contact = lazy(() => import('@/pages/public/Contact'));

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

// Layouts (Loaded statically for layout state preservation)
import DashboardLayout from '@/layouts/DashboardLayout';

function App() {
  return (
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
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Auth Routes — redirect to dashboard if already logged in */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/register/:role" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Student Routes */}
        <Route path="/student/*" element={<ProtectedRoute role="student"><DashboardLayout role="student" /></ProtectedRoute>}>
          <Route path="*" element={<StudentPortal />} />
        </Route>

        {/* Company Routes */}
        <Route path="/company/*" element={<ProtectedRoute role="company"><DashboardLayout role="company" /></ProtectedRoute>}>
          <Route path="*" element={<CompanyPortal />} />
        </Route>

        {/* Mentor Routes */}
        <Route path="/mentor/*" element={<ProtectedRoute role="mentor"><DashboardLayout role="mentor" /></ProtectedRoute>}>
          <Route path="*" element={<MentorPortal />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/*" element={<ProtectedRoute role="admin"><DashboardLayout role="admin" /></ProtectedRoute>}>
          <Route path="*" element={<AdminPortal />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
