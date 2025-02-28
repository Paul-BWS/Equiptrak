import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEngineerQuery() {
  return useQuery({
    queryKey: ["engineers"],
    queryFn: async () => {
      console.log("Fetching engineers");
      const { data, error } = await supabase
        .from("engineers")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching engineers:", error);
        throw error;
      }
      
      console.log("Fetched engineers:", data);
      return data;
    },
  });
}