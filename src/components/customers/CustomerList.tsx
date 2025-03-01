import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, MapPin, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CustomerListProps {
  searchQuery?: string;
}

export function CustomerList({ searchQuery = "" }: CustomerListProps) {
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: customers, isLoading, refetch } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("company_name");
        
      if (error) throw error;
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

  const filteredCustomers = customers?.filter(customer => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      (customer.company_name && customer.company_name.toLowerCase().includes(searchLower)) ||
      (customer.address && customer.address.toLowerCase().includes(searchLower)) ||
      (customer.postcode && customer.postcode.toLowerCase().includes(searchLower))
    );
  });

  // Style for icon buttons
  const iconButtonStyle = {
    backgroundColor: 'white',
    color: '#7b96d4',
    border: '1px solid #e2e8f0'
  };

  const deleteButtonStyle = {
    backgroundColor: 'white',
    color: '#ef4444',
    border: '1px solid #e2e8f0'
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading customers...</div>;
  }

  if (!filteredCustomers?.length) {
    return (
      <div className="text-center py-8">
        {searchQuery ? "No customers match your search" : "No customers found"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search customers..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => {
            // Handle search query change
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredCustomers.map((customer) => (
          <div 
            key={customer.id} 
            className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/admin/customer/${customer.id}`)}
          >
            <div className="p-4">
              <h3 className="text-lg font-medium mb-3">
                {customer.company_name}
              </h3>
              
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  {/* Address with icon */}
                  {customer.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{customer.address}, {customer.postcode}</p>
                    </div>
                  )}
                  
                  {/* Phone with icon - REMOVED */}
                </div>
                
                {/* Only show buttons on desktop */}
                <div className="hidden sm:flex items-center gap-2 ml-auto">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the row click
                      navigate(`/admin/customer/${customer.id}`);
                    }}
                    style={iconButtonStyle}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the row click
                      navigate(`/admin/customer/${customer.id}/edit`);
                    }}
                    style={iconButtonStyle}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the row click
                      setDeleteCustomerId(customer.id);
                    }}
                    style={deleteButtonStyle}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
    </div>
  );
} 