import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useServiceRecord(equipmentId: string | null) {
  return useQuery({
    queryKey: ["serviceRecord", equipmentId],
    queryFn: async () => {
      if (!equipmentId) return null;

      const { data, error } = await supabase
        .from("service_records")
        .select(`
          *,
          equipment:equipment_id (
            id,
            name,
            serial_number,
            equipment_types (
              id,
              name
            )
          )
        `)
        .eq("equipment_id", equipmentId)
        .order("test_date", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!equipmentId,
  });
} 