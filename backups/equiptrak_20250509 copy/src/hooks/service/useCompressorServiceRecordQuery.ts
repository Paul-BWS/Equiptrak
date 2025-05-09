import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CompressorServiceRecordQueryOptions {
  enabled?: boolean;
}

export function useCompressorServiceRecordQuery(equipmentId: string, options?: CompressorServiceRecordQueryOptions) {
  return useQuery({
    queryKey: ["compressorServiceRecord", equipmentId],
    queryFn: async () => {
      console.log("Fetching compressor service record for equipment:", equipmentId);
      const { data, error } = await supabase
        .from("compressor_records")
        .select(`
          *,
          engineers!inner (
            id,
            name
          ),
          equipment!inner (
            id,
            name,
            serial_number,
            equipment_types!inner (
              id,
              name
            )
          )
        `)
        .eq("equipment_id", equipmentId)
        .order("test_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching compressor service record:", error);
        throw error;
      }

      console.log("Fetched compressor service record:", data);
      return data;
    },
    enabled: options?.enabled !== false && !!equipmentId,
    retry: 1, // Only retry once to avoid excessive retries on 404s
  });
} 