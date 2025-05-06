import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  ArrowLeft,
  Building,
  Database,
  ClipboardList,
  Package,
  BellRing
} from "lucide-react";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const canGoBack = window.history.length > 1;
  
  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#7b96d4] text-white dark:bg-[#1E2227]">
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
                window.history.back();
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
            {isAdmin ? (
              // Admin navigation
              <>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-white hover:bg-white/10 ${
                    isActive("/admin") ? "bg-white/20" : ""
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
                    isActive("/equipment-list") ? "bg-white/20" : ""
                  }`}
                  onClick={() => {
                    navigate("/equipment-list");
                    if (isMobile) setIsOpen(false);
                  }}
                >
                  <PencilRuler className="mr-2 h-5 w-5" />
                  All Equipment
                </Button>
                
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-white hover:bg-white/10 ${
                    isActive("/personnel") ? "bg-white/20" : ""
                  }`}
                  onClick={() => {
                    navigate("/personnel");
                    if (isMobile) setIsOpen(false);
                  }}
                >
                  <Users className="mr-2 h-5 w-5" />
                  All Personnel
                </Button>
                
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-white hover:bg-white/10 ${
                    isActive("/work-orders") ? "bg-white/20" : ""
                  }`}
                  onClick={() => {
                    navigate("/work-orders");
                    if (isMobile) setIsOpen(false);
                  }}
                >
                  <ClipboardList className="mr-2 h-5 w-5" />
                  Jobs
                </Button>

                <Button
                  variant="ghost"
                  className={`w-full justify-start text-white hover:bg-white/10 ${
                    isActive("/products") ? "bg-white/20" : ""
                  }`}
                  onClick={() => {
                    navigate("/products");
                    if (isMobile) setIsOpen(false);
                  }}
                >
                  <Package className="mr-2 h-5 w-5" />
                  Products
                </Button>
                
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-white hover:bg-white/10 ${
                    isActive("/admin-reminders") ? "bg-white/20" : ""
                  }`}
                  onClick={() => {
                    navigate("/admin-reminders");
                    if (isMobile) setIsOpen(false);
                  }}
                >
                  <BellRing className="mr-2 h-5 w-5" />
                  Reminders
                </Button>
              </>
            ) : (
              // Regular user navigation
              <>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-white hover:bg-white/10 ${
                    isActive("/dashboard") ? "bg-white/20" : ""
                  }`}
                  onClick={() => {
                    navigate("/dashboard");
                    if (isMobile) setIsOpen(false);
                  }}
                >
                  <Building className="mr-2 h-5 w-5" />
                  Overview
                </Button>
                
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-white hover:bg-white/10 ${
                    isActive("/equipment") ? "bg-white/20" : ""
                  }`}
                  onClick={() => {
                    navigate("/equipment");
                    if (isMobile) setIsOpen(false);
                  }}
                >
                  <PencilRuler className="mr-2 h-5 w-5" />
                  Equipment
                </Button>
                
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-white hover:bg-white/10 ${
                    isActive("/work-orders") ? "bg-white/20" : ""
                  }`}
                  onClick={() => {
                    navigate("/work-orders");
                    if (isMobile) setIsOpen(false);
                  }}
                >
                  <ClipboardList className="mr-2 h-5 w-5" />
                  Jobs
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-white/20">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
  
  if (isMobile) {
    return (
      <div className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white dark:bg-[#1E2227] px-4 md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <h1 className="ml-2 text-xl font-semibold">EquipTrack</h1>
          </div>
          <SheetContent side="left" className="p-0 w-[280px]">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>
    );
  }
  
  return (
    <div className="hidden md:block md:w-64 lg:w-56 xl:w-64 border-r shrink-0">
      {sidebarContent}
    </div>
  );
}

export default Sidebar; 