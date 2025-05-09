import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useAdminCheck() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["adminCheck", user?.id],
    queryFn: async () => {
      console.log("Running admin check for user:", {
        userId: user?.id,
        email: user?.email
      });

      if (!user?.id) {
        console.log("No user ID available");
        return false;
      }

      // Check the dedicated roles table
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      console.log("Role check results:", {
        roleData,
        roleError,
        userEmail: user.email
      });

      if (roleError) {
        console.error("Role check error:", roleError);
        // Fallback to email check if role check fails
        const isAdminByEmail = user.email === 'paul@basicwelding.co.uk' || 
                              user.email === 'sales@basicwelding.co.uk';
        console.log("Falling back to email check:", { isAdminByEmail });
        return isAdminByEmail;
      }

      console.log("Role data received:", roleData);
      
      const isAdmin = roleData?.role === 'admin' || 
                     user.email === 'paul@basicwelding.co.uk' || 
                     user.email === 'sales@basicwelding.co.uk';
                     
      console.log("Admin check result:", { 
        isAdmin, 
        role: roleData?.role,
        email: user.email 
      });
      
      return isAdmin;
    },
    enabled: !!user?.id,
  });
} 