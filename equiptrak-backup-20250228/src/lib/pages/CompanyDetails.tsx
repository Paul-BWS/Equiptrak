import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { AddCustomerForm } from "@/components/AddCustomerForm";
import { useToast } from "@/hooks/use-toast";
import { CompanyHeader } from "@/components/company/CompanyHeader";
import { CompanyTabs } from "@/components/company/CompanyTabs";
import { MapsProvider } from "@/contexts/MapsContext";
import { ViewServiceModal } from "@/components/service/modals/ViewServiceModal";

export default function CompanyDetails() {
  const { customerId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Clear queries when customerId changes
  useEffect(() => {
    queryClient.removeQueries({ queryKey: ["company"] });
    queryClient.removeQueries({ queryKey: ["company-equipment"] });
  }, [customerId, queryClient]);

  const { data: company, isLoading: isCompanyLoading, error: companyError } = useQuery({
    queryKey: ["company", customerId],
    queryFn: async () => {
      if (!customerId) throw new Error("Company ID is required");

      console.log("Fetching company details for:", customerId);

      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", customerId)
        .single();

      if (error) {
        console.error("Error fetching company details:", error);
        toast({
          variant: "destructive",
          title: "Error fetching company details",
          description: error.message,
        });
        throw error;
      }

      if (!data) {
        throw new Error("Company not found");
      }

      return data;
    },
    enabled: !!customerId,
  });

  const { data: equipment, isLoading: isEquipmentLoading } = useQuery({
    queryKey: ["company-equipment", customerId],
    queryFn: async () => {
      if (!customerId) throw new Error("Company ID is required");

      console.log("Fetching equipment for customer:", customerId);

      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("customer_id", customerId);

      if (error) {
        console.error("Error fetching equipment:", error);
        toast({
          variant: "destructive",
          title: "Error fetching equipment",
          description: error.message,
        });
        throw error;
      }

      console.log("Fetched equipment:", data);
      return data;
    },
    enabled: !!customerId,
  });

  // Show loading state when switching customers
  if (isCompanyLoading || !customerId) {
    return <div className="p-6">Loading company details...</div>;
  }

  if (companyError) {
    return (
      <div className="p-6 text-red-500">
        Error loading company details. Please try again.
      </div>
    );
  }

  if (!company) {
    return <div className="p-6">Company not found</div>;
  }

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    // Force refetch both queries
    queryClient.invalidateQueries({ queryKey: ["company", customerId] });
    queryClient.invalidateQueries({ queryKey: ["company-equipment", customerId] });
    toast({
      title: "Success",
      description: "Company details updated successfully",
    });
  };

  return (
    <div className="space-y-6">
      <CompanyHeader
        companyName={company.company_name || ""}
        onBack={() => navigate('/admin')}
        onEdit={() => setIsEditDialogOpen(true)}
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Company Details</DialogTitle>
          </DialogHeader>
          <AddCustomerForm 
            onSuccess={handleEditSuccess}
            initialData={company}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>

      <MapsProvider>
        <CompanyTabs
          company={company}
          equipment={equipment || []}
          isEquipmentLoading={isEquipmentLoading}
          customerId={customerId}
        />
      </MapsProvider>
    </div>
  );
}