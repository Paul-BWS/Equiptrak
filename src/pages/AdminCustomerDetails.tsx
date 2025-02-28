import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, User, Trash2, MessageSquare, MapPin, Wrench, Phone, Mail, ClipboardList, ClipboardCheck, Plus } from "lucide-react";
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

  // Fetch customer details
  const { data: customer, isLoading, refetch } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", customerId)
        .single();
        
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", customerId);
        
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
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/admin")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Loading customer details...</h1>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/admin")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Customer not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] min-h-screen -mt-6 -mx-4 px-4 pt-6">
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/admin")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-[24px] font-bold">{customer.company_name}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-2"
            >
              <ClipboardCheck className="h-4 w-4" />
              Edit Customer
            </Button>
            <Button 
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="details" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList className="bg-white border">
            <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="h-4 w-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="equipment" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ClipboardList className="h-4 w-4 mr-2" />
              All Equipment
            </TabsTrigger>
            <TabsTrigger value="location" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              Location
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="company-name" className="text-sm text-muted-foreground">Company Name</Label>
                    <div className="font-medium">{customer.company_name}</div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
                    <div className="font-medium">{customer.email || "N/A"}</div>
                  </div>
                  
                  <div>
                    <Label htmlFor="telephone" className="text-sm text-muted-foreground">Telephone</Label>
                    <div className="font-medium">{customer.telephone || "N/A"}</div>
                  </div>
                  
                  <div>
                    <Label htmlFor="contact-name" className="text-sm text-muted-foreground">Contact Name</Label>
                    <div className="font-medium">{customer.contact_name || "N/A"}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Address</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address" className="text-sm text-muted-foreground">Address</Label>
                    <div className="font-medium">{customer.address || "N/A"}</div>
                  </div>
                  
                  <div>
                    <Label htmlFor="city" className="text-sm text-muted-foreground">City</Label>
                    <div className="font-medium">{customer.city || "N/A"}</div>
                  </div>
                  
                  <div>
                    <Label htmlFor="county" className="text-sm text-muted-foreground">County</Label>
                    <div className="font-medium">{customer.county || "N/A"}</div>
                  </div>
                  
                  <div>
                    <Label htmlFor="postcode" className="text-sm text-muted-foreground">Postcode</Label>
                    <div className="font-medium">{customer.postcode || "N/A"}</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="equipment" className="mt-6">
            <div className="bg-[#f5f5f5] rounded-lg border overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <h2 className="text-xl font-semibold">Equipment</h2>
                  
                  <Button 
                    onClick={() => navigate(`/admin/customer/${customerId}/equipment-types`)}
                    className="w-full md:w-auto"
                  >
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Equipment Types
                  </Button>
                </div>
                
                {/* Equipment list will go here */}
                <div className="bg-white rounded-md p-6 text-center border">
                  <p className="text-muted-foreground">Equipment list will be displayed here</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="location" className="mt-6">
            <div className="bg-[#f5f5f5] rounded-lg border overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                
                <div className="bg-white rounded-md p-6 text-center border">
                  <p className="text-muted-foreground">
                    {[
                      customer.address,
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
            <div className="bg-[#f5f5f5] rounded-lg border overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Messages</h2>
                
                <div className="bg-white rounded-md p-6 text-center border">
                  <p className="text-muted-foreground">Message functionality coming soon</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <CustomerDialogs.Edit
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open);
            if (!open) refetch();
          }}
          customer={customer}
        />
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this customer and all associated records. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default AdminCustomerDetails; 