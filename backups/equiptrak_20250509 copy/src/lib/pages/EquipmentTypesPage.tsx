import { Scale } from "lucide-react";

export const lolerEquipmentType = {
  icon: Scale,
  name: "LOLER",
  description: "LOLER Inspection Equipment",
  href: (customerId: string) => `/admin/customer/${customerId}/equipment/loler`
}; 