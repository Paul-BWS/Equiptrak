import { useState } from "react";
import { CustomerList } from "@/components/customers/CustomerList";
import { CustomerDialogs } from "@/components/CustomerDialogs";
import { Plus, Building, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function AdminPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="container mx-auto py-6 relative pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <div className="flex gap-2">
          <Link to="/postgres-data">
            <Button variant="outline" className="border-a6e15a text-black hover:bg-a6e15a/10">
              <Database className="mr-2 h-4 w-4" />
              View Database Data
            </Button>
          </Link>
          <Link to="/admin/companies">
            <Button className="bg-a6e15a text-black hover:bg-opacity-90">
              <Building className="mr-2 h-4 w-4" />
              Manage Companies
            </Button>
          </Link>
        </div>
      </div>
      
      <CustomerList searchQuery={searchQuery} />
      
      <CustomerDialogs.Create
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="h-14 px-8 rounded-full shadow-lg bg-[#6d53b5] hover:bg-[#7e65d8] text-white flex items-center gap-3 text-lg font-medium"
        >
          <Plus className="h-6 w-6" />
          Add Company
        </Button>
      </div>
    </div>
  );
}

export default AdminPage; 