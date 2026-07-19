import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RouteLoading } from '@/components/RouteLoading';

const MentorDashboard = lazy(() => import('./Dashboard'));
const MentorInterns = lazy(() => import('./Interns'));
const MentorTasks = lazy(() => import('./Tasks'));
const MentorEvaluations = lazy(() => import('./Evaluations'));
const MentorMessages = lazy(() => import('./Messages'));
const MentorProfile = lazy(() => import('./Profile'));
const MentorSettings = lazy(() => import('./Settings'));

export default function MentorPortal() {
  return (
    <Suspense fallback={<RouteLoading />}>
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<MentorDashboard />} />
      <Route path="interns" element={<MentorInterns />} />
      <Route path="interns/:id" element={<MentorInterns />} />
      <Route path="tasks" element={<MentorTasks />} />
      <Route path="evaluations" element={<MentorEvaluations />} />
      <Route path="messages" element={<MentorMessages />} />
      <Route path="messages/:id" element={<MentorMessages />} />
      <Route path="profile" element={<MentorProfile />} />
      <Route path="settings" element={<MentorSettings />} />
    </Routes>
    </Suspense>
  );
}
