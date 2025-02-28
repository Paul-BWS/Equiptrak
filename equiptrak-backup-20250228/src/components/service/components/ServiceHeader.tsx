import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AddServiceModal } from "@/components/service/modals/AddServiceModal";

interface ServiceHeaderProps {
  onBack: () => void;
  customerId: string;
}

export function ServiceHeader({ onBack, customerId }: ServiceHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Service List</h1>
        <p className="text-muted-foreground">View and manage service records</p>
      </div>
      <AddServiceModal customerId={customerId} />
    </div>
  );
}