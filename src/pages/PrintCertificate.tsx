import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";

export default function PrintCertificate() {
  const { certificateId } = useParams<{ certificateId: string }>();

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" onClick={() => window.history.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Print Certificate</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4">Certificate ID: {certificateId}</p>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Print Certificate
        </Button>
      </div>
    </div>
  );
} 