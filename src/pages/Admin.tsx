import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomerList } from "@/components/customers/CustomerList";
import { CustomerDialogs } from "@/components/CustomerDialogs";

export function Admin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  return (
    <div className="container mx-auto py-6 space-y-6 relative" style={{ backgroundColor: "#f5f5f5" }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Companies</h1>
        <Button 
          onClick={() => setIsAddCustomerOpen(true)}
          className="bg-[#15803d] hover:bg-opacity-90 text-white rounded-lg flex items-center gap-2 px-4 py-2"
        >
          <Plus className="h-5 w-5" />
          Add Company
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search customers..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <CustomerList searchQuery={searchQuery} />
      </div>
      
      <CustomerDialogs.Create
        open={isAddCustomerOpen}
        onOpenChange={setIsAddCustomerOpen}
      />
    </div>
  );
}

export default Admin;