import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { hasCompletedOnboarding } from '@/lib/storage';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const onboarded = hasCompletedOnboarding();

    if (user) {
      navigate('/app');
    } else if (onboarded) {
      navigate('/auth');
    } else {
      navigate('/onboarding');
    }
  }, [user, loading, navigate]);

  return null;
};

export default Index;
