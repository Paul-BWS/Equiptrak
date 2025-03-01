import { useState } from "react";
import { CustomerList } from "@/components/customers/CustomerList";
import { CustomerDialogs } from "@/components/CustomerDialogs";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="container mx-auto py-6 relative pb-20">
      <h1 className="text-3xl font-bold mb-6">Customers</h1>
      
      <CustomerList searchQuery={searchQuery} />
      
      <CustomerDialogs.Create
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg p-0 bg-[#7b96d4] hover:bg-[#6a85c3] text-white"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

export default AdminPage; 