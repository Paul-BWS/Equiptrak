import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Wrench, MessageSquare } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function Header() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { session, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Successfully logged out");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out");
    }
  };

  const handleEquipmentClick = () => {
    toast.info("Navigating to Equipment List...");
    try {
      navigate('/admin/equipment');
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error(`Failed to navigate: ${error.message}`);
    }
  };

  const handleChatClick = () => {
    toast.info("Navigating to Chat Dashboard...");
    try {
      navigate('/admin/chat');
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error(`Failed to navigate: ${error.message}`);
    }
  };

  // Check if user is admin - this should match your user role check elsewhere
  const isAdmin = session?.user?.email === "paul@basicwelding.co.uk" || 
                 session?.user?.role === "admin";

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="hidden sm:flex sm:items-center sm:gap-2">
            <Wrench className="h-6 w-6 dark:text-[#a6e15a] text-[#4c6fbf]" />
            <h1 className="text-2xl font-bold dark:text-[#a6e15a] text-[#4c6fbf]">
              EquipTrack
            </h1>
          </div>

          {/* Navigation Buttons */}
          <div className="flex w-full sm:w-auto items-center justify-around sm:justify-end sm:gap-4">
            {session && (
              <>
                {/* Admin-only navigation buttons */}
                {isAdmin && (
                  <>
                    {/* Equipment List Button */}
                    <Button
                      variant="ghost"
                      className="flex-1 sm:flex-initial gap-2"
                      onClick={handleEquipmentClick}
                    >
                      <Wrench className="h-5 w-5" />
                      <span className="hidden sm:inline">Equipment</span>
                    </Button>

                    {/* Chat Dashboard Button */}
                    <Button
                      variant="ghost"
                      className="flex-1 sm:flex-initial gap-2"
                      onClick={handleChatClick}
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span className="hidden sm:inline">Chat</span>
                    </Button>
                  </>
                )}

                {/* Theme Toggle - Available to all users */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-1 sm:flex-initial"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                  {theme === "light" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>

                {/* Logout Button - Available to all users */}
                <Button 
                  variant="outline" 
                  className="flex-1 sm:flex-initial bg-muted dark:bg-muted hover:bg-accent dark:hover:bg-accent"
                  onClick={handleLogout}
                >
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">×</span>
                </Button>
              </>
            )}

            {/* Login Button - For non-authenticated users */}
            {!session && (
              <Button 
                className="flex-1 sm:flex-initial"
                onClick={() => navigate("/login")}
              >
                <span className="hidden sm:inline">Login</span>
                <span className="sm:hidden">→</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}