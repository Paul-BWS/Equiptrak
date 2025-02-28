import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { ServiceRecordsTable } from "@/components/service/components/ServiceRecordsTable";
import { AddServiceCertificateModal } from "@/components/service/components/AddServiceCertificateModal";
import { toast } from "sonner";

export function AdminService() {
  // Get the customerId from URL params
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  console.log("AdminService - customerId:", customerId);
  
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
          <h1 className="text-3xl font-bold">{customer?.company_name || "Customer"} Service Records</h1>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Certificate
        </Button>
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
      
      <AddServiceCertificateModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        customerId={customerId || ""}
      />
    </div>
  );
}

export default AdminService;