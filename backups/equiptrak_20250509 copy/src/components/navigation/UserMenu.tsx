import { User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface UserMenuProps {
  onSignOut: () => void;
}

export const UserMenu = ({ onSignOut }: UserMenuProps) => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [userDetails, setUserDetails] = useState<{
    name: string;
    email: string;
    initials: string;
  }>({
    name: "",
    email: "",
    initials: "U",
  });

  useEffect(() => {
    if (session?.user) {
      const email = session.user.email || "";
      const name = email.split('@')[0];
      const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();

      setUserDetails({
        name,
        email,
        initials,
      });
    }
  }, [session]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-muted text-foreground text-lg font-semibold">
              {userDetails.initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userDetails.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userDetails.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};