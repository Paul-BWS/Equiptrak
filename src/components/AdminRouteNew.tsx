import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function AdminRouteNew({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  
  // If no auth context or no user, redirect to login
  if (!auth || !auth.user) {
    console.log('AdminRoute: No authenticated user, redirecting to login');
    return <Navigate to="/" replace />;
  }
  
  // Check if user is an admin
  const isAdmin = auth.user.email === 'paul@basicwelding.co.uk';
  
  if (isAdmin) {
    console.log('AdminRoute: Admin user detected, allowing access');
    return <>{children}</>;
  }
  
  // For non-admin users, redirect to dashboard
  console.log('AdminRoute: Non-admin user detected, redirecting to dashboard');
  return <Navigate to="/dashboard" replace />;
} 