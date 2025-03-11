import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { getStatus } from "@/utils/serviceStatus";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useState } from "react";
import { AddCompressorModal } from "@/components/compressor/AddCompressorModal";

export default function CompressorList() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const isMobile = useIsMobile();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
    navigate(`/admin/customer/${customerId}/equipment-types`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "Due Soon":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Valid":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
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
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{item.equipment_name || "Unnamed Compressor"}</h3>
                        <Badge className={getStatusColor(item.status)}>{item.status || "Unknown"}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Serial: {item.equipment_serial || "N/A"}
                      </p>
                      {item.manufacturer && (
                        <p className="text-sm text-gray-500">
                          Manufacturer: {item.manufacturer}
                        </p>
                      )}
                      {item.model && (
                        <p className="text-sm text-gray-500">
                          Model: {item.model}
                        </p>
                      )}
                      {item.location && (
                        <p className="text-sm text-gray-500">
                          Location: {item.location}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        Next Test Date:{" "}
                        {item.next_test_date
                          ? format(new Date(item.next_test_date), "dd/MM/yyyy")
                          : "Not set"}
                      </p>
                    </div>

                    <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-2`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <AddCompressorModal customerId={customerId || ''} />
      </div>
    </div>
  );
}