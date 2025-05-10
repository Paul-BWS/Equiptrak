import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EquipmentDashboard } from "@/components/EquipmentDashboard";
import { AddRivetToolModal } from "@/components/rivet-tool/AddRivetToolModal";
import { ViewRivetToolModal } from "@/components/rivet-tool/ViewRivetToolModal";
import { useState } from "react";

export default function RivetToolList() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [selectedRivetToolId, setSelectedRivetToolId] = useState<string | null>(null);

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
        <AddRivetToolModal customerId={customerId || ''} />
      </div>
      <EquipmentDashboard
        title="Rivet Tool List"
        description="View and manage rivet tool equipment"
        customerId={customerId}
        equipmentTypeFilter="rivet_tool"
        onViewRivetTool={setSelectedRivetToolId}
      />
      {selectedRivetToolId && (
        <ViewRivetToolModal
          equipmentId={selectedRivetToolId}
          open={!!selectedRivetToolId}
          onOpenChange={(open) => !open && setSelectedRivetToolId(null)}
        />
      )}
    </div>
  );
}