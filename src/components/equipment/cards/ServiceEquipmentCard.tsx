import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, User } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { CustomerInfo } from "../card/components/CustomerInfo";
import { EquipmentInfo } from "../card/components/EquipmentInfo";
import { useNavigate } from "react-router-dom";

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
    booking_status?: 'booked' | 'not_booked';
    booking_date?: string;
    profiles?: {
      company_name: string | null;
    } | null;
  };
  showCustomer?: boolean;
  isMobile: boolean;
}

export function ServiceEquipmentCard({ equipment, showCustomer, isMobile }: ServiceEquipmentCardProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const statusConfig = {
    valid: { color: "bg-green-500", text: "Valid" },
    expired: { color: "bg-red-500", text: "Expired" },
    upcoming: { color: "bg-yellow-500", text: "Upcoming" }
  };

  const handleCustomerClick = () => {
    if (equipment.customer_id) {
      navigate(`/admin/customers/${equipment.customer_id}`);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <CustomerInfo 
            companyName={equipment.profiles?.company_name || "Unknown Company"}
            showCustomer={showCustomer}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">{equipment.name}</div>
              <div className="text-sm text-muted-foreground">
                SN: {equipment.serial_number}
              </div>
              <div className="flex items-center mt-1 space-x-4">
                <div className="text-sm text-muted-foreground">
                  Next Test: {new Date(equipment.next_test_date).toLocaleDateString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Type: {equipment.equipment_types?.name || "Unknown"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge 
                className={`px-3 py-1 text-white font-semibold ${statusConfig[equipment.status].color}`}
              >
                {statusConfig[equipment.status].text}
              </Badge>
              
              {equipment.booking_status === 'booked' && (
                <div className="flex items-center text-blue-500 ml-2">
                  <Calendar className="h-4 w-4 mr-1" />
                </div>
              )}
              
              {/* Only show Customer button on desktop */}
              {!isMobile && equipment.customer_id && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleCustomerClick}
                  className="ml-2"
                >
                  <User className="h-4 w-4" />
                  <span className="ml-1">Customer</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}