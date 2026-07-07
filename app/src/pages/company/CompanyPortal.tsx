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

export default function CompanyPortal() {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
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
    </Routes>
  );
}
