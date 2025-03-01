import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  PencilRuler,
  ArrowLeft
} from "lucide-react";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const canGoBack = window.history.length > 1;
  
  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#7b96d4] text-white">
      <div className="p-4 border-b border-white/20 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">EquipTrack</h2>
        {isMobile && (
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <div className="flex-1 py-4 overflow-auto">
        {isMobile && canGoBack && (
          <div className="px-3 mb-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
              onClick={() => {
                navigate(-1);
                setIsOpen(false);
              }}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
          </div>
        )}
        
        <div className="px-3 py-2">
          <h3 className="mb-2 px-4 text-xs font-semibold text-white/70 uppercase">
            Main
          </h3>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className={`w-full justify-start text-white hover:bg-white/10 ${
                isActive("/admin") && !isActive("/admin/customer") ? "bg-white/20" : ""
              }`}
              onClick={() => {
                navigate("/admin");
                if (isMobile) setIsOpen(false);
              }}
            >
              <Home className="mr-2 h-5 w-5" />
              Customers
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start text-white hover:bg-white/10 ${
                isActive("/admin/personnel") ? "bg-white/20" : ""
              }`}
              onClick={() => {
                navigate("/admin/personnel");
                if (isMobile) setIsOpen(false);
              }}
            >
              <Users className="mr-2 h-5 w-5" />
              Personnel
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start text-white hover:bg-white/10 ${
                isActive("/admin/equipment") ? "bg-white/20" : ""
              }`}
              onClick={() => {
                navigate("/admin/equipment");
                if (isMobile) setIsOpen(false);
              }}
            >
              <PencilRuler className="mr-2 h-5 w-5" />
              Equipment
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start text-white hover:bg-white/10 ${
                isActive("/admin/service") ? "bg-white/20" : ""
              }`}
              onClick={() => {
                navigate("/admin/service");
                if (isMobile) setIsOpen(false);
              }}
            >
              <FileText className="mr-2 h-5 w-5" />
              Service Records
            </Button>
          </div>
        </div>
        
        <div className="px-3 py-2 mt-4">
          <h3 className="mb-2 px-4 text-xs font-semibold text-white/70 uppercase">
            Settings
          </h3>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className={`w-full justify-start text-white hover:bg-white/10 ${
                isActive("/admin/settings") ? "bg-white/20" : ""
              }`}
              onClick={() => {
                navigate("/admin/settings");
                if (isMobile) setIsOpen(false);
              }}
            >
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#7b96d4]">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="ml-2">
            <p className="text-sm font-medium">{user?.email?.split('@')[0] || "User"}</p>
            <p className="text-xs text-white/70">{user?.email || ""}</p>
          </div>
        </div>
        
        <Button
          variant="outline"
          className="w-full justify-start text-white border-white hover:bg-white/10"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
  
  // For desktop: render the sidebar directly
  if (!isMobile) {
    return (
      <div className="hidden md:block w-64 border-r border-[#7b96d4] h-screen overflow-y-auto">
        {sidebarContent}
      </div>
    );
  }
  
  // For mobile: render just the floating circular menu button
  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              size="icon" 
              className="h-12 w-12 rounded-full shadow-lg bg-[#7b96d4] text-white hover:bg-[#6a85c3]"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>
      
      {/* No content padding needed for mobile anymore */}
    </>
  );
} 