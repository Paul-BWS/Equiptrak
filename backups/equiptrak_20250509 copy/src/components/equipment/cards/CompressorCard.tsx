import { format } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Printer, Trash2 } from "lucide-react";
import { CompressorRecord } from "@/types/database/compressors";
import { getStatus, getStatusColor } from "@/utils/serviceStatus";
import { useTheme } from "@/components/theme-provider";
import { EquipmentInfo } from "../card/components/EquipmentInfo";
import { useState } from "react";
import { EditCompressorModal } from "../modals/EditCompressorModal";

interface CompressorCardProps {
  equipment: any;
  onViewCompressor: (id: string) => void;
  isMobile: boolean;
}

export function CompressorCard({ equipment, onViewCompressor, isMobile }: CompressorCardProps) {
  const { theme } = useTheme();
  const status = getStatus(equipment.next_test_date);
  const statusColor = getStatusColor(equipment.next_test_date);
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "Due Soon":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Valid":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isMobile) {
    return (
      <>
        <Card className="mb-4 bg-card">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-medium">Model</div>
                <div>{equipment.model || "N/A"}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="font-medium">Serial</div>
                <div>{equipment.equipment_serial || "N/A"}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="font-medium">Retest Date</div>
                <div>{format(new Date(equipment.next_test_date), "dd/MM/yyyy")}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="font-medium">Status</div>
                <Badge className={`${statusColor} text-white`}>
                  {statusText}
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 pt-4">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="outline"
              size="default"
              className="h-12 w-12 rounded-lg"
              style={{ 
                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                border: theme === 'light' ? '1px solid #e2e8f0' : 'none'
              }}
            >
              <Eye className="h-6 w-6" />
            </Button>
          </CardFooter>
        </Card>

        <EditCompressorModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          record={equipment}
        />
      </>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{equipment.equipment_name || "Unnamed Compressor"}</h3>
                <Badge className={getStatusColor(equipment.status)}>{equipment.status || "Unknown"}</Badge>
              </div>
              <p className="text-sm text-gray-500">
                Serial: {equipment.equipment_serial || "N/A"}
              </p>
              {equipment.manufacturer && (
                <p className="text-sm text-gray-500">
                  Manufacturer: {equipment.manufacturer}
                </p>
              )}
              {equipment.model && (
                <p className="text-sm text-gray-500">
                  Model: {equipment.model}
                </p>
              )}
              {equipment.location && (
                <p className="text-sm text-gray-500">
                  Location: {equipment.location}
                </p>
              )}
              <p className="text-sm text-gray-500">
                Next Test Date:{" "}
                {equipment.next_test_date
                  ? format(new Date(equipment.next_test_date), "dd/MM/yyyy")
                  : "Not set"}
              </p>
            </div>

            <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-2`}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => onViewCompressor(equipment.id)}
              >
                <Eye className="h-4 w-4" />
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditCompressorModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        record={equipment}
      />
    </>
  );
}