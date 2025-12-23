import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasCompletedOnboarding, getUser } from '@/lib/storage';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUser();
    const onboarded = hasCompletedOnboarding();

    if (user) {
      navigate('/app');
    } else if (onboarded) {
      navigate('/auth');
    } else {
      navigate('/onboarding');
    }
  }, [navigate]);

  return null;
};

export default Index;
