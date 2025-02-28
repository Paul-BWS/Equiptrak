import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SpotWelderServiceQueryOptions {
  enabled?: boolean;
}

export function useSpotWelderServiceQuery(equipmentId: string, options?: SpotWelderServiceQueryOptions) {
  return useQuery({
    queryKey: ["spot-welder-service", equipmentId],
    queryFn: async () => {
      console.log("Fetching service record for equipment:", equipmentId);
      
      const { data, error } = await supabase
        .from("spot_welder_service_records")
        .select(`
          *,
          engineers(name)
        `)
        .eq("equipment_id", equipmentId)
        .order("test_date", { ascending: false })
        .maybeSingle();

      if (error) {
        console.error("Error fetching spot welder service record:", error);
        throw error;
      }

      console.log("Fetched service record:", data);
      return data;
    },
    enabled: options?.enabled !== false && !!equipmentId,
    retry: 1, // Only retry once to avoid excessive retries on 404s
  });
}