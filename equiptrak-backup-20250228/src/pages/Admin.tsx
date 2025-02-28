import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomerList } from "@/components/CustomerList";
import { CustomerDialogs } from "@/components/CustomerDialogs";

export function Admin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  return (
    <div className="container mx-auto py-6 space-y-6" style={{ backgroundColor: "#f5f5f5" }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            View and manage your customers
          </p>
        </div>
        <Button 
          onClick={() => setIsAddCustomerOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search customers..."
          className="pl-10 bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <CustomerList searchQuery={searchQuery} />
      </div>
      
      <CustomerDialogs.Add
        open={isAddCustomerOpen}
        onOpenChange={setIsAddCustomerOpen}
      />
    </div>
  );
}

export default Admin;