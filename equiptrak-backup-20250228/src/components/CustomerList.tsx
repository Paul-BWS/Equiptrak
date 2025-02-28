import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2, ClipboardCheck, Eye, MapPin, Phone } from "lucide-react";
import { CustomerDialogs } from "./CustomerDialogs";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { CustomerDetailsModal } from "@/components/CustomerDetailsModal";
import { useTheme } from "@/components/theme-provider";

interface CustomerListProps {
  searchQuery?: string;
}

export function CustomerList({ searchQuery = "" }: CustomerListProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<any>(null);
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const { toast } = useToast();
  const { theme } = useTheme();

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

  const openGoogleMaps = (address: string) => {
    const formattedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${formattedAddress}`, '_blank');
  };

  const callPhoneNumber = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const filteredCustomers = customers?.filter(customer => {
    const searchLower = searchQuery.toLowerCase();
    return (
      customer.company_name.toLowerCase().includes(searchLower) ||
      (customer.address && customer.address.toLowerCase().includes(searchLower)) ||
      (customer.city && customer.city.toLowerCase().includes(searchLower)) ||
      (customer.county && customer.county.toLowerCase().includes(searchLower)) ||
      (customer.postcode && customer.postcode.toLowerCase().includes(searchLower)) ||
      (customer.telephone && customer.telephone.includes(searchQuery))
    );
  });

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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {filteredCustomers.map((customer) => {
          const fullAddress = [customer.address, customer.city, customer.county, customer.postcode]
            .filter(Boolean)
            .join(", ");
            
          return (
            <div 
              key={customer.id} 
              className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <h3 className="text-lg font-medium mb-3">{customer.company_name}</h3>
                
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex items-center gap-6 flex-grow">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {[customer.address, customer.city, customer.postcode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      {fullAddress && (
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => openGoogleMaps(fullAddress)}
                          style={iconButtonStyle}
                          className="h-7 w-7"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="sr-only">View on Map</span>
                        </Button>
                      )}
                    </div>
                    
                    {customer.telephone && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">{customer.telephone}</p>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => callPhoneNumber(customer.telephone)}
                          style={iconButtonStyle}
                          className="h-7 w-7"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span className="sr-only">Call</span>
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-auto">
                    <Link to={`/admin/customer/${customer.id}`}>
                      <Button 
                        variant="outline" 
                        size="icon"
                        style={iconButtonStyle}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        setEditCustomer(customer);
                        setIsAddOpen(true);
                      }}
                      style={iconButtonStyle}
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setDeleteCustomerId(customer.id)}
                      style={deleteButtonStyle}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editCustomer && (
        <CustomerDialogs.Edit
          open={isAddOpen}
          onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) setEditCustomer(null);
          }}
          customer={editCustomer}
        />
      )}
      
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