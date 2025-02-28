import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, Settings, LogOut, Wrench, MessageSquare, UserCircle, ClipboardList, Home, Plus, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "./theme-provider";
import { CustomerDialogs } from "./CustomerDialogs";
import { supabase } from "@/integrations/supabase/client";

export function Navigation() {
  const location = useLocation();
  const { session, signOut } = useAuth();
  const user = session?.user;
  const { theme } = useTheme();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user?.email === "paul@basicwelding.co.uk") {
        setIsAdmin(true);
        return;
      }
      
      if (session?.user?.email) {
        try {
          const { data } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', session.user.email)
            .single();
            
          setIsAdmin(!!data);
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      }
    };
    
    checkAdminStatus();
  }, [session]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  // Get user initials for avatar
  const userInitials = session?.user?.email
    ? session.user.email.substring(0, 2).toUpperCase()
    : "U";

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // If not logged in, don't show navigation
  if (!session) return null;

  // For regular users, show simple header with logout
  if (!isAdmin) {
    return (
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold text-primary">EquipTrack</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>
    );
  }

  // For admin users, show full navigation
  return (
    <>
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-8">
            <Link to="/admin" className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold text-primary">EquipTrack</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Users className="h-4 w-4" />
                <span>Companies</span>
              </Link>
              <Link to="/admin/equipment" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ClipboardList className="h-4 w-4" />
                <span>Equipment</span>
              </Link>
              <Link to="/admin/chat" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </Link>
              <Link to="/admin/personnel" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Users className="h-4 w-4" />
                <span>Personnel</span>
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Removed ThemeToggle component */}
            
            {/* Desktop Sign Out */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-medium">
                {session.user.email?.split('@')[0]}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
            
            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-3">
              <Link to="/admin/service" className="text-muted-foreground">
                <Wrench className="h-5 w-5" />
              </Link>
              <Link to="/admin/personnel" className="text-muted-foreground">
                <Users className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <CustomerDialogs.Add
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
      />
    </>
  );
}