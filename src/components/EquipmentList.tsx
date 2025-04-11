import { useState } from "react";
import { BookEquipmentModal } from "./equipment/BookEquipmentModal";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Wrench, 
  CalendarPlus,
  Search
} from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

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
  company_name?: string;
  equipment_type_name?: string;
}

interface EquipmentListProps {
  equipment: Equipment[];
  isLoading: boolean;
  showCustomer?: boolean;
  compact?: boolean;
  onServiceClick?: (equipmentId: string) => void;
  onViewSpotWelder?: (spotWelderId: string) => void;
  onViewRivetTool?: (rivetToolId: string) => void;
  onViewCompressor?: (compressorId: string) => void;
  onBookClick?: (equipmentId: string) => void;
}

export function EquipmentList({ 
  equipment, 
  isLoading, 
  showCustomer = false, 
  compact = false,
  onServiceClick,
  onViewSpotWelder,
  onViewRivetTool,
  onViewCompressor,
  onBookClick
}: EquipmentListProps) {
  const [bookingEquipmentId, setBookingEquipmentId] = useState<string | null>(null);
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading equipment...</div>;
  }

  if (!equipment?.length) {
    return <div className="py-8 text-center text-gray-500">No equipment found.</div>;
  }

  const handleServiceClick = (equipmentId: string) => {
    if (onServiceClick) {
      onServiceClick(equipmentId);
    }
  };

  const handleBookClick = (equipmentId: string) => {
    if (onBookClick) {
      onBookClick(equipmentId);
    } else {
      setBookingEquipmentId(equipmentId);
    }
  };

  // Helper to render the status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Valid
          </div>
        );
      case "upcoming":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <AlertCircle className="mr-1 h-3 w-3" />
            Due Soon
          </div>
        );
      case "expired":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Expired
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment</TableHead>
              <TableHead>Serial Number</TableHead>
              {showCustomer && <TableHead>Company</TableHead>}
              <TableHead>Type</TableHead>
              <TableHead>Last Test</TableHead>
              <TableHead>Next Test</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.serial_number}</TableCell>
                {showCustomer && (
                  <TableCell>
                    {item.profiles?.company_name || item.company_name || "Unknown"}
                  </TableCell>
                )}
                <TableCell>
                  {item.equipment_types?.name || item.equipment_type_name || "Unknown"}
                </TableCell>
                <TableCell>
                  {item.last_test_date 
                    ? format(new Date(item.last_test_date), 'dd/MM/yyyy') 
                    : "Unknown"}
                </TableCell>
                <TableCell>
                  {item.next_test_date 
                    ? format(new Date(item.next_test_date), 'dd/MM/yyyy') 
                    : "Unknown"}
                </TableCell>
                <TableCell>{renderStatusBadge(item.status)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleServiceClick(item.id)}
                    className="h-8 px-2 py-0"
                  >
                    <Wrench className="h-3.5 w-3.5 mr-1" />
                    Service
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleBookClick(item.id)}
                    className="h-8 px-2 py-0"
                  >
                    <CalendarPlus className="h-3.5 w-3.5 mr-1" />
                    Book
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
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