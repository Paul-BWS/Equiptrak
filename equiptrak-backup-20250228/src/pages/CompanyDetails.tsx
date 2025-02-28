import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { AddCustomerForm } from "@/components/AddCustomerForm";
import { useToast } from "@/hooks/use-toast";
import { CompanyHeader } from "@/components/company/CompanyHeader";
import { CompanyTabs } from "@/components/company/CompanyTabs";

export default function CompanyDetails() {
  const { customerId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: company, isLoading: isCompanyLoading, error: companyError } = useQuery({
    queryKey: ["company", customerId],
    queryFn: async () => {
      if (!customerId) throw new Error("Company ID is required");

      try {
        // Use the companies table instead of profiles
        const { data, error } = await supabase
          .from("companies")  // Changed from profiles to companies
          .select("*")
          .eq("id", customerId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching company:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));
          
          // Return a default company object
          return {
            id: customerId,
            company_name: "Company Details Unavailable",
            email: "",
            phone: "",
            address: "",
            city: "",
            postal_code: "",
            country: "United Kingdom",
            created_at: new Date().toISOString()
          };
        }

        if (!data) {
          // If no data is found, return a default company object
          return {
            id: customerId,
            company_name: "Company Not Found",
            email: "",
            phone: "",
            address: "",
            city: "",
            postal_code: "",
            country: "United Kingdom",
            created_at: new Date().toISOString()
          };
        }

        return data;
      } catch (error) {
        console.error("Unexpected error fetching company:", error);
        // Return a default company object on error
        return {
          id: customerId,
          company_name: "Error Loading Company",
          email: "",
          phone: "",
          address: "",
          city: "",
          postal_code: "",
          country: "United Kingdom",
          created_at: new Date().toISOString()
        };
      }
    },
    enabled: !!customerId,
  });

  const { data: equipment, isLoading: isEquipmentLoading } = useQuery({
    queryKey: ["company-equipment", customerId],
    queryFn: async () => {
      if (!customerId) throw new Error("Company ID is required");

      console.log("Fetching equipment for customer:", customerId);

      try {
        const { data, error } = await supabase
          .from("equipment")
          .select("*")
          .eq("customer_id", customerId);  // Make sure this matches your foreign key column name

        if (error) {
          console.error("Error fetching equipment:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));
          toast({
            variant: "destructive",
            title: "Error fetching equipment",
            description: error.message,
          });
          return []; // Return empty array instead of throwing
        }

        console.log("Fetched equipment:", data);
        return data || [];
      } catch (error) {
        console.error("Unexpected error fetching equipment:", error);
        return []; // Return empty array on error
      }
    },
    enabled: !!customerId,
  });

  if (!customerId) {
    return <div className="p-6">Company ID is required</div>;
  }

  if (isCompanyLoading) {
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
    queryClient.invalidateQueries({ queryKey: ["company", customerId] });
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

      <CompanyTabs
        company={company}
        equipment={equipment || []}
        isEquipmentLoading={isEquipmentLoading}
        customerId={customerId}
      />
    </div>
  );
}