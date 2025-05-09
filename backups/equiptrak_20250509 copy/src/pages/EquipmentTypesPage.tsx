import { Scale, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { SpotWelderIcon } from "@/components/icons/SpotWelderIcon";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";

export const lolerEquipmentType = {
  icon: Scale,
  name: "LOLER",
  description: "LOLER Inspection Equipment",
  href: (customerId: string) => `/admin/customer/${customerId}/equipment/loler`
};

const EquipmentTypesPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  if (!customerId) {
    return <div>Error: Customer ID not found.</div>;
  }

  const handleSpotWelderClick = () => {
    navigate(`/admin/spot-welder/${customerId}`);
  };

  const handleServiceRecordsClick = () => {
    navigate(`/admin/customer/${customerId}/service-records`);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Equipment Types" backPath={`/admin/customer/${customerId}`}/>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={handleSpotWelderClick}>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <SpotWelderIcon className="h-12 w-12 mb-2 text-primary" />
            <span className="font-medium">Spot Welders</span>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={handleServiceRecordsClick}>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Wrench className="h-12 w-12 mb-2 text-primary" />
            <span className="font-medium">Service Records</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EquipmentTypesPage; 