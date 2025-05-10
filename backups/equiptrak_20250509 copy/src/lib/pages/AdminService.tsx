import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceHeader } from "@/components/service/components/ServiceHeader";
import { ServiceRecordsTable } from "@/components/service/components/ServiceRecordsTable";
import { Loader2 } from "lucide-react";
import { AddServiceModal } from "@/components/service/modals/AddServiceModal";

export default function AdminService() {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();
  const queryClient = useQueryClient();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["serviceRecords", customerId],
    queryFn: async () => {
      console.log("Fetching service records for company ID:", customerId);
      
      if (!customerId) {
        console.log("No customer ID provided");
        return [];
      }
      
      const { data, error } = await supabase
        .from('service_records')
        .select('*')
        .eq('company_id', customerId)
        .order('test_date', { ascending: false });

      if (error) {
        console.error("Error fetching service records:", error);
        return [];
      }

      console.log("Fetched service records:", data);
      return data || [];
    },
    enabled: !!customerId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ServiceHeader 
        onBack={() => navigate(`/admin/customer/${customerId}/equipment/types`)} 
        customerId={customerId || ''} 
      />
      <ServiceRecordsTable
        records={records}
        isLoading={isLoading}
        customerId={customerId || ''}
      />
    </div>
  );
}