import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditServicePage() {
  const { recordId } = useParams();
  const navigate = useNavigate();
  
  // Fetch service record data
  const { data: record, isLoading, error } = useQuery({
    queryKey: ["service-record", recordId],
    queryFn: async () => {
      console.log("Fetching service record with ID:", recordId);
      
      const { data, error } = await supabase
        .from("service_records")
        .select("*, companies(company_name)")
        .eq("id", recordId)
        .single();
        
      if (error) {
        console.error("Error fetching service record:", error);
        throw error;
      }
      
      console.log("Service record data:", data);
      return data;
    },
  });
  
  if (isLoading) {
    return <div className="container mx-auto py-6">Loading service record...</div>;
  }
  
  if (error) {
    console.error("Query error:", error);
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h2 className="text-red-800 font-semibold">Error Loading Service Record</h2>
          <p className="text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }
  
  if (!record) {
    return (
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
          <h1 className="text-2xl font-bold">Service record not found</h1>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="primaryBlue"
          size="icon"
          onClick={() => navigate(`/admin/service/${record.company_id}`)}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Edit Service Record</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          {record.companies?.company_name || "Unknown Customer"}
        </h2>
        
        {/* Add your edit form here */}
        <p>Edit form coming soon...</p>
      </div>
    </div>
  );
} 