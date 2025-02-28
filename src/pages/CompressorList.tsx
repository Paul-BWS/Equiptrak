import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { getStatus } from "@/utils/serviceStatus";
import { ViewCompressorModal } from "@/components/compressor/view-modal/ViewCompressorModal";
import { CompressorCertificateModal } from "@/components/compressor/certificate/CompressorCertificateModal";
import { useServiceRecord } from "@/hooks/equipment/useServiceRecord";
import { useEngineer } from "@/hooks/useEngineer";
import { AddCompressorModal } from "@/components/compressor/AddCompressorModal";
import { CompressorCard } from "@/components/equipment/cards/CompressorCard";

export default function CompressorList() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const [selectedCompressorId, setSelectedCompressorId] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data: serviceRecord } = useServiceRecord(selectedCompressorId);
  const { data: engineer } = useEngineer(serviceRecord?.engineer_id);

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["compressors", customerId],
    queryFn: async () => {
      // First get all compressor equipment
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
        .eq("equipment_types.name", "compressor")
        .order("next_test_date", { ascending: false });

      if (equipmentError) throw equipmentError;

      // For each piece of equipment, get its latest service record
      const equipmentWithService = await Promise.all(
        equipmentData?.map(async (item) => {
          const { data: serviceRecord, error: serviceError } = await supabase
            .from("compressor_service_records")
            .select("*")
            .eq("equipment_id", item.id)
            .order("test_date", { ascending: false })
            .limit(1)
            .maybeSingle();

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
        <AddCompressorModal customerId={customerId || ''} />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Compressor List</h2>
          <p className="text-muted-foreground">
            View and manage compressor equipment
          </p>
        </div>

        {isLoading ? (
          <div>Loading equipment...</div>
        ) : !equipment?.length ? (
          <div>No compressors found.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {equipment.map((item) => (
              <CompressorCard
                key={item.id}
                equipment={item}
                onViewCompressor={setSelectedCompressorId}
                isMobile={isMobile}
              />
            ))}
          </div>
        )}
      </div>

      {selectedCompressorId && (
        <ViewCompressorModal
          equipmentId={selectedCompressorId}
          open={!!selectedCompressorId}
          onOpenChange={(open) => !open && setSelectedCompressorId(null)}
        />
      )}
    </div>
  );
}