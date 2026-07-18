import { Routes, Route, Navigate } from 'react-router-dom';
import CompanyDashboard from './Dashboard';
import CompanyProfile from './Profile';
import CompanyInternships from './Internships';
import PostInternship from './PostInternship';
import CompanyApplicants from './Applicants';
import CompanyInterns from './Interns';
import CompanyTasks from './Tasks';
import CompanyAnalytics from './Analytics';
import CompanyCertificates from './Certificates';
import CompanyOfferLetters from './OfferLetters';
import CompanyTeam from './Team';
import CompanySettings from './Settings';
import MentorMessages from '../mentor/Messages';
import CompanyVerificationGate from '@/components/CompanyVerificationGate';

export default function CompanyPortal() {
  return (
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
  );
}
