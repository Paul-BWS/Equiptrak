import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RivetToolServiceQueryOptions {
  enabled?: boolean;
}

export function useRivetToolServiceQuery(equipmentId: string, options?: RivetToolServiceQueryOptions) {
  return useQuery({
    queryKey: ["rivet-tool-service", equipmentId],
    queryFn: async () => {
      console.log("Fetching rivet tool service record for equipment:", equipmentId);
      
      const { data, error } = await supabase
        .from("rivet_tool_service_records")
        .select(`
          *,
          engineers(name),
          equipment(
            profiles(
              company_name,
              email,
              address,
              city,
              postcode
            )
          )
        `)
        .eq("equipment_id", equipmentId)
        .order("test_date", { ascending: false })
        .maybeSingle();

      if (error) {
        console.error("Error fetching rivet tool service record:", error);
        throw error;
      }

      console.log("Fetched rivet tool service record:", data);
      return data;
    },
    enabled: options?.enabled !== false && !!equipmentId,
    retry: 1,
  });
}