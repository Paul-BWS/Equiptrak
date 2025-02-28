import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EquipmentList } from "@/components/EquipmentList";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function AdminEquipment() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();

  const { data: customer } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", customerId)
        .single();
      return data;
    },
    enabled: !!customerId,
  });

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["equipment", customerId],
    queryFn: async () => {
      const { data } = await supabase
        .from("equipment")
        .select(`
          *,
          profiles:customer_id(*),
          equipment_types:type_id(*)
        `)
        .eq("customer_id", customerId);
      return data || [];
    },
    enabled: !!customerId,
  });

  const handleServiceClick = (equipmentId: string) => {
    // Handle service click
    console.log("Service clicked for equipment:", equipmentId);
  };

  const handleViewSpotWelder = (spotWelderId: string) => {
    navigate(`/admin/customer/${customerId}/equipment/spotwelder/${spotWelderId}/certificate`);
  };

  const handleViewRivetTool = (rivetToolId: string) => {
    navigate(`/admin/customer/${customerId}/equipment/rivet-tool/${rivetToolId}/certificate`);
  };

  const handleViewCompressor = (compressorId: string) => {
    navigate(`/admin/customer/${customerId}/equipment/compressor/${compressorId}/certificate`);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/admin`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{customer?.company_name || "Customer"} Equipment</h1>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border/50">
        <EquipmentList 
          equipment={equipment || []} 
          isLoading={isLoading}
          onServiceClick={handleServiceClick}
          onViewSpotWelder={handleViewSpotWelder}
          onViewRivetTool={handleViewRivetTool}
          onViewCompressor={handleViewCompressor}
        />
      </div>
    </div>
  );
} 