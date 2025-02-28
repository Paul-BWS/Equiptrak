import { useState } from "react";
import { CustomerList } from "@/components/CustomerList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CustomerDialogs } from "@/components/CustomerDialogs";

export default function Dashboard() {
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Customers</h2>
          <Button 
            onClick={() => setIsAddCustomerOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
        
        <CustomerList />
      </div>

      <CustomerDialogs.Add
        open={isAddCustomerOpen} 
        onOpenChange={setIsAddCustomerOpen} 
      />
    </div>
  );
}