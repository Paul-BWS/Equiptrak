import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function AdminRouteSimple({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  
  // If no auth context or no user, redirect to login
  if (!auth || !auth.user) {
    console.log('AdminRoute: No authenticated user, redirecting to login');
    return <Navigate to="/" replace />;
  }
  
  // For paul@basicwelding.co.uk - always allow access (admin)
  if (auth.user.email === 'paul@basicwelding.co.uk') {
    console.log('AdminRoute: Admin detected, allowing access');
    return <>{children}</>;
  }
  
  // For all other users, redirect to dashboard
  console.log('AdminRoute: Non-admin user detected, redirecting to dashboard');
  return <Navigate to="/dashboard" replace />;
} 