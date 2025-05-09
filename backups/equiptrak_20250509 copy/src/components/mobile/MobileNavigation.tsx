import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Home, 
  User, 
  Menu, 
  Settings,
  LogOut,
  X
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  
  // Check if we can go back (if there's history)
  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, [location]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };
  
  return (
    <>
      {/* Top navigation bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b flex items-center justify-between px-4 z-50">
        {canGoBack ? (
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-10"></div>
        )}
        
        <h1 className="text-lg font-semibold">EquipTrack</h1>
        
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] sm:w-[300px]">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">EquipTrack</h2>
                <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => {
                    navigate('/admin');
                    setMenuOpen(false);
                  }}
                >
                  <Home className="mr-2 h-5 w-5" />
                  Home
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => {
                    navigate('/admin/personnel');
                    setMenuOpen(false);
                  }}
                >
                  <User className="mr-2 h-5 w-5" />
                  Personnel
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => {
                    navigate('/admin/settings');
                    setMenuOpen(false);
                  }}
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Settings
                </Button>
              </div>
              
              <div className="mt-auto">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Content padding to account for top bar */}
      <div className="pt-14"></div>
    </>
  );
} 