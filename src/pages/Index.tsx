import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/components/auth/LoginPage';
import { Dashboard } from '@/components/dashboard/Dashboard';

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Dashboard />;
};

export default Index;
