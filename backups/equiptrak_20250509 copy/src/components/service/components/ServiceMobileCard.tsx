import { format } from "date-fns";
import { Eye, PrinterIcon, Trash2 } from "lucide-react";
import { ServiceRecord } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";

interface ServiceMobileCardProps {
  record: ServiceRecord;
  onView: (recordId: string) => void;
  onNavigate: (recordId: string) => void;
  onDelete: (recordId: string) => void;
  getStatus: (retestDate: string) => "valid" | "upcoming" | "expired";
  getStatusColor: (retestDate: string) => string;
}

export function ServiceMobileCard({
  record,
  onView,
  onNavigate,
  onDelete,
  getStatus,
  getStatusColor,
}: ServiceMobileCardProps) {
  const { theme } = useTheme();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Serial Number</div>
              <div className="font-medium">{record.certificate_number}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Next Test Date</div>
              <div>{format(new Date(record.retest_date), "dd/MM/yyyy")}</div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3">
            <Badge className={getStatusColor(record.retest_date)}>
              {getStatus(record.retest_date).charAt(0).toUpperCase() + 
               getStatus(record.retest_date).slice(1)}
            </Badge>
            <Button 
              size="icon"
              variant="outline"
              onClick={() => onView(record.id)}
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
              onClick={() => onNavigate(record.id)}
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
              onClick={() => onDelete(record.id)}
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
  );
}