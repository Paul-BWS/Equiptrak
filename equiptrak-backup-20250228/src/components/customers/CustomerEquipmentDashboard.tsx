import { useState } from "react";
import { EquipmentList } from "../EquipmentList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CustomerEquipmentDashboardProps {
  customerId: string;
  onServiceClick?: (equipmentId: string) => void;
  title?: string;
  description?: string;
  renderButtons?: () => React.ReactNode;
}

export function CustomerEquipmentDashboard({ 
  customerId,
  onServiceClick,
  title = "Equipment List",
  description = "View and manage your equipment",
  renderButtons,
}: CustomerEquipmentDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["customer-equipment", customerId],
    queryFn: async () => {
      console.log("Fetching equipment for customer:", customerId);
      
      const { data: equipmentData, error } = await supabase
        .from("equipment")
        .select(`
          *,
          companies (
            company_name
          )
        `)
        .eq('customer_id', customerId);

      if (error) {
        console.error("Error fetching equipment:", error);
        throw error;
      }

      console.log("Fetched customer equipment:", equipmentData);
      return equipmentData?.map(item => ({
        ...item,
        status: item.status as "valid" | "expired" | "upcoming",
        companies: item.companies && !('error' in item.companies) ? item.companies : null
      })) || [];
    },
    enabled: !!customerId,
  });

  const filteredEquipment = equipment?.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className={`${isMobile ? "w-full text-center mb-6 p-4 rounded-lg bg-muted" : ""}`}>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {!isMobile && (
          <p className="text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {renderButtons && (
        <div className="w-full">
          {renderButtons()}
        </div>
      )}
      {!isMobile && (
        <div className="bg-card rounded-lg p-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <EquipmentList 
            equipment={filteredEquipment || []} 
            isLoading={isLoading} 
            onServiceClick={onServiceClick}
          />
        </div>
      )}
    </div>
  );
}