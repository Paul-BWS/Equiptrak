import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLocation } from "react-router-dom";

interface CustomerListHeaderProps {
  title: string;
  onAddClick?: () => void;
  addButtonText?: string;
  showAddButton?: boolean;
}

export function CustomerListHeader({
  title,
  onAddClick,
  addButtonText = "Add",
  showAddButton = true,
}: CustomerListHeaderProps) {
  const location = useLocation();
  
  // Check if we're on the equipment tab
  const isEquipmentTab = location.pathname.includes("/customer/") && 
                         (location.hash === "#equipment" || 
                          location.pathname.includes("equipment"));
  
  // Don't render anything on equipment tab
  if (isEquipmentTab) {
    return null;
  }
  
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {showAddButton && (
        <Button onClick={onAddClick} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {addButtonText}
        </Button>
      )}
    </div>
  );
}