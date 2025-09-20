import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const AuthCallback = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Check for auth error in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (error) {
      toast({
        title: "Authentication Error",
        description: errorDescription || error,
        variant: "destructive"
      });
    }
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect authenticated users to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Redirect to auth page if not authenticated (error case)
  return <Navigate to="/auth" replace />;
};

export default AuthCallback;