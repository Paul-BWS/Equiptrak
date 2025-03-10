import { EquipmentCardFactory } from "./EquipmentCardFactory";
import { useState } from "react";
import { BookEquipmentModal } from "./equipment/BookEquipmentModal";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { createUser } from '@/utils/userService';

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
  onBookClick?: (equipmentId: string) => void;
}

export function EquipmentList({ 
  equipment, 
  isLoading, 
  showCustomer, 
  onServiceClick,
  onViewSpotWelder,
  onViewRivetTool,
  onViewCompressor,
  onBookClick
}: EquipmentListProps) {
  const [bookingEquipmentId, setBookingEquipmentId] = useState<string | null>(null);
  const navigate = useNavigate();

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
    } else if (onServiceClick) {
      // For all other equipment types
      console.log("Opening service modal");
      onServiceClick(equipmentId);
    }
  };

  const handleBookClick = (equipmentId: string) => {
    setBookingEquipmentId(equipmentId);
  };

  const handleEquipmentNavigation = (equipment: Equipment) => {
    const typeName = equipment.equipment_types?.name || 'Unknown';
    
    switch (typeName.toLowerCase()) {
      case 'spot welder':
        navigate(`/admin/spot-welder/${equipment.id}`);
        break;
      case 'inverter':
      default:
        // For equipment types without dedicated pages yet
        toast.error(`Viewing ${typeName} details will be available soon`);
        break;
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
          onBookClick={handleBookClick}
        />
      ))}
      {bookingEquipmentId && (
        <BookEquipmentModal
          equipmentId={bookingEquipmentId}
          open={!!bookingEquipmentId}
          onOpenChange={(open) => !open && setBookingEquipmentId(null)}
        />
      )}
    </div>
  );
}