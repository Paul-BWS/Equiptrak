import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { ServiceRecordsTable } from "@/components/service/components/ServiceRecordsTable";
import { AddServiceButton } from "@/components/service/AddServiceButton";
import { toast } from "sonner";

export function AdminService() {
  // Get the customerId from URL params
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("AdminService - customerId:", customerId);
  }, [customerId]);
  
  // Fetch customer data
  const { data: customer, error: customerError, isLoading: isCustomerLoading } = useQuery({
    queryKey: ["customer", customerId],
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
        console.error("Error fetching customer:", error);
        throw error;
      }
      
      return data;
    },
    retry: 1,
    enabled: !!customerId,
  });
  
  // Show loading state
  if (isCustomerLoading) {
    return <div className="container mx-auto py-6 text-center">Loading customer data...</div>;
  }
  
  // Show error state
  if (customerError) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Customer</h2>
          <p className="text-red-600 mb-4">
            {customerError instanceof Error ? customerError.message : "Failed to load customer data"}
          </p>
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
  
  // Render the service page
  return (
    <div className="container mx-auto py-6 space-y-6 relative pb-20">
      <div className="flex items-center gap-4">
        <Button 
          variant="primaryBlue"
          size="icon"
          onClick={() => navigate(`/admin/customer/${customerId}`)}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Service Records</h1>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border/50">
        {customerId ? (
          <ServiceRecordsTable customerId={customerId} />
        ) : (
          <div className="text-center py-4 text-red-600">
            Error: No customer ID provided
          </div>
        )}
      </div>
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <AddServiceButton 
          customerId={customerId || ""} 
          className="h-14 w-14 rounded-full shadow-lg p-0"
        >
          <Plus className="h-6 w-6" />
        </AddServiceButton>
      </div>
    </div>
  );
}

export default AdminService;