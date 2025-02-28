import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, PrinterIcon, Trash } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { CustomerInfo } from "../card/components/CustomerInfo";
import { EquipmentInfo } from "../card/components/EquipmentInfo";

interface ServiceEquipmentCardProps {
  equipment: {
    id: string;
    name: string;
    serial_number: string;
    next_test_date: string;
    status: "valid" | "expired" | "upcoming";
    customer_id?: string;
    companies?: {
      company_name: string | null;
    } | null;
    equipment_types?: {
      name: string;
      description: string | null;
    } | null;
  };
  showCustomer?: boolean;
  isMobile: boolean;
}

export function ServiceEquipmentCard({ equipment, showCustomer, isMobile }: ServiceEquipmentCardProps) {
  const { theme } = useTheme();

  const statusConfig = {
    valid: { color: "bg-green-500", text: "Valid" },
    expired: { color: "bg-red-500", text: "Expired" },
    upcoming: { color: "bg-yellow-500", text: "Upcoming" }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <CustomerInfo 
            companyName={equipment.companies?.company_name || null}
            showCustomer={showCustomer}
          />
          
          <div className="flex items-center justify-between">
            <EquipmentInfo 
              name={equipment.name}
              serialNumber={equipment.serial_number}
              nextTestDate={equipment.next_test_date}
            />

            {!isMobile && (
              <div className="flex items-center gap-2">
                <Badge 
                  className={`px-3 py-1 text-white font-semibold ${statusConfig[equipment.status].color}`}
                >
                  {statusConfig[equipment.status].text}
                </Badge>
                <Button 
                  size="sm" 
                  variant="outline"
                  style={{ 
                    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                    color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                    border: 'none'
                  }}
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  style={{ 
                    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                    color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                    border: 'none'
                  }}
                >
                  <PrinterIcon className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  style={{ 
                    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                    color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                    border: 'none'
                  }}
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}