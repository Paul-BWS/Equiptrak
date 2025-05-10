import { useState } from "react";
import { EquipmentList } from "./EquipmentList";
import { format } from "date-fns";
import { EquipmentSearch } from "./equipment/EquipmentSearch";
import { useEquipmentQuery } from "@/hooks/equipment/useEquipmentQuery";

interface EquipmentDashboardProps {
  onServiceClick?: (equipmentId: string) => void;
  onViewSpotWelder?: (spotWelderId: string) => void;
  onViewRivetTool?: (rivetToolId: string) => void;
  onViewCompressor?: (compressorId: string) => void;
  title?: string;
  description?: string;
  renderButtons?: () => React.ReactNode;
  customerId?: string;
  equipmentTypeFilter?: string;
}

export function EquipmentDashboard({ 
  onServiceClick,
  onViewSpotWelder,
  onViewRivetTool,
  onViewCompressor,
  title = "Equipment List",
  description = "View and manage your equipment",
  renderButtons,
  customerId,
  equipmentTypeFilter
}: EquipmentDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: equipment, isLoading } = useEquipmentQuery({ customerId, equipmentTypeFilter });

  const handleEquipmentClick = (equipmentId: string) => {
    console.log("Equipment click in dashboard for:", equipmentId);
    const clickedEquipment = equipment?.find(item => item.id === equipmentId);
    if (!clickedEquipment) return;

    const equipmentType = clickedEquipment.equipment_types?.name?.toLowerCase();
    console.log("Equipment type in dashboard:", equipmentType);
    
    if (equipmentType === 'spot_welder' && onViewSpotWelder) {
      console.log("Opening spot welder modal from dashboard");
      onViewSpotWelder(equipmentId);
    } else if (equipmentType === 'rivet_tool' && onViewRivetTool) {
      console.log("Opening rivet tool modal from dashboard");
      onViewRivetTool(equipmentId);
    } else if (equipmentType === 'compressor' && onViewCompressor) {
      console.log("Opening compressor modal from dashboard");
      onViewCompressor(equipmentId);
    } else if (onServiceClick && equipmentType !== 'spot_welder' && equipmentType !== 'rivet_tool' && equipmentType !== 'compressor') {
      console.log("Opening service modal from dashboard");
      onServiceClick(equipmentId);
    }
  };

  const filteredEquipment = equipment?.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const nextTestDate = item.next_test_date ? format(new Date(item.next_test_date), "dd/MM/yyyy") : '';
    
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.serial_number.toLowerCase().includes(searchLower) ||
      nextTestDate.includes(searchTerm)
    );
  }).sort((a, b) => {
    if (!a.next_test_date || !b.next_test_date) return 0;
    return new Date(b.next_test_date).getTime() - new Date(a.next_test_date).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
      {renderButtons && (
        <div className="w-full">
          {renderButtons()}
        </div>
      )}
      <div className="bg-card rounded-lg p-6 space-y-6">
        <EquipmentSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <EquipmentList 
          equipment={filteredEquipment || []} 
          isLoading={isLoading} 
          showCustomer={!customerId}
          onServiceClick={handleEquipmentClick}
          onViewSpotWelder={onViewSpotWelder}
          onViewRivetTool={onViewRivetTool}
          onViewCompressor={onViewCompressor}
        />
      </div>
    </div>
  );
}