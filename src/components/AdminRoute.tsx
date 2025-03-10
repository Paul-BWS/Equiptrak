import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  
  // Check if user has admin role
  React.useEffect(() => {
    const checkAdminRole = async () => {
      if (!auth || !auth.user) {
        setIsAdmin(false);
        return;
      }
      
      try {
        // Get user profile to check role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', auth.user.id)
          .single();
          
        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
          return;
        }
        
        // Check if user has admin role
        const hasAdminRole = profile?.role === 'admin';
        console.log('User role check:', { email: auth.user.email, role: profile?.role, isAdmin: hasAdminRole });
        setIsAdmin(hasAdminRole);
      } catch (error) {
        console.error('Error in admin role check:', error);
        setIsAdmin(false);
      }
    };
    
    checkAdminRole();
  }, [auth]);
  
  // Show loading while checking admin status
  if (isAdmin === null) {
    return <div>Checking permissions...</div>;
  }
  
  // If no auth context or no user, redirect to login
  if (!auth || !auth.user) {
    console.log('AdminRoute: No authenticated user, redirecting to login');
    return <Navigate to="/" replace />;
  }
  
  // If user is admin, allow access
  if (isAdmin) {
    console.log('AdminRoute: Admin user detected, allowing access');
    return <>{children}</>;
  }
  
  // For non-admin users, redirect to dashboard
  console.log('AdminRoute: Non-admin user detected, redirecting to dashboard');
  return <Navigate to="/dashboard" replace />;
} 
} 