import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
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

// Student Pages
const StudentDashboard = lazy(() => import('@/pages/student/Dashboard'));
const StudentInternships = lazy(() => import('@/pages/student/Internships'));
const StudentApplications = lazy(() => import('@/pages/student/Applications'));
const StudentTasks = lazy(() => import('@/pages/student/Tasks'));
const StudentProgress = lazy(() => import('@/pages/student/Progress'));
const StudentMessages = lazy(() => import('@/pages/student/Messages'));
const StudentCertificates = lazy(() => import('@/pages/student/Certificates'));
const StudentPortfolio = lazy(() => import('@/pages/student/Portfolio'));
const StudentProfile = lazy(() => import('@/pages/student/Profile'));
const StudentSettings = lazy(() => import('@/pages/student/Settings'));
const StudentOfferLetters = lazy(() => import('@/pages/student/OfferLetters'));
const StudentWorkspace = lazy(() => import('@/pages/student/Workspace'));

// Company Pages
const CompanyDashboard = lazy(() => import('@/pages/company/Dashboard'));
const CompanyProfile = lazy(() => import('@/pages/company/Profile'));
const CompanyInternships = lazy(() => import('@/pages/company/Internships'));
const PostInternship = lazy(() => import('@/pages/company/PostInternship'));
const CompanyApplicants = lazy(() => import('@/pages/company/Applicants'));
const CompanyInterns = lazy(() => import('@/pages/company/Interns'));
const CompanyTasks = lazy(() => import('@/pages/company/Tasks'));
const CompanyAnalytics = lazy(() => import('@/pages/company/Analytics'));
const CompanyCertificates = lazy(() => import('@/pages/company/Certificates'));
const CompanyTeam = lazy(() => import('@/pages/company/Team'));
const CompanySettings = lazy(() => import('@/pages/company/Settings'));
const CompanyOfferLetters = lazy(() => import('@/pages/company/OfferLetters'));

// Mentor Pages
const MentorDashboard = lazy(() => import('@/pages/mentor/Dashboard'));
const MentorInterns = lazy(() => import('@/pages/mentor/Interns'));
const MentorTasks = lazy(() => import('@/pages/mentor/Tasks'));
const MentorEvaluations = lazy(() => import('@/pages/mentor/Evaluations'));
const MentorMessages = lazy(() => import('@/pages/mentor/Messages'));
const MentorProfile = lazy(() => import('@/pages/mentor/Profile'));
const MentorSettings = lazy(() => import('@/pages/mentor/Settings'));

// Admin Pages
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/Users'));
const AdminCompanies = lazy(() => import('@/pages/admin/Companies'));
const AdminInternships = lazy(() => import('@/pages/admin/Internships'));
const AdminCertificates = lazy(() => import('@/pages/admin/Certificates'));
const AdminApplications = lazy(() => import('@/pages/admin/Applications'));
const AdminAnalytics = lazy(() => import('@/pages/admin/Analytics'));
const AdminReports = lazy(() => import('@/pages/admin/Reports'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));
const AdminLogs = lazy(() => import('@/pages/admin/Logs'));
const AdminOfferLetters = lazy(() => import('@/pages/admin/OfferLetters'));

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

        {/* Student Routes */}
        <Route path="/student" element={<ProtectedRoute role="student"><DashboardLayout role="student" /></ProtectedRoute>}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="workspace" element={<StudentWorkspace />} />
          <Route path="workspace/:internshipId" element={<StudentWorkspace />} />
          <Route path="internships" element={<StudentInternships />} />
          <Route path="internships/:id" element={<InternshipDetail />} />
          <Route path="applications" element={<StudentApplications />} />
          <Route path="tasks" element={<StudentTasks />} />
          <Route path="tasks/:id" element={<StudentTasks />} />
          <Route path="progress" element={<StudentProgress />} />
          <Route path="messages" element={<StudentMessages />} />
          <Route path="messages/:id" element={<StudentMessages />} />
          <Route path="certificates" element={<StudentCertificates />} />
          <Route path="offer-letters" element={<StudentOfferLetters />} />
          <Route path="portfolio" element={<StudentPortfolio />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="settings" element={<StudentSettings />} />
        </Route>

        {/* Company Routes */}
        <Route path="/company" element={<ProtectedRoute role="company"><DashboardLayout role="company" /></ProtectedRoute>}>
          <Route index element={<Navigate to="/company/dashboard" replace />} />
          <Route path="dashboard" element={<CompanyDashboard />} />
          <Route path="profile" element={<CompanyProfile />} />
          <Route path="internships" element={<CompanyInternships />} />
          <Route path="internships/new" element={<PostInternship />} />
          <Route path="internships/:id" element={<CompanyInternships />} />
          <Route path="applicants" element={<CompanyApplicants />} />
          <Route path="interns" element={<CompanyInterns />} />
          <Route path="tasks" element={<CompanyTasks />} />
          <Route path="analytics" element={<CompanyAnalytics />} />
          <Route path="certificates" element={<CompanyCertificates />} />
          <Route path="offer-letters" element={<CompanyOfferLetters />} />
          <Route path="team" element={<CompanyTeam />} />
          <Route path="settings" element={<CompanySettings />} />
          <Route path="messages" element={<MentorMessages />} />
        </Route>

        {/* Mentor Routes */}
        <Route path="/mentor" element={<ProtectedRoute role="mentor"><DashboardLayout role="mentor" /></ProtectedRoute>}>
          <Route index element={<Navigate to="/mentor/dashboard" replace />} />
          <Route path="dashboard" element={<MentorDashboard />} />
          <Route path="interns" element={<MentorInterns />} />
          <Route path="interns/:id" element={<MentorInterns />} />
          <Route path="tasks" element={<MentorTasks />} />
          <Route path="evaluations" element={<MentorEvaluations />} />
          <Route path="messages" element={<MentorMessages />} />
          <Route path="messages/:id" element={<MentorMessages />} />
          <Route path="profile" element={<MentorProfile />} />
          <Route path="settings" element={<MentorSettings />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><DashboardLayout role="admin" /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUsers />} />
          <Route path="companies" element={<AdminCompanies />} />
          <Route path="companies/:id" element={<AdminCompanies />} />
          <Route path="internships" element={<AdminInternships />} />
          <Route path="internships/:id" element={<AdminInternships />} />
          <Route path="certificates" element={<AdminCertificates />} />
          <Route path="certificates/:id" element={<AdminCertificates />} />
          <Route path="offer-letters" element={<AdminOfferLetters />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="logs" element={<AdminLogs />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
