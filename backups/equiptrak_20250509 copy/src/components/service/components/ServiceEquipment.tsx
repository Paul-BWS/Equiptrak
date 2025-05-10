import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ServiceEquipmentProps {
  equipment: {
    name: string;
    serial_number: string;
  } | null;
}

export function ServiceEquipment({ equipment }: ServiceEquipmentProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Equipment</Label>
        <Input value={equipment?.name || ""} disabled />
      </div>
      <div className="space-y-2">
        <Label>Serial Number</Label>
        <Input value={equipment?.serial_number || ""} disabled />
      </div>
    </div>
  );
}