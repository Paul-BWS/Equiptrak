import { EquipmentCardFactory } from "./EquipmentCardFactory";

interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  last_test_date: string;
  next_test_date: string;
  status: "valid" | "expired" | "upcoming";
  customer_id?: string;
  profiles?: {
    company_name: string | null;
  } | null;
  equipment_types?: {
    name: string;
    description: string | null;
  } | null;
}

interface EquipmentListProps {
  equipment: Equipment[];
  isLoading: boolean;
  showCustomer?: boolean;
  onServiceClick?: (equipmentId: string) => void;
  onViewSpotWelder?: (spotWelderId: string) => void;
  onViewRivetTool?: (rivetToolId: string) => void;
  onViewCompressor?: (compressorId: string) => void;
}

export function EquipmentList({ 
  equipment, 
  isLoading, 
  showCustomer, 
  onServiceClick,
  onViewSpotWelder,
  onViewRivetTool,
  onViewCompressor
}: EquipmentListProps) {
  if (isLoading) {
    return <div>Loading equipment...</div>;
  }

  if (!equipment?.length) {
    return <div>No equipment found.</div>;
  }

  const handleEquipmentClick = (equipmentId: string) => {
    console.log("Equipment click in EquipmentList for:", equipmentId);
    const clickedEquipment = equipment.find(item => item.id === equipmentId);
    if (!clickedEquipment) return;

    const equipmentType = clickedEquipment.equipment_types?.name?.toLowerCase();
    console.log("Equipment type:", equipmentType);
    
    if (equipmentType === 'spot_welder' && onViewSpotWelder) {
      console.log("Opening spot welder modal");
      onViewSpotWelder(equipmentId);
    } else if (equipmentType === 'rivet_tool' && onViewRivetTool) {
      console.log("Opening rivet tool modal");
      onViewRivetTool(equipmentId);
    } else if (equipmentType === 'compressor' && onViewCompressor) {
      console.log("Opening compressor modal");
      onViewCompressor(equipmentId);
    } else if (onServiceClick && equipmentType !== 'spot_welder' && equipmentType !== 'rivet_tool' && equipmentType !== 'compressor') {
      // Only use service modal for equipment that isn't a spot welder, rivet tool, or compressor
      console.log("Opening service modal");
      onServiceClick(equipmentId);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {equipment.map((item) => (
        <EquipmentCardFactory 
          key={item.id} 
          equipment={item}
          showCustomer={showCustomer}
          onServiceClick={handleEquipmentClick}
          onViewSpotWelder={onViewSpotWelder}
          onViewRivetTool={onViewRivetTool}
          onViewCompressor={onViewCompressor}
        />
      ))}
    </div>
  );
}