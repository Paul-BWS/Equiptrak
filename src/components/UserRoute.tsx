import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function UserRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
  
  // Check if user is authenticated and has a company
  React.useEffect(() => {
    const checkAuthentication = async () => {
      if (!auth || !auth.user) {
        setIsAuthenticated(false);
        return;
      }
      
      try {
        // User is authenticated if they have a valid session
        const isValid = !!auth.session && !!auth.user;
        console.log('User authentication check:', { 
          email: auth.user.email, 
          hasSession: !!auth.session,
          companyId: auth.userData?.companyId,
          isValid
        });
        
        setIsAuthenticated(isValid);
      } catch (error) {
        console.error('Error in authentication check:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuthentication();
  }, [auth]);
  
  // Show loading while checking authentication status
  if (isAuthenticated === null) {
    return <div>Checking authentication...</div>;
  }
  
  // If no auth context or no user, redirect to login
  if (!auth || !auth.user) {
    console.log('UserRoute: No authenticated user, redirecting to login');
    return <Navigate to="/" replace />;
  }
  
  // If user is authenticated, allow access
  if (isAuthenticated) {
    console.log('UserRoute: Authenticated user detected, allowing access');
    return <>{children}</>;
  }
  
  // For non-authenticated users, redirect to login
  console.log('UserRoute: Non-authenticated user detected, redirecting to login');
  return <Navigate to="/" replace />;
} 