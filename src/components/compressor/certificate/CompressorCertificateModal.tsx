import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface CompressorCertificateModalProps {
  serviceRecordId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompressorCertificateModal({
  serviceRecordId,
  open,
  onOpenChange,
}: CompressorCertificateModalProps) {
  const handlePrint = () => {
    // In a real implementation, this would open a print view or generate a PDF
    console.log("Print certificate for service record:", serviceRecordId);
    window.open(`/admin/compressor/certificate/${serviceRecordId}/print`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Compressor Certificate</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-6 border rounded-md">
            <h3 className="text-lg font-semibold mb-4">Certificate Preview</h3>
            <p className="mb-4">
              This is a placeholder for the compressor certificate preview. In a real implementation,
              this would show a preview of the certificate with all relevant information.
            </p>
            <p>Service Record ID: {serviceRecordId}</p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print Certificate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 