import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useThemeClass } from "@/hooks/useThemeClass";

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const user = useAuthRedirect();
  useThemeClass();

  if (!user) {
    return null; // Auth redirect will handle navigation
  }

  return (
    <div className="flex h-screen w-full max-w-[100vw] bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-col flex-1 bg-background">
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default Layout;