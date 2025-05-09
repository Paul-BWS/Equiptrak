import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/database";

export function useCompany(companyId?: string) {
  const { data: company, isLoading } = useQuery<Profile>({
    queryKey: ["company", companyId],
    queryFn: async () => {
      if (!companyId) throw new Error("No company ID provided");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", companyId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  return { company, isLoading };
} 