import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
      
      const response = await fetch(`http://localhost:3001/api/companies/${customerId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error("Error fetching customer:", error);
        throw new Error(error);
      }
      
      const data = await response.json();
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
        <div className="text-red-500">Error loading customer data. Please try again.</div>
      </div>
    );
  }
  
  // Show not found state
  if (!customer) {
    return (
      <div className="container mx-auto py-6">
        <div>Customer not found.</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">{customer.name}</h1>
        </div>
        <AddServiceButton customerId={customerId} />
      </div>
      
      <ServiceRecordsTable customerId={customerId} />
    </div>
  );
}

export default AdminService;