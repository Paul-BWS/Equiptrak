import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, MapPin, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import databaseService from "@/services/database";

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
      try {
        return await databaseService.getAllCompanies();
      } catch (error) {
        console.error("Error fetching companies:", error);
        throw error;
      }
    },
  });

  const handleDelete = async () => {
    if (!deleteCustomerId) return;
    
    try {
      await databaseService.deleteCompany(deleteCustomerId);
      
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
      (customer.name && customer.name.toLowerCase().includes(searchLower)) ||
      (customer.address && customer.address.toLowerCase().includes(searchLower)) ||
      (customer.contact_name && customer.contact_name.toLowerCase().includes(searchLower)) ||
      (customer.contact_email && customer.contact_email.toLowerCase().includes(searchLower))
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
              <h3 className="text-lg font-medium mb-2">{customer.name}</h3>
              
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  {customer.address && (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {customer.address}
                      </p>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.address)}`, '_blank');
                        }}
                        style={iconButtonStyle}
                        className="h-7 w-7"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="sr-only">View on Map</span>
                      </Button>
                    </div>
                  )}
                  
                  {customer.contact_phone && (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">{customer.contact_phone}</p>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${customer.contact_phone}`;
                        }}
                        style={iconButtonStyle}
                        className="h-7 w-7"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span className="sr-only">Call</span>
                      </Button>
                    </div>
                  )}
                  
                  {customer.contact_name && (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        Contact: {customer.contact_name}
                        {customer.contact_email && ` • ${customer.contact_email}`}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="hidden sm:flex items-center gap-2 ml-auto">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/admin/customer-simple?id=${customer.id}`;
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
                      e.stopPropagation();
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
                      e.stopPropagation();
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
              This will permanently delete this customer and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 