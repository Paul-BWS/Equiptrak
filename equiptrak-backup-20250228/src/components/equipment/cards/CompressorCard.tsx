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
  record: CompressorRecord;
  showCustomer?: boolean;
  onPrint?: (compressorId: string) => void;
  onDelete?: (compressorId: string) => void;
  onView?: (compressorId: string) => void;
  isMobile?: boolean;
}

export function CompressorCard({ 
  record, 
  showCustomer,
  onPrint,
  onDelete,
  onView,
  isMobile
}: CompressorCardProps) {
  const { theme } = useTheme();
  const status = getStatus(record.retest_date);
  const statusColor = getStatusColor(record.retest_date);
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        <Card className="mb-4 bg-card">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-medium">Model</div>
                <div>{record.compressor_model}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="font-medium">Serial</div>
                <div>{record.equipment_serial}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="font-medium">Retest Date</div>
                <div>{format(new Date(record.retest_date), "dd/MM/yyyy")}</div>
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
            {onDelete && (
              <Button
                onClick={() => onDelete(record.id)}
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
            )}
          </CardFooter>
        </Card>

        <EditCompressorModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          record={record}
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
              serialNumber={record.equipment_serial}
              nextTestDate={record.retest_date}
            />

            <div className="flex items-center gap-3 ml-8">
              <Badge className={`${statusColor} text-white`}>
                {statusText}
              </Badge>
              <Button 
                size="icon"
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
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
              {onPrint && (
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
              )}
              {onDelete && (
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
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <EditCompressorModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        record={record}
      />
    </>
  );
}