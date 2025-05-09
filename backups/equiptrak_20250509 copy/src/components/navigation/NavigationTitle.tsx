import { Link } from "react-router-dom";
import { useLocation, useParams } from "react-router-dom";
import { Wrench } from "lucide-react";

export const NavigationTitle = () => {
  const location = useLocation();
  const { customerId } = useParams();

  const isCustomerRoute = location.pathname.includes('/admin/customer/') && customerId;
  const isEquipmentRoute = location.pathname.includes('/admin/equipment');
  const isChatRoute = location.pathname.includes('/admin/chat');

  const getTitle = () => {
    if (isEquipmentRoute) return "Equipment";
    if (isChatRoute) return "Chat";
    if (isCustomerRoute) return "Customer Details";
    return "EquipTrack";
  };

  return (
    <Link 
      to="/admin" 
      className="flex items-center gap-2 text-xl font-semibold text-foreground hover:text-primary transition-colors"
    >
      <Wrench className="h-6 w-6" />
      {getTitle()}
    </Link>
  );
};