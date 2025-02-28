import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AddSpotWelderModal } from "@/components/spot-welder/AddSpotWelderModal";
import { ViewSpotWelderModal } from "@/components/spot-welder/ViewSpotWelderModal";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SpotWelderCard } from "@/components/equipment/cards/SpotWelderCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { getStatus } from "@/utils/serviceStatus";
import { SpotWelderRecord, SpotWelderEquipment } from "@/types/database/spot-welders";

export default function SpotWelderList() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [selectedSpotWelderId, setSelectedSpotWelderId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const { data: spotWelders, isLoading } = useQuery({
    queryKey: ["spot-welders", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spot_welder_service_records")
        .select("*")
        .eq("company_id", customerId)
        .order("test_date", { ascending: false });

      if (error) throw error;

      // Group by equipment_serial and take the latest record for each
      const latestRecords = (data as SpotWelderRecord[]).reduce((acc, record) => {
        if (!acc[record.equipment_serial] || 
            new Date(record.test_date) > new Date(acc[record.equipment_serial].test_date)) {
          acc[record.equipment_serial] = record;
        }
        return acc;
      }, {} as Record<string, SpotWelderRecord>);

      return Object.values(latestRecords).map(record => ({
        id: record.id,
        name: record.equipment_name,
        serial_number: record.equipment_serial,
        next_test_date: record.retest_date,
        status: getStatus(record.retest_date),
        customer_id: record.company_id
      } as SpotWelderEquipment));
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
        ) : !spotWelders?.length ? (
          <div>No spot welders found.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {spotWelders.map((item) => (
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