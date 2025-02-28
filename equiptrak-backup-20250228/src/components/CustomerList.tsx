import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, User, Trash2 } from "lucide-react";
import { CustomerDialogs } from "./CustomerDialogs";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { CustomerDetailsModal } from "@/components/CustomerDetailsModal";

export function CustomerList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<any>(null);
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: customers, isLoading, refetch } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("company_name");
        
      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }
      
      return data || [];
    },
  });

  const handleDelete = async () => {
    if (!deleteCustomerId) return;
    
    try {
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", deleteCustomerId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer",
        variant: "destructive",
      });
    } finally {
      setDeleteCustomerId(null);
    }
  };

  const filteredCustomers = customers?.filter(customer => 
    customer.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.address && customer.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (customer.city && customer.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (customer.postcode && customer.postcode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>
      
      {/* Desktop Table Header */}
      <div className="hidden md:grid grid-cols-4 gap-4 py-2 px-4 font-medium text-muted-foreground">
        <div>Company Name</div>
        <div>Location</div>
        <div>Telephone</div>
        <div className="text-right">Actions</div>
      </div>
      
      {/* Customer List */}
      <div className="space-y-3 md:space-y-0">
        {isLoading ? (
          <div className="text-center py-4">Loading customers...</div>
        ) : filteredCustomers && filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <div 
              key={customer.id} 
              className="md:grid md:grid-cols-4 md:gap-4 md:py-3 md:px-4 md:border-b md:border-border md:hover:bg-muted/50 md:transition-colors"
            >
              {/* Mobile View */}
              <Link 
                to={`/admin/customer/${customer.id}`}
                className="md:hidden block bg-white rounded-lg border border-gray-200 overflow-hidden mb-3"
              >
                <div className="p-4 font-medium text-lg">
                  {customer.company_name}
                </div>
                
                <div className="px-4 pb-4 space-y-1 text-sm text-muted-foreground">
                  <div>
                    {[
                      customer.address,
                      customer.city,
                      customer.county,
                      customer.postcode
                    ].filter(Boolean).join(', ')}
                  </div>
                  <div>{customer.telephone || '-'}</div>
                </div>
              </Link>
              
              {/* Desktop View */}
              <div className="hidden md:block">{customer.company_name}</div>
              <div className="hidden md:block">
                {[
                  customer.city,
                  customer.county,
                  customer.postcode
                ].filter(Boolean).join(', ')}
              </div>
              <div className="hidden md:block">{customer.telephone || '-'}</div>
              <div className="hidden md:flex justify-end gap-2">
                <Link 
                  to={`/admin/customer/${customer.id}`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                >
                  <User className="h-4 w-4 mr-2" />
                  Details
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setEditCustomer(customer);
                    setIsAddOpen(true);
                  }}
                >
                  <User className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteCustomerId(customer.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">No customers found</div>
        )}
      </div>
      
      {/* Add/Edit Dialog */}
      {editCustomer ? (
        <CustomerDialogs.Edit
          open={isAddOpen}
          onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) setEditCustomer(null);
          }}
          customer={editCustomer}
        />
      ) : (
        <CustomerDialogs.Add
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
        />
      )}
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteCustomerId} onOpenChange={(open) => !open && setDeleteCustomerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this customer and all associated records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <CustomerDetailsModal
        customerId={selectedCustomerId}
        open={!!selectedCustomerId}
        onOpenChange={(open) => !open && setSelectedCustomerId(null)}
      />
    </div>
  );
}