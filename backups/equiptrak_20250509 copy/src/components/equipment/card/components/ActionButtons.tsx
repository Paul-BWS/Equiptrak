import { Button } from "@/components/ui/button";
import { FileText, PrinterIcon, Pencil } from "lucide-react";

interface ActionButtonsProps {
  isCompressor: boolean;
  isSpotWelder: boolean;
  serviceRecord: any;
  spotWelderRecord: any;
  serviceRecordLoading: boolean;
  spotWelderLoading: boolean;
  customerId?: string;
  equipmentId: string;
  onViewClick: (e: React.MouseEvent) => void;
  onEditClick: (e: React.MouseEvent) => void;
  onPrintClick: (e: React.MouseEvent) => void;
  theme?: string;
}

export function ActionButtons({ 
  isCompressor,
  onViewClick, 
  onPrintClick, 
  onEditClick,
  theme = 'light'
}: ActionButtonsProps) {
  const buttonStyle = { 
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
    color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
    border: 'none'
  };

  return (
    <div className="flex items-center gap-2">
      {isCompressor && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={onEditClick}
          style={buttonStyle}
        >
          <Pencil className="h-4 w-4" />
          <span className="ml-2">Edit</span>
        </Button>
      )}
      <Button 
        size="sm" 
        variant="outline"
        onClick={onViewClick}
        style={buttonStyle}
      >
        <FileText className="h-4 w-4" />
        <span className="ml-2">View</span>
      </Button>
      <Button 
        size="sm" 
        variant="outline"
        onClick={onPrintClick}
        style={buttonStyle}
      >
        <PrinterIcon className="h-4 w-4" />
        <span className="ml-2">Print</span>
      </Button>
    </div>
  );
}