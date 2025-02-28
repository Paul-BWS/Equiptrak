import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CertificateHeader } from "./certificate/CertificateHeader";
import { CertificateCustomerInfo } from "./certificate/CertificateCustomerInfo";
import { CertificateServiceInfo } from "./certificate/CertificateServiceInfo";
import { CertificateEquipment } from "./certificate/CertificateEquipment";
import { CertificateStandardTests } from "./certificate/CertificateStandardTests";
import { CertificateFooter } from "./certificate/CertificateFooter";
import { PrintControls } from "./certificate/layout/PrintControls";
import { ServiceRecord } from "@/types/database";

interface ServiceCertificateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceRecord: ServiceRecord;
  customerName?: string;
  customerEmail?: string;
}

export function ServiceCertificate({
  open,
  onOpenChange,
  serviceRecord,
  customerName,
  customerEmail,
}: ServiceCertificateProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[210mm] p-0 print:p-0 print:max-w-none">
        <div className="relative min-h-[297mm] print:absolute print:top-1/2 print:left-1/2 print:-translate-x-1/2 print:-translate-y-1/2 print:m-0">
          <div className="w-[210mm] h-[297mm] bg-white text-black p-[12mm] mx-auto scale-[0.55] origin-top-left transform print:scale-100 print:transform-none">
            <CertificateHeader certificateNumber={serviceRecord.certificate_number} />

            <div className="grid grid-cols-2 gap-12 mb-12">
              <CertificateCustomerInfo
                companyName={customerName}
                address="1 Example Street"
                city="Manchester"
                postcode="M1 1AA"
              />
              <CertificateServiceInfo
                testDate={serviceRecord.test_date}
                retestDate={serviceRecord.retest_date}
                engineerName={serviceRecord.engineer_name}
              />
            </div>

            <CertificateEquipment serviceRecord={serviceRecord} />
            <CertificateStandardTests />
            <CertificateFooter notes={serviceRecord.notes} />
          </div>
        </div>

        <PrintControls 
          onClose={() => onOpenChange(false)}
          onPrint={handlePrint}
          customerEmail={customerEmail}
          isModal={true}
        />
      </DialogContent>
    </Dialog>
  );
}