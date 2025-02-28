import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EquipmentDashboard } from "@/components/EquipmentDashboard";
import { AddSpotWelderModal } from "@/components/spot-welder/AddSpotWelderModal";
import { ViewSpotWelderModal } from "@/components/spot-welder/ViewSpotWelderModal";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SpotWelderCard } from "@/components/equipment/cards/SpotWelderCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { getStatus } from "@/utils/serviceStatus";

export default function SpotWelderList() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [selectedSpotWelderId, setSelectedSpotWelderId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["spot-welders", customerId],
    queryFn: async () => {
      // First get all spot welder equipment
      const { data: equipmentData, error: equipmentError } = await supabase
        .from("equipment")
        .select(`
          *,
          profiles:customer_id (
            company_name
          ),
          equipment_types!inner (
            name,
            description
          )
        `)
        .eq("customer_id", customerId)
        .eq("equipment_types.name", "spot_welder")
        .order("next_test_date", { ascending: false });

      if (equipmentError) throw equipmentError;

      // For each piece of equipment, get its latest service record
      const equipmentWithService = await Promise.all(
        equipmentData?.map(async (item) => {
          const { data: serviceRecord, error: serviceError } = await supabase
            .from("spot_welder_service_records")
            .select("retest_date")
            .eq("equipment_id", item.id)
            .order("test_date", { ascending: false })
            .limit(1)
            .single();

          if (serviceError && serviceError.code !== 'PGRST116') {
            console.error("Error fetching service record:", serviceError);
          }

          // Use the latest retest date from service record if available
          const effectiveTestDate = serviceRecord?.retest_date || item.next_test_date;
          
          return {
            ...item,
            next_test_date: effectiveTestDate,
            status: getStatus(effectiveTestDate)
          };
        }) || []
      );

      return equipmentWithService;
    },
  });

  const handleBack = () => {
    navigate(`/admin/customer/${customerId}/equipment/types`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <AddSpotWelderModal customerId={customerId || ''} />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Spot Welder List</h2>
          <p className="text-muted-foreground">
            View and manage spot welder equipment
          </p>
        </div>

        {isLoading ? (
          <div>Loading equipment...</div>
        ) : !equipment?.length ? (
          <div>No spot welders found.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {equipment.map((item) => (
              <SpotWelderCard
                key={item.id}
                equipment={item}
                onViewSpotWelder={setSelectedSpotWelderId}
                isMobile={isMobile}
              />
            ))}
          </div>
        )}
      </div>

      {selectedSpotWelderId && (
        <ViewSpotWelderModal
          equipmentId={selectedSpotWelderId}
          open={!!selectedSpotWelderId}
          onOpenChange={(open) => !open && setSelectedSpotWelderId(null)}
        />
      )}
    </div>
  );
}