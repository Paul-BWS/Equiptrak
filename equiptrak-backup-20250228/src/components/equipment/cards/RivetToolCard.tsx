import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Printer, Trash2 } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { RivetToolRecord } from "@/types/database/rivet-tools";
import { formatDate } from "@/utils/dates";
import { getStatus, getStatusColor } from "@/utils/serviceStatus";

interface RivetToolCardProps {
  record: RivetToolRecord;
  showCustomer?: boolean;
  onView: (id: string) => void;
  onPrint: (id: string) => void;
  onDelete: (id: string) => void;
  isMobile: boolean;
}

export function RivetToolCard({
  record,
  onView,
  onPrint,
  onDelete,
  isMobile,
}: RivetToolCardProps) {
  const { theme } = useTheme();
  const status = getStatus(record.retest_date);
  const statusColor = getStatusColor(record.retest_date);
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);

  if (isMobile) {
    return (
      <Card className="mb-4 bg-card">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="font-medium">Model</div>
              <div>{record.rivet_tool_model || "N/A"}</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="font-medium">Serial</div>
              <div>{record.equipment_serial}</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="font-medium">Retest Date</div>
              <div>{formatDate(record.retest_date)}</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="font-medium">Status</div>
              <Badge className={`${statusColor} text-white`}>
                {statusText}
              </Badge>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onView(record.id)}
              className="h-8 w-8"
              style={{ 
                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                border: theme === 'light' ? '1px solid #e2e8f0' : 'none'
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPrint(record.id)}
              className="h-8 w-8"
              style={{ 
                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                border: theme === 'light' ? '1px solid #e2e8f0' : 'none'
              }}
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(record.id)}
              className="h-8 w-8 text-destructive hover:text-destructive/90"
              style={{ 
                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                border: theme === 'light' ? '1px solid #e2e8f0' : 'none'
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-3 gap-8 flex-1">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Model</h3>
              <p>{record.rivet_tool_model || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Serial</h3>
              <p>{record.equipment_serial}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Retest Date</h3>
              <p>{formatDate(record.retest_date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-8">
            <Badge className={`${statusColor} text-white`}>
              {statusText}
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
              onClick={() => onPrint(record.id)}
              style={{ 
                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                border: 'none'
              }}
              title="Print"
              className="h-9 w-9"
            >
              <Printer className="h-4 w-4" />
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