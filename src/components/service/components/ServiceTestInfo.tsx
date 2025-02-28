import { format } from "date-fns";
import { Check, AlertCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ServiceTestInfoProps {
  certificateNumber: string;
  testDate: Date;
  retestDate: Date;
  status: "valid" | "upcoming" | "expired";
  isEditing?: boolean;
  editedData?: any;
  setEditedData?: (data: any) => void;
}

export function ServiceTestInfo({
  certificateNumber,
  testDate,
  retestDate,
  status,
  isEditing,
  editedData,
  setEditedData,
}: ServiceTestInfoProps) {
  const getStatusIcon = () => {
    const currentDate = new Date();
    const retestDateObj = new Date(retestDate);
    
    if (retestDateObj < currentDate) {
      return "expired";
    }
    
    // If retest date is within 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    if (retestDateObj <= thirtyDaysFromNow) {
      return "upcoming";
    }
    
    return "valid";
  };

  const getStatusColor = () => {
    const currentStatus = getStatusIcon();
    switch (currentStatus) {
      case "valid":
        return "bg-green-500";
      case "upcoming":
        return "bg-yellow-500";
      case "expired":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDateForInput = (date: Date) => {
    return format(new Date(date), "yyyy-MM-dd");
  };

  const handleTestDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTestDate = new Date(e.target.value);
    // Calculate retest date as 364 days from test date
    const newRetestDate = new Date(newTestDate);
    newRetestDate.setDate(newRetestDate.getDate() + 364);
    
    setEditedData?.({
      ...editedData,
      test_date: newTestDate,
      retest_date: newRetestDate
    });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Certificate Number</h3>
        <p className="text-lg font-semibold">{certificateNumber}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Test Date</h3>
        {isEditing ? (
          <Input
            type="date"
            value={formatDateForInput(new Date(editedData.test_date))}
            onChange={handleTestDateChange}
            className="w-full"
          />
        ) : (
          <p className="text-lg font-semibold">{format(testDate, "dd/MM/yyyy")}</p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Retest Date</h3>
        {isEditing ? (
          <Input
            type="date"
            value={formatDateForInput(new Date(editedData.retest_date))}
            disabled
            className="w-full bg-muted"
          />
        ) : (
          <p className="text-lg font-semibold">{format(retestDate, "dd/MM/yyyy")}</p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor()}>
            {getStatusIcon().charAt(0).toUpperCase() + getStatusIcon().slice(1)}
          </Badge>
        </div>
      </div>
    </div>
  );
}