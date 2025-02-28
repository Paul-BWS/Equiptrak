import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CertificateHeader } from "@/components/service/certificate/CertificateHeader";
import { CertificateCustomerInfo } from "@/components/service/certificate/CertificateCustomerInfo";
import { CertificateFooter } from "@/components/service/certificate/CertificateFooter";
import { PrintControls } from "@/components/service/certificate/layout/PrintControls";

export default function CompressorCertificatePage() {
  const { serviceId, customerId } = useParams();
  const navigate = useNavigate();

  const { data: serviceRecord, isLoading } = useQuery({
    queryKey: ["compressorService", serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compressor_service_records")
        .select(`
          *,
          equipment (
            *,
            profiles (
              company_name,
              address,
              city,
              postcode,
              email
            )
          ),
          engineers (
            name
          )
        `)
        .eq("id", serviceId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!serviceId,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate(`/admin/customer/${customerId}/equipment/compressor`);
  };

  if (isLoading) {
    return <div>Loading certificate...</div>;
  }

  if (!serviceRecord) {
    return <div>Certificate not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <PrintControls 
        onBack={handleBack}
        onPrint={handlePrint}
        customerEmail={serviceRecord.equipment?.profiles?.email}
        certificateNumber={serviceRecord.certificate_number}
        customerName={serviceRecord.equipment?.profiles?.company_name}
        equipmentName={serviceRecord.equipment?.name}
        className="print:hidden sticky top-0 z-10 mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      />
      <div className="certificate-container">
        <div className="certificate-page">
          <div className="certificate-content">
            <CertificateHeader 
              certificateNumber={serviceRecord.certificate_number} 
              title="Service Certificate"
            />

            <div className="grid grid-cols-2 gap-12 mb-12">
              <CertificateCustomerInfo
                companyName={serviceRecord.equipment?.profiles?.company_name}
                address={serviceRecord.equipment?.profiles?.address}
                city={serviceRecord.equipment?.profiles?.city}
                postcode={serviceRecord.equipment?.profiles?.postcode}
              />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Test Date</h3>
                    <p className="mt-1">{new Date(serviceRecord.test_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Retest Date</h3>
                    <p className="mt-1">{new Date(serviceRecord.retest_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Engineer</h3>
                  <p className="mt-1">{serviceRecord.engineers?.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Make</h3>
                    <p className="mt-1">{serviceRecord.equipment?.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Serial Number</h3>
                    <p className="mt-1">{serviceRecord.equipment?.serial_number}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8 mb-12">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">Function Tested</h2>
                <div className="space-y-2 text-sm">
                  <p>• Maintenance carried out to product specification.</p>
                  <p>• Checked pressure activation button is working correctly.</p>
                  <p>• Checked for leaks.</p>
                  <p>• Operationally tested.</p>
                  <p>• Drive belts if applicable.</p>
                  <p>• Tanks inspected for damage.</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">Test Method</h2>
                <p className="text-sm">
                  I/We hereby Certify that the above equipment has been tested/inspected in accordance with manufacturer specifications.
                </p>
              </div>
            </div>

            <CertificateFooter notes={serviceRecord.notes} />
          </div>
        </div>
      </div>
    </div>
  );
} 