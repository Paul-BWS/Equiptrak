import { format } from "date-fns";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { getStatus, getStatusColor } from "@/utils/serviceStatus";
import { useTheme } from "@/components/theme-provider";

interface SpotWelderMobileCardProps {
  equipment: {
    id: string;
    name: string;
    serial_number: string;
    next_test_date: string;
    status: "valid" | "expired" | "upcoming";
  };
  onView: (equipmentId: string) => void;
  onDelete: (equipmentId: string) => void;
}

export function SpotWelderMobileCard({
  equipment,
  onView,
  onDelete,
}: SpotWelderMobileCardProps) {
  const { theme } = useTheme();
  const status = getStatus(equipment.next_test_date);
  const statusColor = getStatusColor(equipment.next_test_date);
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Card className="mb-4 bg-card">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="font-medium">Model</div>
            <div>{equipment.name}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="font-medium">Serial</div>
            <div>{equipment.serial_number}</div>
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
          onClick={() => onView(equipment.id)}
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
        <Button
          onClick={() => onDelete(equipment.id)}
          variant="outline"
          size="default"
          className="h-12 w-12 rounded-lg text-destructive hover:text-destructive/90"
          style={{ 
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
            border: theme === 'light' ? '1px solid #e2e8f0' : 'none'
          }}
        >
          <Trash2 className="h-6 w-6" />
        </Button>
      </CardFooter>
    </Card>
  );
} 