import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SimpleAddServiceButton({ customerId }: { customerId: string }) {
  const navigate = useNavigate();
  
  return (
    <Button 
      onClick={() => {
        // Navigate to a new page to add a service record
        navigate(`/admin/service/${customerId}/add`);
      }}
      className="bg-[#7b96d4] hover:bg-[#6a85c3] text-white gap-2"
    >
      <Plus className="h-4 w-4" />
      Add Service
    </Button>
  );
} 