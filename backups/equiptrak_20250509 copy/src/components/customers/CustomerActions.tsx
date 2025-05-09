import { Button } from "@/components/ui/button";
import { User2, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface CustomerActionsProps {
  onDelete: () => void;
  customerId: string;
}

export function CustomerActions({ onDelete, customerId }: CustomerActionsProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleCustomerClick = () => {
    navigate(`/admin/customer/${customerId}/details`);
  };

  if (isMobile) return null;

  return (
    <div className="flex space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCustomerClick}
        title="View Company Details"
      >
        <User2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="text-destructive hover:bg-destructive/10"
        title="Delete Customer"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}