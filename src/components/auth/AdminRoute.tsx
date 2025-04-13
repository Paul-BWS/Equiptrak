import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children?: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log('AdminRoute rendering for path:', location.pathname);
  console.log('User state:', {
    exists: !!user,
    id: user?.id,
    email: user?.email,
    role: user?.role
  });

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <div className="text-muted-foreground">Checking access...</div>
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (!user || user.role !== 'admin') {
    console.log('Access denied - redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('Admin access granted - rendering content');
  return children || <Outlet />;
} 