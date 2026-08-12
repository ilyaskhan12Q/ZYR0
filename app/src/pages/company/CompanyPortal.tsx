import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CompanyVerificationGate from '@/components/CompanyVerificationGate';
import TabGate from '@/components/TabGate';
import { RouteLoading } from '@/components/RouteLoading';

const CompanyDashboard = lazy(() => import('./Dashboard'));
const CompanyProfile = lazy(() => import('./Profile'));
const CompanyInternships = lazy(() => import('./Internships'));
const PostInternship = lazy(() => import('./PostInternship'));
const CompanyApplications = lazy(() => import('./Applications'));
const CompanyInterns = lazy(() => import('./Interns'));
const CompanyTasks = lazy(() => import('./Tasks'));
const CompanyAnalytics = lazy(() => import('./Analytics'));
const CompanyCertificates = lazy(() => import('./Certificates'));
const CompanyOfferLetters = lazy(() => import('./OfferLetters'));
const CompanyTeam = lazy(() => import('./Team'));
const CompanySettings = lazy(() => import('./Settings'));
const MentorMessages = lazy(() => import('../mentor/Messages'));

export default function CompanyPortal() {
  return (
    <Suspense fallback={<RouteLoading />}>
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />

      {/* Dashboard gets a warning banner if unverified, but remains accessible */}
      <Route
        path="dashboard"
        element={
          <TabGate tab="dashboard">
            <CompanyVerificationGate mode="banner">
              <CompanyDashboard />
            </CompanyVerificationGate>
          </TabGate>
        }
      />

      {/* Profile tab — every role; Settings — owner only */}
      <Route path="profile" element={<TabGate tab="profile"><CompanyProfile /></TabGate>} />
      <Route path="settings" element={<TabGate tab="settings"><CompanySettings /></TabGate>} />

      {/* Blocked actions/views requiring full approval status, gated by role */}
      <Route
        path="internships"
        element={
          <TabGate tab="internships">
            <CompanyVerificationGate mode="block">
              <CompanyInternships />
            </CompanyVerificationGate>
          </TabGate>
        }
      />
      <Route
        path="internships/new"
        element={
          <TabGate tab="internships">
            <CompanyVerificationGate mode="block">
              <PostInternship />
            </CompanyVerificationGate>
          </TabGate>
        }
      />
      <Route
        path="internships/:id"
        element={
          <TabGate tab="internships">
            <CompanyVerificationGate mode="block">
              <CompanyInternships />
            </CompanyVerificationGate>
          </TabGate>
        }
      />
      <Route
        path="applications"
        element={
          <TabGate tab="applications">
            <CompanyVerificationGate mode="block">
              <CompanyApplications />
            </CompanyVerificationGate>
          </TabGate>
        }
      />
      <Route
        path="interns"
        element={
          <TabGate tab="interns">
            <CompanyVerificationGate mode="block">
              <CompanyInterns />
            </CompanyVerificationGate>
          </TabGate>
        }
      />
      <Route
        path="tasks"
        element={
          <TabGate tab="tasks">
            <CompanyVerificationGate mode="block">
              <CompanyTasks />
            </CompanyVerificationGate>
          </TabGate>
        }
      />
      <Route
        path="analytics"
        element={
          <TabGate tab="analytics">
            <CompanyVerificationGate mode="block">
              <CompanyAnalytics />
            </CompanyVerificationGate>
          </TabGate>
        }
      />
      <Route
        path="certificates"
        element={
          <TabGate tab="certificates">
            <CompanyVerificationGate mode="block">
              <CompanyCertificates />
            </CompanyVerificationGate>
          </TabGate>
        }
      />
      <Route
        path="offer-letters"
        element={
          <TabGate tab="offer-letters">
            <CompanyVerificationGate mode="block">
              <CompanyOfferLetters />
            </CompanyVerificationGate>
          </TabGate>
        }
      />
      <Route
        path="team"
        element={
          <TabGate tab="team">
            <CompanyVerificationGate mode="block">
              <CompanyTeam />
            </CompanyVerificationGate>
          </TabGate>
        }
      />
      <Route
        path="messages"
        element={
          <TabGate tab="messages">
            <CompanyVerificationGate mode="block">
              <MentorMessages />
            </CompanyVerificationGate>
          </TabGate>
        }
      />
    </Routes>
    </Suspense>
  );
}