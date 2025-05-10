import { useIsMobile } from "@/hooks/use-mobile";
import { ServiceEquipmentCard } from "@/components/equipment/cards/ServiceEquipmentCard";
import { SpotWelderCard } from "@/components/equipment/cards/SpotWelderCard";
import { CompressorCard } from "@/components/equipment/cards/CompressorCard";
import { RivetToolCard } from "@/components/equipment/cards/RivetToolCard";
import { Calendar, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
  booking_status?: 'booked' | 'not_booked';
  booking_date?: string;
}

interface EquipmentCardFactoryProps {
  equipment: Equipment;
  showCustomer?: boolean;
  compact?: boolean;
  onCardClick?: () => void;
  onServiceClick?: (equipmentId: string) => void;
  onViewSpotWelder?: (spotWelderId: string) => void;
  onViewRivetTool?: (rivetToolId: string) => void;
  onViewCompressor?: (compressorId: string) => void;
  onBookClick?: (equipmentId: string) => void;
}

export function EquipmentCardFactory({ 
  equipment, 
  showCustomer,
  compact,
  onCardClick,
  onServiceClick,
  onViewSpotWelder,
  onViewRivetTool,
  onViewCompressor,
  onBookClick
}: EquipmentCardFactoryProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const equipmentType = equipment.equipment_types?.name?.toLowerCase() || '';

  // Use compact prop or fallback to isMobile hook
  const isCompact = compact !== undefined ? compact : isMobile;

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick();
      return;
    }
    
    if (equipmentType === 'spot_welder' && onViewSpotWelder) {
      onViewSpotWelder(equipment.id);
    } else if (equipmentType === 'rivet_tool' && onViewRivetTool) {
      onViewRivetTool(equipment.id);
    } else if (equipmentType === 'compressor' && onViewCompressor) {
      onViewCompressor(equipment.id);
    } else if (onServiceClick) {
      onServiceClick(equipment.id);
    }
  };

  const renderBookButton = () => {
    if (!isCompact && onBookClick && equipment.booking_status !== 'booked') {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-auto text-blue-500 border-blue-500 hover:bg-blue-50 hover:text-blue-600"
          onClick={(e) => {
            e.stopPropagation();
            onBookClick(equipment.id);
          }}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Book Retest
        </Button>
      );
    }
    return null;
  };

  const renderCompanyInfo = () => {
    if (showCustomer && equipment.companies?.company_name) {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium">Company:</span> {equipment.companies.company_name}
        </div>
      );
    }
    return null;
  };

  switch (equipmentType) {
    case 'spot_welder':
      return (
        <div onClick={isCompact ? handleCardClick : undefined}>
          <SpotWelderCard 
            equipment={equipment}
            showCustomer={showCustomer}
            onViewSpotWelder={onViewSpotWelder}
            isMobile={isCompact}
          />
          <div className="mt-2 flex justify-end">
            {renderBookButton()}
          </div>
        </div>
      );
    case 'rivet_tool':
      return (
        <div onClick={isCompact ? handleCardClick : undefined}>
          <RivetToolCard 
            equipment={equipment}
            showCustomer={showCustomer}
            onViewRivetTool={onViewRivetTool}
            isMobile={isCompact}
          />
          <div className="mt-2 flex justify-end">
            {renderBookButton()}
          </div>
        </div>
      );
    case 'compressor':
      return (
        <div onClick={isCompact ? handleCardClick : undefined}>
          <CompressorCard 
            equipment={equipment}
            showCustomer={showCustomer}
            onViewCompressor={onViewCompressor}
            isMobile={isCompact}
          />
          <div className="mt-2 flex justify-end">
            {renderBookButton()}
          </div>
        </div>
      );
    default:
      return (
        <div 
          className="cursor-pointer border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
          onClick={handleCardClick}
        >
          <ServiceEquipmentCard 
            equipment={equipment}
            showCustomer={showCustomer}
            isMobile={isCompact}
          />
          <div className="mt-2 flex justify-end">
            {renderBookButton()}
          </div>
        </div>
      );
  }
}