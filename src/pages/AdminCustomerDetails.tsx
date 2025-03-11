import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, User, Trash2, MessageSquare, MapPin, Wrench, Phone, Mail, ClipboardList, ClipboardCheck, Plus, Search, PencilRuler, Pencil, Trash, UserCircle, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import { CustomerDialogs } from "@/components/CustomerDialogs";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EquipmentList } from "@/components/equipment/EquipmentList";
import { ServiceRecordsTable } from "@/components/service/components/ServiceRecordsTable";
import { CustomerListHeader } from "@/components/customers/CustomerListHeader";
import { ViewSpotWelderModal } from "@/components/spot-welder/ViewSpotWelderModal";
import { ContactsTable } from "@/components/contacts/ContactsTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Notes } from "@/components/shared/Notes";

// Company status options
const COMPANY_STATUS_OPTIONS = [
  'OK', 
  'Cash-Card', 
  'Proforma', 
  'REQ ONO', 
  'Call Office', 
  'On Stop', 
  'In Court', 
  'Liquidation', 
  'LKQ', 
  'SIP', 
  'Dingbro', 
  'ABSL'
];

export function AdminCustomerDetails() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Check if we're coming from EquipmentTypes
  const fromEquipmentTypes = location.state?.fromEquipmentTypes;
  
  // Debug logging
  console.log('AdminCustomerDetails - customerId:', customerId, 'fromEquipmentTypes:', fromEquipmentTypes);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpotWelderId, setSelectedSpotWelderId] = useState<string | null>(null);
  const [selectedRivetToolId, setSelectedRivetToolId] = useState<string | null>(null);
  const [selectedCompressorId, setSelectedCompressorId] = useState<string | null>(null);
  const [selectedServiceEquipmentId, setSelectedServiceEquipmentId] = useState<string | null>(null);
  
  // State for inline editing
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Check if the screen is mobile size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setCurrentUserId(data.session.user.id);
      }
    };
    
    getCurrentUser();
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
    // If we're coming from EquipmentTypes, don't show loading state
    refetchOnMount: !fromEquipmentTypes,
    staleTime: fromEquipmentTypes ? 60000 : 0, // 1 minute if coming from EquipmentTypes
  });

  // Initialize edited customer when customer data is loaded
  useEffect(() => {
    if (customer) {
      setEditedCustomer({
        company_name: customer.company_name || "",
        email: customer.email || "",
        telephone: customer.telephone || "",
        industry: customer.industry || "",
        credit_rating: customer.credit_rating || "",
        company_status: customer.company_status || "OK",
        address: customer.address || "",
        city: customer.city || "",
        county: customer.county || "",
        postcode: customer.postcode || ""
      });
    }
  }, [customer]);

  const handleSaveContact = async () => {
    if (!editedCustomer) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("companies")
        .update({
          company_name: editedCustomer.company_name,
          email: editedCustomer.email,
          telephone: editedCustomer.telephone,
          industry: editedCustomer.industry,
          credit_rating: editedCustomer.credit_rating,
          company_status: editedCustomer.company_status
        })
        .eq("id", customerId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Contact information updated successfully",
      });
      
      refetch();
      setIsEditingContact(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update contact information",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!editedCustomer) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("companies")
        .update({
          address: editedCustomer.address,
          city: editedCustomer.city,
          county: editedCustomer.county,
          postcode: editedCustomer.postcode
        })
        .eq("id", customerId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Address updated successfully",
      });
      
      refetch();
      setIsEditingAddress(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update address",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  // Improved loading state
  if (isLoading && !fromEquipmentTypes) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen -mt-6 -mx-4 px-4 pt-6 pb-6">
        <div className="container mx-auto py-6">
          <div className="flex items-center mb-6">
            <Button 
              variant="primaryBlue" 
              size="icon"
              onClick={() => navigate("/admin")}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-[24px] font-bold">Loading customer details...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!customer && !isLoading) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen -mt-6 -mx-4 px-4 pt-6 pb-6">
        <div className="container mx-auto py-6">
          <div className="flex items-center mb-6">
            <Button 
              variant="primaryBlue" 
              size="icon"
              onClick={() => navigate("/admin")}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-[24px] font-bold">Customer not found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] min-h-screen -mt-6 -mx-4 px-4 pt-6 pb-20 md:pb-6 relative">
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <Button 
              variant="primaryBlue"
              size="icon"
              onClick={() => navigate("/admin")}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-[24px] font-bold">{customer.company_name}</h1>
          </div>
          
          {/* Desktop buttons - hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="primaryBlue"
              size="icon"
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="h-5 w-5" />
            </Button>
            <Button 
              variant="primaryBlue"
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash className="h-5 w-5" />
            </Button>
            <Button
              variant="primaryBlue"
              onClick={() => setActiveTab("notes")}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Notes
            </Button>
          </div>
        </div>
        
        <Tabs 
          defaultValue="details" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="service">Service</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Contact Information</h2>
                  {!isEditingContact ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditingContact(true)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsEditingContact(false)}
                        className="text-red-600"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSaveContact}
                        disabled={isSaving}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-name" className="text-sm text-muted-foreground">Company Name</Label>
                    {isEditingContact ? (
                      <Input
                        id="company-name"
                        name="company_name"
                        value={editedCustomer?.company_name || ""}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-medium">{customer.company_name}</div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
                    {isEditingContact ? (
                      <Input
                        id="email"
                        name="email"
                        value={editedCustomer?.email || ""}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-medium">{customer.email || "N/A"}</div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="telephone" className="text-sm text-muted-foreground">Telephone</Label>
                    {isEditingContact ? (
                      <Input
                        id="telephone"
                        name="telephone"
                        value={editedCustomer?.telephone || ""}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-medium">{customer.telephone || "N/A"}</div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="industry" className="text-sm text-muted-foreground">Industry</Label>
                    {isEditingContact ? (
                      <Input
                        id="industry"
                        name="industry"
                        value={editedCustomer?.industry || ""}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-medium">{customer.industry || "N/A"}</div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="credit-rating" className="text-sm text-muted-foreground">Credit Rating</Label>
                    {isEditingContact ? (
                      <Input
                        id="credit-rating"
                        name="credit_rating"
                        value={editedCustomer?.credit_rating || ""}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-medium">{customer.credit_rating || "N/A"}</div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="company-status" className="text-sm text-muted-foreground">Company Status</Label>
                    {isEditingContact ? (
                      <Select 
                        name="company_status"
                        value={editedCustomer?.company_status || "OK"}
                        onValueChange={(value) => {
                          setEditedCustomer(prev => ({
                            ...prev,
                            company_status: value
                          }));
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPANY_STATUS_OPTIONS.map(status => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="font-medium">{customer.company_status || "OK"}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Address</h2>
                  {!isEditingAddress ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditingAddress(true)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsEditingAddress(false)}
                        className="text-red-600"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSaveAddress}
                        disabled={isSaving}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address" className="text-sm text-muted-foreground">Address</Label>
                    {isEditingAddress ? (
                      <Input
                        id="address"
                        name="address"
                        value={editedCustomer?.address || ""}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-medium">{customer.address || "N/A"}</div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="city" className="text-sm text-muted-foreground">City</Label>
                    {isEditingAddress ? (
                      <Input
                        id="city"
                        name="city"
                        value={editedCustomer?.city || ""}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-medium">{customer.city || "N/A"}</div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="county" className="text-sm text-muted-foreground">County</Label>
                    {isEditingAddress ? (
                      <Input
                        id="county"
                        name="county"
                        value={editedCustomer?.county || ""}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-medium">{customer.county || "N/A"}</div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="postcode" className="text-sm text-muted-foreground">Postcode</Label>
                    {isEditingAddress ? (
                      <Input
                        id="postcode"
                        name="postcode"
                        value={editedCustomer?.postcode || ""}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-medium">{customer.postcode || "N/A"}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notes Section */}
            <div className="mt-6">
              <div className="bg-white rounded-lg border p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Customer Notes</h2>
                </div>
                <Notes 
                  companyId={customerId || ''} 
                  isAdmin={true}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="contacts" className="mt-6 relative">
            <div className="bg-white rounded-lg border p-6">
              <ContactsTable companyId={customerId || ""} />
            </div>
            
            <Button
              onClick={() => document.getElementById('add-contact-button')?.click()}
              className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-[#7b96d4] hover:bg-[#6a82bc]"
              size="icon"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </TabsContent>
          
          <TabsContent value="equipment" className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <EquipmentList customerId={customerId || ""} hideAddButton={true} />
            </div>
          </TabsContent>
          
          <TabsContent value="service" className="mt-6">
            <div className="bg-[#f5f5f5] rounded-lg border overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Service</h2>
                
                <div className="bg-white rounded-md p-6 text-center border">
                  <p className="text-muted-foreground">Service functionality coming soon</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Customer Notes</h2>
              </div>
              <Notes 
                companyId={customerId || ''} 
                isAdmin={true}
              />
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

        {/* Mobile buttons - fixed at bottom, hidden on desktop */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex items-center justify-around z-10">
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => setIsEditOpen(true)}
            className="h-12 w-12 rounded-full bg-[#f5f5f5]"
          >
            <Pencil className="h-5 w-5 text-[#7b96d4]" />
          </Button>
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="h-12 w-12 rounded-full bg-[#f5f5f5]"
          >
            <Trash className="h-5 w-5 text-[#7b96d4]" />
          </Button>
        </div>

        {/* Floating Action Button for Equipment - only visible in Equipment tab */}
        {activeTab === "equipment" && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button 
              onClick={() => window.location.href = `/admin/customer/${customerId}/equipment-types`}
              className="h-14 w-14 rounded-full shadow-lg p-0 bg-[#7b96d4] hover:bg-[#6a85c3] text-white"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        )}

        {/* Modals */}
        {selectedSpotWelderId && (
          <ViewSpotWelderModal
            equipmentId={selectedSpotWelderId}
            open={!!selectedSpotWelderId}
            onOpenChange={(open) => !open && setSelectedSpotWelderId(null)}
          />
        )}
      </div>
    </div>
  );
}

export default AdminCustomerDetails; 