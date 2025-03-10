import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wrench, Phone, Mail, MapPin, ClipboardList } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EquipmentList } from "@/components/equipment/EquipmentList";
import { ServiceRecordsTable } from "@/components/service/components/ServiceRecordsTable";
import { ContactsTable } from "@/components/contacts/ContactsTable";

export function CustomerSimple() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  
  // Get customerId from URL query parameter
  const searchParams = new URLSearchParams(window.location.search);
  const customerId = searchParams.get('id');
  
  // Fetch customer details
  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", customerId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
  });
  
  if (isLoading) {
    return <div className="container py-8 text-center">Loading customer details...</div>;
  }
  
  if (!customer) {
    return (
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" onClick={() => window.location.href = "/admin"}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        </div>
        <div className="text-center py-8">
          Customer not found. The ID may be invalid or the customer has been deleted.
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="sm" onClick={() => window.location.href = "/admin"} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <h1 className="text-2xl font-bold">{customer.company_name}</h1>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">
            Details
          </TabsTrigger>
          <TabsTrigger value="contacts">
            Contacts
          </TabsTrigger>
          <TabsTrigger value="equipment">
            <Wrench className="h-4 w-4 mr-2" />
            Equipment
          </TabsTrigger>
          <TabsTrigger value="service">
            <ClipboardList className="h-4 w-4 mr-2" />
            Service Records
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-0">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Company Information</h2>
                
                {customer.address && (
                  <div className="flex items-start mb-3">
                    <MapPin className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                    <div>
                      <p>{customer.address}</p>
                      {customer.city && <p>{customer.city}</p>}
                      {customer.county && <p>{customer.county}</p>}
                      {customer.postcode && <p>{customer.postcode}</p>}
                    </div>
                  </div>
                )}
                
                {customer.telephone && (
                  <div className="flex items-center mb-3">
                    <Phone className="h-5 w-5 mr-2 text-gray-500" />
                    <p>{customer.telephone}</p>
                  </div>
                )}
                
                {customer.email && (
                  <div className="flex items-center mb-3">
                    <Mail className="h-5 w-5 mr-2 text-gray-500" />
                    <p>{customer.email}</p>
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-4">Additional Details</h2>
                
                {customer.industry && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">Industry</p>
                    <p>{customer.industry}</p>
                  </div>
                )}
                
                {customer.company_status && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">Status</p>
                    <p>{customer.company_status}</p>
                  </div>
                )}
                
                {customer.credit_rating && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">Credit Rating</p>
                    <p>{customer.credit_rating}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="contacts" className="mt-0">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <ContactsTable companyId={customerId || ""} />
          </div>
        </TabsContent>
        
        <TabsContent value="equipment" className="mt-0">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <EquipmentList customerId={customerId || ""} />
          </div>
        </TabsContent>
        
        <TabsContent value="service" className="mt-0">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <ServiceRecordsTable customerId={customerId || ""} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 