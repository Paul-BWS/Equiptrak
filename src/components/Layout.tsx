import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Sun, Moon, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/theme-provider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function Layout() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Log for debugging
  console.log("Layout rendering, pathname:", location.pathname, "isAdmin:", isAdmin, "theme:", theme);
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-darkBg">
      {/* Navigation */}
      <header className="bg-white dark:bg-darkCard border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center">
            {/* Remove this image */}
            {/* <img 
              src="/lovable-uploads/logo.png" 
              alt="Basic Welding Supplies Logo" 
              className="h-8 w-auto mr-2"
            /> */}
            <span 
              className="text-xl font-bold text-[#7b96d4] cursor-pointer"
              onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}
            >
              EquipTrack
            </span>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Welcome message */}
            <div className="text-sm font-medium mr-4">
              Welcome {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
            </div>
            
            {/* Theme toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="theme-mode"
                checked={theme === "dark"}
                onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              />
              <Label htmlFor="theme-mode" className="sr-only">
                Toggle theme
              </Label>
              {theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </div>
            
            {/* Sign out button */}
            <Button 
              onClick={handleSignOut}
              className="bg-[#a6e15a] text-white hover:bg-[#95cc50] rounded-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-darkCard border-t p-4">
            <div className="flex flex-col space-y-4">
              {/* Welcome message */}
              <div className="text-sm font-medium">
                Welcome {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
              </div>
              
              {/* Theme toggle */}
              <div className="flex items-center justify-between">
                <span>Dark mode</span>
                <Switch
                  id="mobile-theme-mode"
                  checked={theme === "dark"}
                  onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                />
              </div>
              
              {/* Sign out button */}
              <Button 
                onClick={handleSignOut}
                className="bg-[#a6e15a] text-white hover:bg-[#95cc50] w-full rounded-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        )}
      </header>
      
      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;