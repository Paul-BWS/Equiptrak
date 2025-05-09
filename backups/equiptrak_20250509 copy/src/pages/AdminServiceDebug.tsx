import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function AdminServiceDebug() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/admin")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Debug Service Page</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg border">
        <p>Customer ID: {customerId || "No ID provided"}</p>
        <p>This is a debug page to test routing.</p>
      </div>
    </div>
  );
}

export default AdminServiceDebug; 