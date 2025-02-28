import { format } from "date-fns";

interface EquipmentInfoProps {
  name?: string;
  serialNumber: string;
  nextTestDate: string;
}

export function EquipmentInfo({ name, serialNumber, nextTestDate }: EquipmentInfoProps) {
  return (
    <div className="grid grid-cols-[1fr_1fr] gap-12">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Serial Number</p>
        <p className="font-medium">{serialNumber}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Next Test Date</p>
        <p className="font-medium">{new Date(nextTestDate).toLocaleDateString('en-GB')}</p>
      </div>
    </div>
  );
}