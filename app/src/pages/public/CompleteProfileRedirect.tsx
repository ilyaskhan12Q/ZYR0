import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground">Redirecting to your profile...</p>
      </div>
    </div>
  );
}
