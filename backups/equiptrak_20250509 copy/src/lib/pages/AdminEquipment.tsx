import { EquipmentDashboard } from "@/components/EquipmentDashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Grid } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/components/theme-provider";

export default function AdminEquipment() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { customerId } = useParams();
  const { theme } = useTheme();
  
  const handleBack = () => {
    navigate('/admin');
  };

  const handleEquipmentTypes = () => {
    navigate(`/admin/customer/${customerId}/equipment/types`);
  };

  const renderButtons = () => (
    <div className={`flex gap-3 ${isMobile ? 'flex-row' : 'justify-between items-center'}`}>
      <Button
        variant="ghost"
        onClick={handleBack}
        className={`gap-2 bg-muted dark:bg-muted hover:bg-accent dark:hover:bg-accent ${isMobile ? 'flex-1 justify-center text-base py-6' : ''}`}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <Button
        variant="outline"
        onClick={handleEquipmentTypes}
        className={`gap-2 ${isMobile ? 'flex-1 justify-center text-base py-6' : ''}`}
        style={{ 
          backgroundColor: theme === 'dark' ? '#a6e15a' : '#7b96d4',
          color: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          border: 'none'
        }}
      >
        <Grid className="h-4 w-4" />
        Equipment Types
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <EquipmentDashboard 
        renderButtons={renderButtons}
        customerId={customerId}
      />
    </div>
  );
}