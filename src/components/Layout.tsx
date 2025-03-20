import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log("Layout rendering, user:", user?.email, "path:", location.pathname);
  
  // Check authentication on mount and when location changes
  useEffect(() => {
    // If not logged in and not on login page, redirect to login
    if (!user && location.pathname !== "/login") {
      console.log("No user found, redirecting to login");
      navigate("/login");
    }
  }, [user, navigate, location.pathname]);
  
  // For authenticated users, render the layout
  return (
    <div className="flex min-h-screen bg-gray-100">
      {user && <Sidebar />}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;