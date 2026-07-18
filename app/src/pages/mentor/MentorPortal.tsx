import { Routes, Route, Navigate } from 'react-router-dom';
import MentorDashboard from './Dashboard';
import MentorInterns from './Interns';
import MentorTasks from './Tasks';
import MentorEvaluations from './Evaluations';
import MentorMessages from './Messages';
import MentorProfile from './Profile';
import MentorSettings from './Settings';

export default function MentorPortal() {
  return (
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
  );
}
