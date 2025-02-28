import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CertificateHeader } from "@/components/service/certificate/CertificateHeader";
import { CertificateCustomerInfo } from "@/components/service/certificate/CertificateCustomerInfo";
import { CertificateFooter } from "@/components/service/certificate/CertificateFooter";
import { PrintControls } from "@/components/service/certificate/layout/PrintControls";
import { SpotWelderServiceInfo } from "./SpotWelderServiceInfo";
import { SpotWelderParameters } from "./SpotWelderParameters";
import { SpotWelderTestData } from "./SpotWelderTestData";

interface SpotWelderCertificateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceRecord: {
    id: string;
    certificate_number: string;
    test_date: string;
    retest_date: string;
    notes?: string | null;
    engineers?: {
      name: string;
    } | null;
    equipment?: {
      name: string;
      serial_number: string;
      profiles?: {
        company_name: string | null;
        address: string | null;
        city: string | null;
        postcode: string | null;
      } | null;
    } | null;
    max_current?: number | null;
    electrode_force?: number | null;
    voltage_max?: number | null;
    voltage_min?: number | null;
    air_pressure?: number | null;
    tip_pressure?: number | null;
    length?: number | null;
    diameter?: number | null;
    welding_time_1?: number | null;
    welding_time_2?: number | null;
    welding_time_3?: number | null;
    welding_time_4?: number | null;
    machine_time_1?: number | null;
    machine_time_2?: number | null;
    machine_time_3?: number | null;
    machine_time_4?: number | null;
    welding_current_1?: number | null;
    welding_current_2?: number | null;
    welding_current_3?: number | null;
    welding_current_4?: number | null;
    machine_current_1?: number | null;
    machine_current_2?: number | null;
    machine_current_3?: number | null;
    machine_current_4?: number | null;
  };
  customerName?: string;
  customerEmail?: string;
}

export function SpotWelderCertificate({
  open,
  onOpenChange,
  serviceRecord,
  customerName,
  customerEmail,
}: SpotWelderCertificateProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[210mm] p-0 print:p-0 print:max-w-none">
        <div className="print:fixed print:top-0 print:left-0 print:m-0 print:p-0 print:w-[210mm] print:h-[297mm]">
          <div className="w-[210mm] min-h-[297mm] bg-white text-black p-[12mm] print:p-[12mm] print:overflow-visible">
            <CertificateHeader certificateNumber={serviceRecord.certificate_number} />

            <div className="grid grid-cols-2 gap-8 mb-8 mt-6">
              <CertificateCustomerInfo
                companyName={serviceRecord.equipment?.profiles?.company_name}
                address={serviceRecord.equipment?.profiles?.address}
                city={serviceRecord.equipment?.profiles?.city}
                postcode={serviceRecord.equipment?.profiles?.postcode}
              />
              <SpotWelderServiceInfo
                testDate={serviceRecord.test_date}
                retestDate={serviceRecord.retest_date}
                engineerName={serviceRecord.engineers?.name}
                equipmentName={serviceRecord.equipment?.name}
                serialNumber={serviceRecord.equipment?.serial_number}
              />
            </div>

            <SpotWelderParameters serviceRecord={serviceRecord} />
            <SpotWelderTestData serviceRecord={serviceRecord} />
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