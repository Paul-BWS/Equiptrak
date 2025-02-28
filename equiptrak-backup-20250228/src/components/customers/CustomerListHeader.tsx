import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

interface CustomerListHeaderProps {
  onAddClick: () => void;
}

export function CustomerListHeader({ onAddClick }: CustomerListHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Users className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Customers</h3>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={onAddClick}
          className="dark:bg-[#a6e15a] dark:text-black bg-[#7b96d4] text-white hover:dark:bg-[#95cc51] hover:bg-[#6b86c4] gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>
    </div>
  );
}