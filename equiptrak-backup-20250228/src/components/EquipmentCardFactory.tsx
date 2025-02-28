import { useIsMobile } from "@/hooks/use-mobile";
import { ServiceEquipmentCard } from "@/components/equipment/cards/ServiceEquipmentCard";
import { SpotWelderCard } from "@/components/equipment/cards/SpotWelderCard";
import { CompressorCard } from "@/components/equipment/cards/CompressorCard";
import { RivetToolCard } from "@/components/equipment/cards/RivetToolCard";

interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  next_test_date: string;
  status: "valid" | "expired" | "upcoming";
  customer_id?: string;
  companies?: {
    company_name: string | null;
  } | null;
  equipment_types?: {
    name: string;
    description: string | null;
  } | null;
}

interface EquipmentCardFactoryProps {
  equipment: Equipment;
  showCustomer?: boolean;
  onServiceClick?: (equipmentId: string) => void;
  onViewSpotWelder?: (spotWelderId: string) => void;
  onViewRivetTool?: (rivetToolId: string) => void;
  onViewCompressor?: (compressorId: string) => void;
}

export function EquipmentCardFactory({ 
  equipment, 
  showCustomer, 
  onServiceClick,
  onViewSpotWelder,
  onViewRivetTool,
  onViewCompressor
}: EquipmentCardFactoryProps) {
  const isMobile = useIsMobile();
  const equipmentType = equipment.equipment_types?.name?.toLowerCase() || '';

  const handleCardClick = () => {
    if (equipmentType === 'spot_welder' && onViewSpotWelder) {
      onViewSpotWelder(equipment.id);
    } else if (equipmentType === 'rivet_tool' && onViewRivetTool) {
      onViewRivetTool(equipment.id);
    } else if (equipmentType === 'compressor' && onViewCompressor) {
      onViewCompressor(equipment.id);
    } else if (onServiceClick && equipmentType !== 'spot_welder' && equipmentType !== 'rivet_tool' && equipmentType !== 'compressor') {
      onServiceClick(equipment.id);
    }
  };

  switch (equipmentType) {
    case 'spot_welder':
      return (
        <div onClick={isMobile ? handleCardClick : undefined}>
          <SpotWelderCard 
            equipment={equipment}
            showCustomer={showCustomer}
            onViewSpotWelder={onViewSpotWelder}
            isMobile={isMobile}
          />
        </div>
      );
    case 'rivet_tool':
      return (
        <div onClick={isMobile ? handleCardClick : undefined}>
          <RivetToolCard 
            equipment={equipment}
            showCustomer={showCustomer}
            onViewRivetTool={onViewRivetTool}
            isMobile={isMobile}
          />
        </div>
      );
    case 'compressor':
      return (
        <div onClick={isMobile ? handleCardClick : undefined}>
          <CompressorCard 
            equipment={equipment}
            showCustomer={showCustomer}
            onViewCompressor={onViewCompressor}
            isMobile={isMobile}
          />
        </div>
      );
    default:
      return (
        <div onClick={isMobile ? handleCardClick : undefined}>
          <ServiceEquipmentCard 
            equipment={equipment}
            showCustomer={showCustomer}
            isMobile={isMobile}
          />
        </div>
      );
  }
}