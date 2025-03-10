import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { SpotWelderIcon } from "@/components/icons/SpotWelderIcon";

export const lolerEquipmentType = {
  icon: Scale,
  name: "LOLER",
  description: "LOLER Inspection Equipment",
  href: (customerId: string) => `/admin/customer/${customerId}/equipment/loler`
};

const EquipmentTypesPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const handleSpotWelderClick = () => {
    navigate(`/admin/spot-welder/${customerId}`);
  };

  return (
    <div>
      {/* Then in the JSX where the button is rendered: */}
      <Button onClick={handleSpotWelderClick}>
        <SpotWelderIcon className="h-6 w-6 mb-2" />
        Spot Welder
      </Button>
    </div>
  );
};

export default EquipmentTypesPage; 