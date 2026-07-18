import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RouteLoading } from '@/components/RouteLoading';

const AdminDashboard = lazy(() => import('./Dashboard'));
const AdminUsers = lazy(() => import('./Users'));
const AdminCompanies = lazy(() => import('./Companies'));
const AdminInternships = lazy(() => import('./Internships'));
const AdminCertificates = lazy(() => import('./Certificates'));
const AdminApplications = lazy(() => import('./Applications'));
const AdminAnalytics = lazy(() => import('./Analytics'));
const AdminReports = lazy(() => import('./Reports'));
const AdminSettings = lazy(() => import('./Settings'));
const AdminLogs = lazy(() => import('./Logs'));
const AdminOfferLetters = lazy(() => import('./OfferLetters'));

export default function AdminPortal() {
  return (
    <Suspense fallback={<RouteLoading />}>
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
    </Suspense>
  );
}
