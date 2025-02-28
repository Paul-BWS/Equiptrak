import { Building2 } from "lucide-react";

interface CustomerInfoProps {
  companyName: string | null;
  showCustomer?: boolean;
}

export function CustomerInfo({ companyName, showCustomer }: CustomerInfoProps) {
  if (!showCustomer) return null;

  return (
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-xl font-semibold">{companyName || "Unknown Company"}</h3>
      </div>
    </div>
  );
}