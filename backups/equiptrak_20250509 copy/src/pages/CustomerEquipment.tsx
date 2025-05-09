import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomerEquipmentHeader } from "@/components/customers/CustomerEquipmentHeader";
import { CustomerEquipmentDashboard } from "@/components/customers/CustomerEquipmentDashboard";

export default function CustomerEquipment() {
  const { customerId } = useParams<{ customerId: string }>();

  // If no customerId is provided, show an error
  if (!customerId) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-xl font-semibold">No customer selected</h2>
        </div>
      </div>
    );
  }

  const { data: customerDetails, isLoading: customerLoading } = useQuery({
    queryKey: ["customerDetails", customerId],
    queryFn: async () => {
      console.log("Fetching customer details for:", customerId);
      const { data, error } = await supabase
        .from("profiles")
        .select("company_name")
        .eq('id', customerId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: Boolean(customerId),
  });

  if (customerLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <CustomerEquipmentHeader 
        companyName={customerDetails?.company_name} 
        customerId={customerId} 
      />
      <CustomerEquipmentDashboard 
        customerId={customerId}
        title={`${customerDetails?.company_name}'s Equipment`}
        description="View and manage equipment for this customer"
      />
    </div>
  );
}