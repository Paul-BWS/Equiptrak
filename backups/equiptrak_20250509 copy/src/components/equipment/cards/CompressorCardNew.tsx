import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { format } from "date-fns";

interface CompressorCardProps {
  equipment: any;
  onViewCompressor: (id: string) => void;
  isMobile: boolean;
}

export function CompressorCard({ equipment, onViewCompressor, isMobile }: CompressorCardProps) {
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

  return (
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
  );
} 