import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children?: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { session } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  console.log('AdminRoute rendering for path:', location.pathname);
  console.log('Session state:', {
    exists: !!session,
    userId: session?.user?.id,
    email: session?.user?.email
  });

  useEffect(() => {
    let isMounted = true;

    async function checkAdminStatus() {
      try {
        if (!session?.user?.id) {
          if (isMounted) {
            setIsAdmin(false);
            setError(null);
          }
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, email")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          if (isMounted) {
            setError(profileError.message);
            setIsAdmin(false);
          }
          return;
        }

        if (!profile) {
          if (isMounted) {
            setError("Profile not found");
            setIsAdmin(false);
          }
          return;
        }

        const hasAccess = 
          profile.email === "paul@basicwelding.co.uk" || 
          profile.email === "sales@basicwelding.co.uk" ||
          profile.role === "admin";

        if (isMounted) {
          setIsAdmin(hasAccess);
          setError(null);
        }

      } catch (error) {
        console.error("Error in admin check:", error);
        if (isMounted) {
          setError("Unexpected error checking admin status");
          setIsAdmin(false);
        }
      }
    }

    checkAdminStatus();

    return () => {
      isMounted = false;
    };
  }, [session]);

  // Show loading state while checking admin status
  if (isAdmin === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <div className="text-muted-foreground">Checking access...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
        <div className="text-red-500">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  // Redirect if not admin
  if (!isAdmin) {
    console.log('Access denied - redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('Admin access granted - rendering content');
  return children || <Outlet />;
} 