import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function AdminRouteFixed({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkTimeout, setCheckTimeout] = useState(false);
  
  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAdmin === null) {
        console.log('Admin check timed out, defaulting to non-admin');
        setCheckTimeout(true);
        setIsAdmin(false);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timer);
  }, [isAdmin]);
  
  // Check if user has admin role
  useEffect(() => {
    const checkAdminRole = async () => {
      console.log('AdminRouteFixed: Checking admin role, auth state:', { 
        hasAuth: !!auth, 
        hasUser: !!auth?.user,
        userId: auth?.user?.id,
        email: auth?.user?.email
      });
      
      if (!auth || !auth.user) {
        console.log('AdminRouteFixed: No auth or user, setting isAdmin to false');
        setIsAdmin(false);
        return;
      }
      
      try {
        // For development/testing, allow specific test emails to be admin
        if (auth.user.email === 'admin@example.com' || 
            auth.user.email === 'test@example.com' || 
            auth.user.email === 'paul@basicwelding.co.uk') {
          console.log('AdminRouteFixed: Test admin email detected, granting access');
          setIsAdmin(true);
          return;
        }
        
        // Get user profile to check role
        console.log('AdminRouteFixed: Checking user role in Supabase');
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
  
  // Show loading while checking admin status, unless timeout occurred
  if (isAdmin === null && !checkTimeout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4">Checking permissions...</p>
        </div>
      </div>
    );
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