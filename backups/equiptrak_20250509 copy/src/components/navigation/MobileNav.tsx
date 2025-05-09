import { Link } from "react-router-dom";
import { ClipboardList, Users, LogOut, MessageSquare } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

export const MobileNav = ({ isOpen, onClose, onSignOut }: MobileNavProps) => {
  const { session } = useAuth();
  const isAdmin = session?.user?.email === "paul@basicwelding.co.uk" || 
                 session?.user?.role === "admin";

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed top-16 right-0 left-0 bg-background border-b p-4 flex flex-col gap-4 z-50">
      {isAdmin && (
        <>
          <Link
            to="/admin"
            className="text-foreground hover:text-primary flex items-center gap-2 border rounded-lg p-2"
            onClick={onClose}
          >
            <Users size={20} />
            <span>Companies</span>
          </Link>
          <Link
            to="/admin/equipment"
            className="text-foreground hover:text-primary flex items-center gap-2 border rounded-lg p-2"
            onClick={onClose}
          >
            <ClipboardList size={20} />
            <span>Equipment</span>
          </Link>
          <Link
            to="/admin/chat"
            className="text-foreground hover:text-primary flex items-center gap-2 border rounded-lg p-2"
            onClick={onClose}
          >
            <MessageSquare size={20} />
            <span>Chat</span>
          </Link>
        </>
      )}
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={() => {
          onSignOut();
          onClose();
        }}
      >
        <LogOut size={20} />
        <span>Log out</span>
      </Button>
    </div>
  );
};