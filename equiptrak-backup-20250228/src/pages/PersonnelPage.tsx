import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PersonnelPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/admin/customer/${customerId}/details`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-card rounded-lg border border-border/50 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Personnel Management</h2>
            <p className="text-muted-foreground">
              View and manage company personnel
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <p>Personnel management features coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 