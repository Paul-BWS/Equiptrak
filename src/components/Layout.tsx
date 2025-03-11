import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Layout() {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  console.log("Layout rendering, user:", user?.email, "path:", location.pathname);
  
  // Allow access to public routes and test routes without authentication
  const isPublicRoute = location.pathname === "/" || 
                        location.pathname === "/admin-login" ||
                        location.pathname.includes('public-test') || 
                        location.pathname.includes('test-dashboard');
  
  // Check authentication on mount and when location changes
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication in Layout...");
      setIsCheckingAuth(true);
      
      try {
        // Check if we have a session in localStorage
        const storedSession = localStorage.getItem('equiptrack-auth-token');
        console.log('Session in localStorage:', storedSession ? "Present" : "Missing");
        
        // Get the current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session in Layout:", error);
          if (!isPublicRoute) {
            console.log("Error getting session, redirecting to login");
            navigate("/");
          }
          return;
        }
        
        console.log("Session check result:", { 
          exists: !!session, 
          user: session?.user?.email,
          expires: session?.expires_at
        });
        
        // If we have a session but no user in context, update the user
        if (session && !user) {
          console.log("Session exists but no user in context, updating user");
          setUser(session.user);
        }
        
        // If no session and not on a public route, redirect to login
        if (!session && !isPublicRoute) {
          console.log("No session and not a public route, redirecting to login");
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [user, isPublicRoute, location.pathname, setUser, navigate]);

  // Show loading state while checking authentication
  if (isCheckingAuth && !isPublicRoute) {
    return <div className="flex min-h-screen items-center justify-center">
      <p>Checking authentication...</p>
    </div>;
  }

  return (
    <div className="flex min-h-screen">
      {user && <Sidebar />}
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;