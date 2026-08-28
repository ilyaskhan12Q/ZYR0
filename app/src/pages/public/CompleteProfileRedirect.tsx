import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from '@/components/common/Loader';

export default function CompleteProfileRedirect() {
  const { profile, loading, profileLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !profileLoaded) return;
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
  }, [profile, loading, profileLoaded, navigate]);

  return <Loader variant="page" label="Redirecting to your profile..." />;
}
