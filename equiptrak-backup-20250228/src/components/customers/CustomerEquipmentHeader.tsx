import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CustomerEquipmentHeaderProps {
  companyName: string | null | undefined;
  customerId: string;
}

export function CustomerEquipmentHeader({ companyName, customerId }: CustomerEquipmentHeaderProps) {
  const navigate = useNavigate();

  const handleAddEquipment = () => {
    navigate(`/admin/equipment?customerId=${customerId}`);
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/admin')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {companyName}'s Equipment
          </h2>
          <p className="text-muted-foreground">
            View and manage equipment for this customer
          </p>
        </div>
        <Button onClick={handleAddEquipment}>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>
    </>
  );
}