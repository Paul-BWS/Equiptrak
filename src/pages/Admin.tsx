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
        <h1 className="text-2xl font-bold">Customer Management</h1>
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
      
      {/* Floating Add Customer button */}
      <Button 
        onClick={() => setIsAddCustomerOpen(true)}
        className="fixed bottom-8 right-8 rounded-full w-16 h-16 shadow-lg bg-[#7b96d4] hover:bg-[#6a85c3] flex items-center justify-center"
      >
        <Plus className="h-8 w-8" />
      </Button>
      
      <CustomerDialogs.Create
        open={isAddCustomerOpen}
        onOpenChange={setIsAddCustomerOpen}
      />
    </div>
  );
}

export default Admin;