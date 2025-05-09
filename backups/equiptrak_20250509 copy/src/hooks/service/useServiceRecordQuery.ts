import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ServiceRecord } from "@/types/database";

interface ServiceRecordQueryOptions {
  enabled?: boolean;
}

export function useServiceRecordQuery(recordId: string, options?: ServiceRecordQueryOptions) {
  return useQuery({
    queryKey: ["serviceRecord", recordId],
    queryFn: async () => {
      console.log("Fetching service record:", recordId);
      const { data, error } = await supabase
        .from("service_records")
        .select('*')
        .eq("id", recordId)
        .single();

      if (error) {
        console.error("Error fetching service record:", error);
        throw error;
      }

      console.log("Fetched service record:", data);
      return data;
    },
    enabled: options?.enabled !== false && !!recordId,
    retry: 1, // Only retry once to avoid excessive retries on 404s
  });
}