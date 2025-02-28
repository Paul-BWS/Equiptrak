import { EquipmentTypeNav } from "@/components/EquipmentTypeNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function EquipmentTypes() {
  const navigate = useNavigate();
  const { customerId } = useParams();

  return (
    <div className="container mx-auto p-6">
      <div className="bg-card rounded-lg border border-border/50 p-6 space-y-6">
        <Button
          variant="outline"
          onClick={() => navigate("/admin")}
          className="mb-4 gap-2 -ml-2 bg-muted hover:bg-muted/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div>
          <h2 className="text-3xl font-bold tracking-tight">Equipment Types</h2>
          <p className="text-muted-foreground mt-2">
            Select an equipment type to view or manage
          </p>
        </div>

        <EquipmentTypeNav customerId={customerId} />
      </div>
    </div>
  );
}