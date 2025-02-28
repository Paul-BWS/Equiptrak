import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEngineer(engineerId: string | null) {
  return useQuery({
    queryKey: ["engineer", engineerId],
    queryFn: async () => {
      if (!engineerId) return null;

      const { data, error } = await supabase
        .from("engineers")
        .select("*")
        .eq("id", engineerId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!engineerId,
  });
} 