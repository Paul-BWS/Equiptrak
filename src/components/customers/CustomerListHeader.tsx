import { Users } from "lucide-react";

export function CustomerListHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Users className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Customers</h3>
      </div>
    </div>
  );
}