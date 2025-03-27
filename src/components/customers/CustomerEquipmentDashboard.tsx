import { useState } from "react";
import { EquipmentList } from "../EquipmentList";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
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
      
      try {
        // Use the REST API instead of Supabase
        const response = await fetch(`/api/companies/${customerId}/equipment`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });

        if (!response.ok) {
          console.error("Error fetching equipment:", response.status);
          // Return empty array to avoid errors
          return [];
        }

        const equipmentData = await response.json();
        console.log("Fetched customer equipment:", equipmentData);
        
        // Process data to match expected format
        return equipmentData?.map(item => ({
          ...item,
          status: item.status as "valid" | "expired" | "upcoming",
          profiles: { 
            company_name: item.company_name || "Unknown Company"
          },
          equipment_types: { 
            name: item.equipment_type_name || "Unknown Type",
            description: null
          }
        })) || [];
      } catch (error) {
        console.error("Error fetching equipment:", error);
        return [];
      }
    },
    refetchOnWindowFocus: false
  });

  // Filter equipment by search term
  const filteredEquipment = equipment
    ? equipment.filter(item => {
        if (!searchTerm) return true;
        
        const name = item.name?.toLowerCase() || '';
        const serial = item.serial_number?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        
        return name.includes(search) || serial.includes(search);
      })
    : [];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        
        {renderButtons && (
          <div className="flex-shrink-0">
            {renderButtons()}
          </div>
        )}
      </div>
      
      <div className="mb-4 relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search equipment..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-700">Loading equipment...</span>
        </div>
      ) : filteredEquipment.length > 0 ? (
        <EquipmentList 
          equipment={filteredEquipment} 
          isLoading={isLoading}
          showCustomer={false}
          onServiceClick={onServiceClick}
          compact={isMobile}
        />
      ) : (
        <div className="text-center p-8 border border-dashed rounded-md">
          <p className="text-muted-foreground">No equipment found {searchTerm ? "matching your search" : "for this company"}</p>
        </div>
      )}
    </div>
  );
}