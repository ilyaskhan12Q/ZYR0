import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/ProtectedRoute';
import AuthCallback from '@/pages/auth/AuthCallback';

// Public Pages
import Landing from '@/pages/public/Landing';
import BrowseInternships from '@/pages/public/BrowseInternships';
import InternshipDetail from '@/pages/public/InternshipDetail';
import Companies from '@/pages/public/Companies';
import CompanyDetail from '@/pages/public/CompanyDetail';
import Verify from '@/pages/public/Verify';
import About from '@/pages/public/About';
import Contact from '@/pages/public/Contact';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';

// Student Pages
import StudentDashboard from '@/pages/student/Dashboard';
import StudentInternships from '@/pages/student/Internships';
import StudentApplications from '@/pages/student/Applications';
import StudentTasks from '@/pages/student/Tasks';
import StudentProgress from '@/pages/student/Progress';
import StudentMessages from '@/pages/student/Messages';
import StudentCertificates from '@/pages/student/Certificates';
import StudentPortfolio from '@/pages/student/Portfolio';
import StudentProfile from '@/pages/student/Profile';
import StudentSettings from '@/pages/student/Settings';

// Company Pages
import CompanyDashboard from '@/pages/company/Dashboard';
import CompanyProfile from '@/pages/company/Profile';
import CompanyInternships from '@/pages/company/Internships';
import PostInternship from '@/pages/company/PostInternship';
import CompanyApplicants from '@/pages/company/Applicants';
import CompanyInterns from '@/pages/company/Interns';
import CompanyTasks from '@/pages/company/Tasks';
import CompanyAnalytics from '@/pages/company/Analytics';
import CompanyCertificates from '@/pages/company/Certificates';
import CompanyTeam from '@/pages/company/Team';
import CompanySettings from '@/pages/company/Settings';

// Mentor Pages
import MentorDashboard from '@/pages/mentor/Dashboard';
import MentorInterns from '@/pages/mentor/Interns';
import MentorTasks from '@/pages/mentor/Tasks';
import MentorEvaluations from '@/pages/mentor/Evaluations';
import MentorMessages from '@/pages/mentor/Messages';
import MentorProfile from '@/pages/mentor/Profile';
import MentorSettings from '@/pages/mentor/Settings';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminCompanies from '@/pages/admin/Companies';
import AdminInternships from '@/pages/admin/Internships';
import AdminCertificates from '@/pages/admin/Certificates';
import AdminApplications from '@/pages/admin/Applications';
import AdminAnalytics from '@/pages/admin/Analytics';
import AdminReports from '@/pages/admin/Reports';
import AdminSettings from '@/pages/admin/Settings';
import AdminLogs from '@/pages/admin/Logs';

function App() {
  return (

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
          <Route path="internships" element={<StudentInternships />} />
          <Route path="internships/:id" element={<InternshipDetail />} />
          <Route path="applications" element={<StudentApplications />} />
          <Route path="tasks" element={<StudentTasks />} />
          <Route path="tasks/:id" element={<StudentTasks />} />
          <Route path="progress" element={<StudentProgress />} />
          <Route path="messages" element={<StudentMessages />} />
          <Route path="messages/:id" element={<StudentMessages />} />
          <Route path="certificates" element={<StudentCertificates />} />
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
          <Route path="tasks/new" element={<PostInternship />} />
          <Route path="analytics" element={<CompanyAnalytics />} />
          <Route path="certificates" element={<CompanyCertificates />} />
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
          <Route path="applications" element={<AdminApplications />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="logs" element={<AdminLogs />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

  );
}

export default App;
