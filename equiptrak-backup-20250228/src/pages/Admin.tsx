import { useState } from "react";
import { CustomerList } from "@/components/CustomerList";
import { CustomerDialogs } from "@/components/CustomerDialogs";

export default function Admin() {
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  return (
    <div className="container mx-auto py-6">
      <CustomerList />

      <CustomerDialogs.Add
        open={isAddCustomerOpen} 
        onOpenChange={setIsAddCustomerOpen} 
      />
    </div>
  );
}