import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function LolerList() {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/admin/customer/${customerId}/equipment-types`);
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
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">LOLER Equipment List</h2>
          <p className="text-muted-foreground">
            View and manage LOLER lifting equipment
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <p>LOLER equipment list is under development.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 