import { Outlet, useLocation } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";

export function Layout() {
  const location = useLocation();
  const { session } = useAuth();
  const isAdmin = session?.user?.email === "paul@basicwelding.co.uk";
  
  console.log('Layout rendering, pathname:', location.pathname, 'isAdmin:', isAdmin);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 bg-background">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;