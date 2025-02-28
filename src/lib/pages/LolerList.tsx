import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddLolerModal } from "@/components/loler/AddLolerModal";
import { LolerCard } from "@/components/equipment/cards/LolerCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { ViewLolerModal } from "@/components/loler/ViewLolerModal";
import { useState } from "react";
import { getStatus } from "@/utils/serviceStatus";

export default function LolerList() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedLolerId, setSelectedLolerId] = useState<string | null>(null);

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["loler", customerId],
    queryFn: async () => {
      console.log("Fetching LOLER equipment for customer:", customerId);
      
      // Get LOLER equipment for this customer
      const { data: equipmentData, error: equipmentError } = await supabase
        .from("equipment")
        .select(`
          id,
          name,
          serial_number,
          customer_id,
          type_id,
          last_test_date,
          next_test_date,
          status,
          equipment_types!inner (
            name
          )
        `)
        .eq("customer_id", customerId)
        .eq("equipment_types.name", "loler")
        .order("next_test_date", { ascending: false });

      if (equipmentError) {
        console.error("Equipment query error:", equipmentError);
        throw equipmentError;
      }

      console.log("Fetched equipment:", equipmentData);

      // Get latest service records
      const equipmentWithService = await Promise.all(
        equipmentData?.map(async (item) => {
          const { data: serviceRecord, error: serviceError } = await supabase
            .from("loler_service_records")
            .select("retest_date")
            .eq("equipment_id", item.id)
            .order("inspection_date", { ascending: false })
            .limit(1)
            .single();

          return {
            ...item,
            next_test_date: serviceRecord?.retest_date || item.next_test_date,
            status: getStatus(serviceRecord?.retest_date || item.next_test_date)
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
    <div className="container mx-auto p-6">
      <div className="bg-card rounded-lg border border-border/50 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <AddLolerModal customerId={customerId || ''} />
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">LOLER LIST</h2>
            <p className="text-muted-foreground">
              View and manage LOLER inspection equipment
            </p>
          </div>

          {isLoading ? (
            <div>Loading equipment...</div>
          ) : !equipment?.length ? (
            <div>No LOLER equipment found.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {equipment.map((item) => (
                <LolerCard
                  key={item.id}
                  equipment={item}
                  onViewLoler={setSelectedLolerId}
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedLolerId && (
        <ViewLolerModal
          equipmentId={selectedLolerId}
          open={!!selectedLolerId}
          onOpenChange={(open) => !open && setSelectedLolerId(null)}
        />
      )}
    </div>
  );
} 