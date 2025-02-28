import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, PrinterIcon, Trash2 } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useState } from "react";
import { DeleteServiceAlert } from "@/components/service/components/DeleteServiceAlert";
import { useToast } from "@/hooks/use-toast";
import { SpotWelderMobileCard } from "@/components/spot-welder/components/SpotWelderMobileCard";
import { useNavigate } from "react-router-dom";
import { getStatusColor } from "@/utils/serviceStatus";
import { supabase } from "@/integrations/supabase/client";
import { EquipmentInfo } from "../card/components/EquipmentInfo";
import { SpotWelderEquipment } from "@/types/database/spot-welders";

interface SpotWelderCardProps {
  equipment: SpotWelderEquipment;
  showCustomer?: boolean;
  onViewSpotWelder?: (spotWelderId: string) => void;
  isMobile?: boolean;
}

export function SpotWelderCard({ 
  equipment, 
  showCustomer,
  onViewSpotWelder,
  isMobile
}: SpotWelderCardProps) {
  const { theme } = useTheme();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('spot_welder_service_records')
        .delete()
        .eq('id', equipment.id);

      if (error) throw error;

      toast({
        title: "Equipment deleted",
        description: "The spot welder record has been successfully deleted",
      });

      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Error deleting spot welder:', error);
      toast({
        title: "Error",
        description: "Failed to delete spot welder record",
        variant: "destructive",
      });
    }
  };

  const handlePrint = async () => {
    if (!equipment.customer_id) {
      toast({
        title: "Error",
        description: "No customer ID found for this equipment",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Loading certificate",
      description: "Please wait while we load your certificate...",
    });

    try {
      // First fetch the latest service record for this equipment
      const { data: serviceRecords, error } = await supabase
        .from('spot_welder_service_records')
        .select('*')
        .eq('equipment_serial', equipment.serial_number)
        .order('test_date', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!serviceRecords || serviceRecords.length === 0) {
        toast({
          title: "No certificate found",
          description: "No service records found for this equipment. Please create a service record first.",
          variant: "destructive",
        });
        return;
      }

      // Navigate to the certificate page using the latest record ID
      navigate(`/admin/customer/${equipment.customer_id}/spot-welder-certificate/${serviceRecords[0].id}`);
    } catch (error) {
      console.error('Error in handlePrint:', error);
      toast({
        title: "Error",
        description: "Failed to load certificate. Please try again.",
        variant: "destructive",
      });
    }
  };

  const statusColor = getStatusColor(equipment.next_test_date);
  const statusText = equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1);

  if (isMobile) {
    return (
      <>
        <SpotWelderMobileCard
          equipment={equipment}
          onView={(id) => onViewSpotWelder?.(id)}
          onDelete={() => setShowDeleteAlert(true)}
        />
        <DeleteServiceAlert
          open={showDeleteAlert}
          onOpenChange={setShowDeleteAlert}
          onConfirm={handleDelete}
        />
      </>
    );
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <EquipmentInfo 
              name={equipment.name}
              serialNumber={equipment.serial_number}
              nextTestDate={equipment.next_test_date}
            />

            <div className="flex items-center gap-3 ml-8">
              <Badge className={`${statusColor} text-white`}>
                {statusText}
              </Badge>
              <Button 
                size="icon"
                variant="outline"
                onClick={() => onViewSpotWelder?.(equipment.id)}
                style={{ 
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                  color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                  border: 'none'
                }}
                title="View"
                className="h-9 w-9"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                size="icon"
                variant="outline"
                onClick={handlePrint}
                style={{ 
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                  color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                  border: 'none'
                }}
                title="Print"
                className="h-9 w-9"
              >
                <PrinterIcon className="h-4 w-4" />
              </Button>
              <Button 
                size="icon"
                variant="outline"
                onClick={() => setShowDeleteAlert(true)}
                style={{ 
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                  color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                  border: 'none'
                }}
                title="Delete"
                className="h-9 w-9 text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteServiceAlert
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        onConfirm={handleDelete}
      />
    </>
  );
}