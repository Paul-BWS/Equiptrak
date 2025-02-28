import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, User, Trash2, MessageSquare, MapPin, Wrench, Phone, Mail, MapPinIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { CustomerDialogs } from "@/components/CustomerDialogs";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminCustomerDetails() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Check if the screen is mobile size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: customer, error, isLoading } = useQuery({
    queryKey: ["customer-details", customerId],
    queryFn: async () => {
      if (!customerId) {
        throw new Error("No customer ID provided");
      }
      
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", customerId)
        .single();
        
      if (error) {
        throw error;
      }
      
      return data;
    },
    retry: 1,
    enabled: !!customerId,
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
      
      navigate("/admin");
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

  if (isLoading) {
    return <div className="container mx-auto py-6 text-center">Loading customer details...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Customer Details</h2>
          <p className="text-red-600 mb-4">{error instanceof Error ? error.message : "Failed to load customer"}</p>
          <Button 
            onClick={() => navigate("/admin")} 
            variant="outline"
          >
            Return to Customers
          </Button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-yellow-700 mb-2">Customer Not Found</h2>
          <p className="text-yellow-600 mb-4">The requested customer could not be found.</p>
          <Button 
            onClick={() => navigate("/admin")} 
            variant="outline"
          >
            Return to Customers
          </Button>
        </div>
      </div>
    );
  }

  // Mobile view - similar to FileMaker app
  if (isMobile) {
    return (
      <div className="container mx-auto py-4 px-4">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/admin`)}
            className="px-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="px-2"
            >
              <User className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive px-2"
              onClick={() => setDeleteCustomerId(customer.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">COMPANY</Label>
            <div className="p-3 bg-white border rounded-md text-lg font-medium">
              {customer.company_name}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">FIRST NAME</Label>
              <div className="p-3 bg-white border rounded-md">
                {customer.contact_first_name || "Not provided"}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">LAST NAME</Label>
              <div className="p-3 bg-white border rounded-md">
                {customer.contact_last_name || "Not provided"}
              </div>
            </div>
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground">MOBILE PHONE</Label>
            <div className="p-3 bg-white border rounded-md flex justify-between items-center">
              <span>{customer.telephone || "Not provided"}</span>
              {customer.telephone && (
                <a href={`tel:${customer.telephone}`}>
                  <Phone className="h-5 w-5 text-blue-500" />
                </a>
              )}
            </div>
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground">OFFICE EMAIL</Label>
            <div className="p-3 bg-white border rounded-md flex justify-between items-center">
              <span>{customer.email || "Not provided"}</span>
              {customer.email && (
                <a href={`mailto:${customer.email}`}>
                  <Mail className="h-5 w-5 text-blue-500" />
                </a>
              )}
            </div>
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground">ADDRESS</Label>
            <div className="p-3 bg-white border rounded-md">
              {customer.address || "Not provided"}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">CITY</Label>
              <div className="p-3 bg-white border rounded-md">
                {customer.city || "Not provided"}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">COUNTY</Label>
              <div className="p-3 bg-white border rounded-md">
                {customer.county || "Not provided"}
              </div>
            </div>
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground">POSTCODE</Label>
            <div className="p-3 bg-white border rounded-md flex justify-between items-center">
              <span>{customer.postcode || "Not provided"}</span>
              {customer.postcode && (
                <a href={`https://maps.google.com/?q=${customer.postcode}`} target="_blank" rel="noopener noreferrer">
                  <MapPinIcon className="h-5 w-5 text-blue-500" />
                </a>
              )}
            </div>
          </div>
          
          <div className="pt-4">
            <div className="text-xl text-red-500 font-bold">0</div>
            <div className="text-gray-400">Work Orders</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => navigate(`/admin/service/${customer.id}`)}
            >
              LIST
            </Button>
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => navigate(`/admin/service/new/${customer.id}`)}
            >
              NEW
            </Button>
          </div>
        </div>
        
        <CustomerDialogs.Edit
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          customer={customer}
        />
        
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

  // Desktop view - tabs layout
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/admin`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{customer.company_name}</h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsEditOpen(true)}
          >
            <User className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteCustomerId(customer.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="details">
            <User className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="service">
            <Wrench className="h-4 w-4 mr-2" />
            Service
          </TabsTrigger>
          <TabsTrigger value="location">
            <MapPin className="h-4 w-4 mr-2" />
            Location
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-medium mb-2">Company Information</h2>
                  <div className="space-y-1 text-muted-foreground">
                    <p>{customer.company_name}</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-medium mb-2">Contact Information</h2>
                  <div className="space-y-1 text-muted-foreground">
                    <p>
                      {customer.contact_first_name && customer.contact_last_name ? 
                        `${customer.contact_first_name} ${customer.contact_last_name}` : 
                        "No contact name provided"}
                    </p>
                    <p>{customer.telephone || "No telephone provided"}</p>
                    <p>{customer.email || "No email provided"}</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-medium mb-2">Address</h2>
                  <div className="space-y-1 text-muted-foreground">
                    <p>{customer.address || "No address provided"}</p>
                    <p>
                      {[
                        customer.city,
                        customer.county,
                        customer.postcode
                      ].filter(Boolean).join(', ') || "No location provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-medium mb-2">Additional Information</h2>
                  <div className="space-y-1 text-muted-foreground">
                    <p><span className="font-medium">Created:</span> {new Date(customer.created_at).toLocaleDateString()}</p>
                    <p><span className="font-medium">Last Updated:</span> {new Date(customer.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-medium mb-2">Work Orders</h2>
                  <div className="text-xl text-red-500 font-bold">0</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="service" className="mt-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Service Records</h2>
                <Button 
                  onClick={() => navigate(`/admin/service/${customer.id}`)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View All Service Records
                </Button>
              </div>
              
              <p className="text-muted-foreground">
                View and manage service records for this customer.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="location" className="mt-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Map will be displayed here</p>
              </div>
              
              <div className="mt-4">
                <p className="font-medium">Address:</p>
                <p className="text-muted-foreground">{customer.address || "No address provided"}</p>
                <p className="text-muted-foreground">
                  {[
                    customer.city,
                    customer.county,
                    customer.postcode
                  ].filter(Boolean).join(', ') || "No location provided"}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="messages" className="mt-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Messages</h2>
              
              <div className="bg-muted rounded-md p-6 text-center">
                <p className="text-muted-foreground">Message functionality coming soon</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <CustomerDialogs.Edit
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        customer={customer}
      />
      
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

export default AdminCustomerDetails; 