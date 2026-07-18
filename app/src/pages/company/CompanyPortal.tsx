import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CompanyVerificationGate from '@/components/CompanyVerificationGate';
import { RouteLoading } from '@/components/RouteLoading';

const CompanyDashboard = lazy(() => import('./Dashboard'));
const CompanyProfile = lazy(() => import('./Profile'));
const CompanyInternships = lazy(() => import('./Internships'));
const PostInternship = lazy(() => import('./PostInternship'));
const CompanyApplicants = lazy(() => import('./Applicants'));
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
          <CompanyVerificationGate mode="banner">
            <CompanyDashboard />
          </CompanyVerificationGate>
        } 
      />
      
      {/* Profile and Settings are accessible so they can update info or appeal */}
      <Route path="profile" element={<CompanyProfile />} />
      <Route path="settings" element={<CompanySettings />} />

      {/* Blocked actions/views requiring full approval status */}
      <Route 
        path="internships" 
        element={
          <CompanyVerificationGate mode="block">
            <CompanyInternships />
          </CompanyVerificationGate>
        } 
      />
      <Route 
        path="internships/new" 
        element={
          <CompanyVerificationGate mode="block">
            <PostInternship />
          </CompanyVerificationGate>
        } 
      />
      <Route 
        path="internships/:id" 
        element={
          <CompanyVerificationGate mode="block">
            <CompanyInternships />
          </CompanyVerificationGate>
        } 
      />
      <Route 
        path="applicants" 
        element={
          <CompanyVerificationGate mode="block">
            <CompanyApplicants />
          </CompanyVerificationGate>
        } 
      />
      <Route 
        path="interns" 
        element={
          <CompanyVerificationGate mode="block">
            <CompanyInterns />
          </CompanyVerificationGate>
        } 
      />
      <Route 
        path="tasks" 
        element={
          <CompanyVerificationGate mode="block">
            <CompanyTasks />
          </CompanyVerificationGate>
        } 
      />
      <Route 
        path="analytics" 
        element={
          <CompanyVerificationGate mode="block">
            <CompanyAnalytics />
          </CompanyVerificationGate>
        } 
      />
      <Route 
        path="certificates" 
        element={
          <CompanyVerificationGate mode="block">
            <CompanyCertificates />
          </CompanyVerificationGate>
        } 
      />
      <Route 
        path="offer-letters" 
        element={
          <CompanyVerificationGate mode="block">
            <CompanyOfferLetters />
          </CompanyVerificationGate>
        } 
      />
      <Route 
        path="team" 
        element={
          <CompanyVerificationGate mode="block">
            <CompanyTeam />
          </CompanyVerificationGate>
        } 
      />
      <Route 
        path="messages" 
        element={
          <CompanyVerificationGate mode="block">
            <MentorMessages />
          </CompanyVerificationGate>
        } 
      />
    </Routes>
    </Suspense>
  );
}
