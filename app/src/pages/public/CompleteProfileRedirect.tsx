import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from '@/components/common/Loader';

export default function CompleteProfileRedirect() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      navigate('/login');
      return;
    }
    
    const dashboardMap: Record<string, string> = {
      student: '/student/profile',
      company: '/company/profile',
      mentor: '/mentor/profile',
      admin: '/admin/dashboard',
    };
    
    navigate(dashboardMap[profile.role] || '/');
  }, [profile, loading, navigate]);

  return <Loader variant="page" label="Redirecting to your profile..." />;
}
