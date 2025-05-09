import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EquipmentDashboard } from "@/components/EquipmentDashboard";

export default function CustomerEquipmentDashboard() {
  const { customerId } = useParams();

  const { data: customerDetails } = useQuery({
    queryKey: ["customerDetails", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("company_name")
        .eq('id', customerId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
  });

  return (
    <EquipmentDashboard 
      title={`${customerDetails?.company_name || 'Customer'}'s Equipment`}
      description="View and manage equipment for this customer"
    />
  );
}