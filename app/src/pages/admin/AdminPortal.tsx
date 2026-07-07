import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './Dashboard';
import AdminUsers from './Users';
import AdminCompanies from './Companies';
import AdminInternships from './Internships';
import AdminCertificates from './Certificates';
import AdminApplications from './Applications';
import AdminAnalytics from './Analytics';
import AdminReports from './Reports';
import AdminSettings from './Settings';
import AdminLogs from './Logs';
import AdminOfferLetters from './OfferLetters';

export default function AdminPortal() {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
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
    </Routes>
  );
}
