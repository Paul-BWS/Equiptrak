import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useParams } from 'react-router-dom';

export function CompanyRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { customerId } = useParams();
  const [hasAccess, setHasAccess] = React.useState<boolean | null>(null);
  
  // Check if user has access to this company
  React.useEffect(() => {
    const checkCompanyAccess = async () => {
      if (!auth || !auth.user) {
        setHasAccess(false);
        return;
      }
      
      try {
        // Admins can access any company
        if (auth.userData?.role === 'admin') {
          console.log('Admin user detected, granting access to company');
          setHasAccess(true);
          return;
        }
        
        // Regular users can only access their own company
        const hasCompanyAccess = auth.userData?.companyId === customerId;
        
        console.log('Company access check:', { 
          email: auth.user.email, 
          userCompanyId: auth.userData?.companyId,
          requestedCompanyId: customerId,
          hasAccess: hasCompanyAccess
        });
        
        setHasAccess(hasCompanyAccess);
      } catch (error) {
        console.error('Error in company access check:', error);
        setHasAccess(false);
      }
    };
    
    checkCompanyAccess();
  }, [auth, customerId]);
  
  // Show loading while checking access
  if (hasAccess === null) {
    return <div>Checking company access...</div>;
  }
  
  // If no auth context or no user, redirect to login
  if (!auth || !auth.user) {
    console.log('CompanyRoute: No authenticated user, redirecting to login');
    return <Navigate to="/" replace />;
  }
  
  // If user has access, allow access
  if (hasAccess) {
    console.log('CompanyRoute: User has access to company, allowing access');
    return <>{children}</>;
  }
  
  // For users without access, redirect to dashboard
  console.log('CompanyRoute: User does not have access to company, redirecting to dashboard');
  return <Navigate to="/dashboard" replace />;
} 