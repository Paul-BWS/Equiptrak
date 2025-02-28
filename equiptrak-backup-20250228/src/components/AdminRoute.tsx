import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  
  // Simple admin check
  const isAdmin = session?.user?.email === "paul@basicwelding.co.uk";
  
  if (!session) {
    return <Navigate to="/" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
} 