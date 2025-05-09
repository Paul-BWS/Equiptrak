import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/theme-provider";
import {
  Home,
  Users,
  Settings,
  LogOut,
  PencilRuler,
  Building,
  ClipboardList,
  Package,
  BellRing,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Moon,
  Sun
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isAdmin = user?.role === 'admin';
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const buttonClasses = cn(
    "w-full justify-start text-gray-600 hover:bg-gray-200/50 hover:text-gray-900",
    "rounded-full transition-all duration-300",
    isCollapsed ? "px-3" : "px-3"
  );

  const sidebarContent = (
    <div className={cn(
      "flex flex-col h-screen bg-[#f5f5f5] border-r border-gray-200 transition-all duration-300 dark:bg-[#1D2125] dark:border-gray-800",
      isCollapsed ? "w-[70px]" : "w-64"
    )}>
      <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        {!isCollapsed && <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">EquipTrack</h2>}
        <Button 
          variant="ghost" 
          size="sm"
          className="text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 dark:text-gray-400 dark:hover:text-gray-200 rounded-full"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="flex-1 py-4 overflow-auto">
        <div className="px-2">
          {!isCollapsed && (
            <h3 className="mb-2 px-3 text-xs font-medium text-gray-500 uppercase">
              Main
            </h3>
          )}
          <div className="space-y-1">
            {isAdmin ? (
              // Admin navigation
              <>
                <Button
                  variant="ghost"
                  className={cn(
                    buttonClasses,
                    isActive("/admin") ? "bg-gray-200/50 text-gray-900" : ""
                  )}
                  onClick={() => navigate("/admin")}
                >
                  <Home className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "Customers"}
                </Button>
                
                <Button
                  variant="ghost"
                  className={cn(
                    buttonClasses,
                    isActive("/equipment-list") ? "bg-gray-200/50 text-gray-900" : ""
                  )}
                  onClick={() => navigate("/equipment-list")}
                >
                  <PencilRuler className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "All Equipment"}
                </Button>
                
                <Button
                  variant="ghost"
                  className={cn(
                    buttonClasses,
                    isActive("/personnel") ? "bg-gray-200/50 text-gray-900" : ""
                  )}
                  onClick={() => navigate("/personnel")}
                >
                  <Users className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "All Personnel"}
                </Button>
                
                <Button
                  variant="ghost"
                  className={cn(
                    buttonClasses,
                    isActive("/work-orders") ? "bg-gray-200/50 text-gray-900" : ""
                  )}
                  onClick={() => navigate("/work-orders")}
                >
                  <ClipboardList className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "Work Orders"}
                </Button>

                <Button
                  variant="ghost"
                  className={cn(
                    buttonClasses,
                    isActive("/products") ? "bg-gray-200/50 text-gray-900" : ""
                  )}
                  onClick={() => navigate("/products")}
                >
                  <Package className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "Products"}
                </Button>
                
                <Button
                  variant="ghost"
                  className={cn(
                    buttonClasses,
                    isActive("/admin-reminders") ? "bg-gray-200/50 text-gray-900" : ""
                  )}
                  onClick={() => navigate("/admin-reminders")}
                >
                  <BellRing className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "Reminders"}
                </Button>

                <Button
                  variant="ghost"
                  className={cn(
                    buttonClasses,
                    isActive("/chat") ? "bg-gray-200/50 text-gray-900" : ""
                  )}
                  onClick={() => navigate("/chat")}
                >
                  <MessageSquare className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "Chat"}
                </Button>
              </>
            ) : (
              // Regular user navigation
              <>
                <Button
                  variant="ghost"
                  className={cn(
                    buttonClasses,
                    isActive("/dashboard") ? "bg-gray-200/50 text-gray-900" : ""
                  )}
                  onClick={() => navigate("/dashboard")}
                >
                  <Building className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "Overview"}
                </Button>
                
                <Button
                  variant="ghost"
                  className={cn(
                    buttonClasses,
                    isActive("/equipment") ? "bg-gray-200/50 text-gray-900" : ""
                  )}
                  onClick={() => navigate("/equipment")}
                >
                  <PencilRuler className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "Equipment"}
                </Button>
                
                <Button
                  variant="ghost"
                  className={cn(
                    buttonClasses,
                    isActive("/work-orders") ? "bg-gray-200/50 text-gray-900" : ""
                  )}
                  onClick={() => navigate("/work-orders")}
                >
                  <ClipboardList className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "Work Orders"}
                </Button>

                <Button
                  variant="ghost"
                  className={cn(
                    buttonClasses,
                    isActive("/chat") ? "bg-gray-200/50 text-gray-900" : ""
                  )}
                  onClick={() => navigate("/chat")}
                >
                  <MessageSquare className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "Chat"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <Button
          variant="ghost"
          className={cn(
            buttonClasses,
            "mb-2",
            theme === "dark" ? "bg-[#1D2125] text-white hover:bg-[#2D3135] hover:text-white" : ""
          )}
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? (
            <Moon className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
          ) : (
            <Sun className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
          )}
          {!isCollapsed && (theme === "light" ? "Dark Mode" : "Light Mode")}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            buttonClasses,
            "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          )}
          onClick={handleSignOut}
        >
          <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
          {!isCollapsed && "Logout"}
        </Button>
      </div>
    </div>
  );

  return (
    <nav className="h-screen flex-shrink-0">
      {sidebarContent}
    </nav>
  );
}

export default Sidebar; 