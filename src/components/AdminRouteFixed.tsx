import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function AdminRouteFixed({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkAdminRole = async () => {
      console.log('AdminRouteFixed: Checking admin role...');
      setIsChecking(true);
      
      if (!user) {
        console.log('AdminRouteFixed: No user found, redirecting to login');
        setIsAdmin(false);
        // Redirect to login if not authenticated
        window.location.replace("/");
        return;
      }
      
      try {
        // Check if user has admin role in metadata
        const userRole = user.user_metadata?.role;
        const companyId = user.user_metadata?.company_id;
        
        console.log('AdminRouteFixed: User role check:', { 
          userId: user.id, 
          email: user.email, 
          role: userRole,
          companyId: companyId
        });
        
        // Check if user has admin role - simple boolean check
        const hasAdminRole = userRole === 'admin';
        
        if (!hasAdminRole) {
          console.log('AdminRouteFixed: User is not an admin, redirecting to appropriate dashboard');
          
          // For non-admin users, redirect based on company ID
          if (companyId) {
            console.log(`AdminRouteFixed: Redirecting to company dashboard with ID ${companyId}`);
            window.location.replace(`/dashboard/company-simple?id=${companyId}`);
          } else {
            // For users without company ID, redirect to general dashboard
            console.log('AdminRouteFixed: Redirecting to general dashboard');
            window.location.replace("/dashboard");
          }
        }
        
        setIsAdmin(hasAdminRole);
      } catch (error) {
        console.error('AdminRouteFixed: Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAdminRole();
  }, [user]);
  
  // Show loading while checking admin status
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
          <p className="text-lg">Checking permissions...</p>
        </div>
      </div>
    );
  }
  
  // If user is admin, allow access
  if (isAdmin) {
    return <>{children}</>;
  }
  
  // Show a message while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="mb-4">You don't have permission to access this page. Redirecting...</p>
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
      </div>
    </div>
  );
} 