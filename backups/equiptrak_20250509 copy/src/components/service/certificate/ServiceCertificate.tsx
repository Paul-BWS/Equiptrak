import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CertificateHeader } from "@/components/service/certificate/CertificateHeader";
import { CertificateCustomerInfo } from "@/components/service/certificate/CertificateCustomerInfo";
import { CertificateServiceInfo } from "@/components/service/certificate/CertificateServiceInfo";
import { CertificateEquipment } from "@/components/service/certificate/CertificateEquipment";
import { CertificateStandardTests } from "@/components/service/certificate/CertificateStandardTests";
import { CertificateFooter } from "@/components/service/certificate/CertificateFooter";
import { PrintControls } from "@/components/service/certificate/layout/PrintControls";
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
    // Create a dedicated print stylesheet that ensures only the certificate is printed
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = 'print-style-temp';
    
    // This CSS hides everything except the certificate content
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .certificate-content-print, .certificate-content-print * {
          visibility: visible;
        }
        .certificate-content-print {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    // Print the page (only certificate will be visible)
    window.print();
    
    // After printing, remove the temporary style
    document.head.removeChild(style);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[210mm] p-0 print:p-0 print:max-w-none">
        <div className="relative min-h-[297mm] print:absolute print:top-1/2 print:left-1/2 print:-translate-x-1/2 print:-translate-y-1/2 print:m-0 certificate-content-print">
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
            <CertificateFooter 
              notes={serviceRecord.notes} 
              certificateId={serviceRecord.id || 'unknown'}
            />
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