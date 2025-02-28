import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Printer } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useState } from "react";
import { useDeleteEquipmentMutation } from "@/hooks/equipment/useDeleteEquipmentMutation";
import { format } from "date-fns";
import { getStatus, getStatusColor } from "@/utils/serviceStatus";
import { DeleteServiceAlert } from "@/components/service/components/DeleteServiceAlert";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface LolerCardProps {
  equipment: {
    id: string;
    name: string;
    serial_number: string;
    next_test_date: string;
    status: "valid" | "upcoming" | "expired";
    customer_id: string;
  };
  onViewLoler: (id: string) => void;
  isMobile: boolean;
}

export function LolerCard({ equipment, onViewLoler, isMobile }: LolerCardProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const deleteMutation = useDeleteEquipmentMutation();

  const status = getStatus(equipment.next_test_date);
  const statusColor = getStatusColor(equipment.next_test_date);
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(equipment.id);
      setIsDeleteAlertOpen(false);
    } catch (error) {
      console.error("Error deleting equipment:", error);
    }
  };

  const handlePrint = async () => {
    try {
      const { data: serviceRecord } = await supabase
        .from("loler_service_records")
        .select("id")
        .eq("equipment_id", equipment.id)
        .order("inspection_date", { ascending: false })
        .limit(1)
        .single();

      if (serviceRecord) {
        window.open(`/admin/customer/${equipment.customer_id}/loler-certificate/${serviceRecord.id}`, "_blank");
      }
    } catch (error) {
      console.error("Error fetching latest service record:", error);
    }
  };

  // Mobile Card
  if (isMobile) {
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
        <div className="flex justify-end gap-3 p-6 pt-4">
          <Button
            onClick={() => onViewLoler(equipment.id)}
            variant="outline"
            size="default"
            className="h-12 w-12 rounded-lg"
            style={{ 
              backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
              color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
              border: 'none'
            }}
          >
            <Eye className="h-6 w-6" />
          </Button>
          <Button
            onClick={() => setIsDeleteAlertOpen(true)}
            variant="outline"
            size="default"
            className="h-12 w-12 rounded-lg text-destructive hover:text-destructive/90"
            style={{ 
              backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
              color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
              border: 'none'
            }}
          >
            <Trash2 className="h-6 w-6" />
          </Button>
        </div>
      </Card>
    );
  }

  // Desktop Card
  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-3 gap-8 flex-1">
              <div>
                <div className="text-sm text-muted-foreground">Model</div>
                <div className="font-medium">{equipment.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Serial Number</div>
                <div className="font-medium">{equipment.serial_number}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Next Test Date</div>
                <div className="font-medium">
                  {format(new Date(equipment.next_test_date), "dd/MM/yyyy")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-8">
              <Badge className={`${statusColor} text-white`}>
                {statusText}
              </Badge>
              <Button
                onClick={() => onViewLoler(equipment.id)}
                variant="outline"
                size="icon"
                className="h-9 w-9"
                style={{ 
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                  color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                  border: 'none'
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                size="icon"
                className="h-9 w-9"
                style={{ 
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                  color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                  border: 'none'
                }}
              >
                <Printer className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setIsDeleteAlertOpen(true)}
                variant="outline"
                size="icon"
                className="h-9 w-9 text-destructive hover:text-destructive/90"
                style={{ 
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                  color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                  border: 'none'
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteServiceAlert
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={handleDelete}
      />
    </>
  );
} 