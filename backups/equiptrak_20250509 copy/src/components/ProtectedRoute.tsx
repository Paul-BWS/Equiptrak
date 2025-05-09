import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, setUser } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      console.log("ProtectedRoute: Checking authentication...");
      setIsCheckingAuth(true);
      
      try {
        // Check if we have a session in localStorage
        const storedSession = localStorage.getItem('equiptrack-auth-token');
        console.log('ProtectedRoute: Session in localStorage:', storedSession ? "Present" : "Missing");
        
        // Get the current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("ProtectedRoute: Error getting session:", error);
          window.location.replace("/");
          return;
        }
        
        console.log("ProtectedRoute: Session check result:", { 
          exists: !!session, 
          user: session?.user?.email
        });
        
        // If we have a session but no user in context, update the user
        if (session && !user) {
          console.log("ProtectedRoute: Session exists but no user in context, updating user");
          setUser(session.user);
        }
        
        // If no session, redirect to login
        if (!session) {
          console.log("ProtectedRoute: No session, redirecting to login");
          window.location.replace("/");
        }
      } catch (error) {
        console.error("ProtectedRoute: Error checking authentication:", error);
        window.location.replace("/");
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [user, setUser]);
  
  // Don't render anything until we're sure the user is authenticated
  if (isCheckingAuth || !user) {
    return <div className="flex min-h-screen items-center justify-center">
      <p>Checking authentication...</p>
    </div>;
  }
  
  // Render children if authenticated
  return <>{children}</>;
}

// Add a default export as well to be safe
export default ProtectedRoute; 