import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function CustomersHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-muted-foreground">View and manage your customers</p>
      </div>
    </div>
  );
} 