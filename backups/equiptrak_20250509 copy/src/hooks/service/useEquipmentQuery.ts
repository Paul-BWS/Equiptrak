import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEquipmentQuery(equipmentId?: string) {
  return useQuery({
    queryKey: ["equipment", equipmentId],
    queryFn: async () => {
      if (!equipmentId) return null;
      
      console.log("Fetching equipment with ID:", equipmentId);
      const { data, error } = await supabase
        .from("equipment")
        .select(`
          *,
          equipment_types!inner(*),
          profiles!inner(*)
        `)
        .eq("id", equipmentId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching equipment:", error);
        throw error;
      }
      
      console.log("Fetched equipment with type and customer:", data);
      return data;
    },
    enabled: !!equipmentId,
  });
}