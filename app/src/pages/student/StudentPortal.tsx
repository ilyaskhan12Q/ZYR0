import { Routes, Route, Navigate } from 'react-router-dom';
import StudentDashboard from './Dashboard';
import StudentInternships from './Internships';
import StudentApplications from './Applications';
import StudentTasks from './Tasks';
import StudentProgress from './Progress';
import StudentMessages from './Messages';
import StudentCertificates from './Certificates';
import StudentPortfolio from './Portfolio';
import StudentProfile from './Profile';
import StudentSettings from './Settings';
import StudentOfferLetters from './OfferLetters';
import StudentWorkspace from './Workspace';
import InternshipDetail from '../public/InternshipDetail';

export default function StudentPortal() {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
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
    </Routes>
  );
}
