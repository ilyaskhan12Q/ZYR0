import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RouteLoading } from '@/components/RouteLoading';

const StudentDashboard = lazy(() => import('./Dashboard'));
const StudentInternships = lazy(() => import('./Internships'));
const StudentApplications = lazy(() => import('./Applications'));
const StudentTasks = lazy(() => import('./Tasks'));
const StudentProgress = lazy(() => import('./Progress'));
const StudentMessages = lazy(() => import('./Messages'));
const StudentCertificates = lazy(() => import('./Certificates'));
const StudentPortfolio = lazy(() => import('./Portfolio'));
const StudentProfile = lazy(() => import('./Profile'));
const StudentSettings = lazy(() => import('./Settings'));
const StudentOfferLetters = lazy(() => import('./OfferLetters'));
const StudentWorkspace = lazy(() => import('./Workspace'));
const InternshipDetail = lazy(() => import('../public/InternshipDetail'));
const StudentSavedInternships = lazy(() => import('./SavedInternships'));

export default function StudentPortal() {
  return (
    <Suspense fallback={<RouteLoading />}>
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<StudentDashboard />} />
      <Route path="workspace" element={<StudentWorkspace />} />
      <Route path="workspace/:internshipId" element={<StudentWorkspace />} />
      <Route path="internships" element={<StudentInternships />} />
      <Route path="internships/:id" element={<InternshipDetail />} />
      <Route path="saved" element={<StudentSavedInternships />} />
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
    </Routes>
    </Suspense>
  );
}
