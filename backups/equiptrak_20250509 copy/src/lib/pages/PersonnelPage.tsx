import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PersonnelPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personnel</h1>
          <p className="text-muted-foreground">
            Manage employee records and certifications
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Personnel
        </Button>
      </div>
      
      {/* Placeholder for personnel list/table */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <p className="text-muted-foreground text-center py-8">
          Personnel management features coming soon
        </p>
      </div>
    </div>
  );
} 