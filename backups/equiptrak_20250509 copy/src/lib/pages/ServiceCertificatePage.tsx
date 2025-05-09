import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CertificateHeader } from '@/components/service/certificate/CertificateHeader';
import { CertificateCustomerInfo } from '@/components/service/certificate/CertificateCustomerInfo';
import { CertificateServiceInfo } from '@/components/service/certificate/CertificateServiceInfo';
import { CertificateEquipment } from '@/components/service/certificate/CertificateEquipment';
import { CertificateStandardTests } from '@/components/service/certificate/CertificateStandardTests';
import { CertificateFooter } from '@/components/service/certificate/CertificateFooter';
import { PrintControls } from '@/components/service/certificate/layout/PrintControls';

export default function ServiceCertificatePage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: serviceRecord, isLoading, error } = useQuery({
    queryKey: ['serviceRecord', serviceId],
    queryFn: async () => {
      console.log('Attempting to fetch service record with ID:', serviceId);
      
      if (!serviceId) {
        console.error('No serviceId provided');
        throw new Error('No service ID provided');
      }

      const { data, error } = await supabase
        .from('service_records')
        .select(`
          *,
          company:companies(
            company_name,
            address,
            city,
            postcode
          )
        `)
        .eq('id', serviceId)
        .maybeSingle();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        console.error('No data found for serviceId:', serviceId);
        throw new Error('Service record not found');
      }

      console.log('Successfully fetched service record:', data);
      return data;
    },
    retry: 1,
    enabled: !!serviceId,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    if (serviceRecord?.company_id) {
      navigate(`/admin/customer/${serviceRecord.company_id}/service`);
    } else {
      navigate(-1);
    }
  };

  if (error) {
    console.error('Query error:', error);
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h2 className="text-red-800 font-semibold">Error Loading Certificate</h2>
          <p className="text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading certificate...</div>;
  }

  if (!serviceRecord) {
    return <div>Certificate not found</div>;
  }

  return (
    <div className="min-h-screen print:min-h-0 print:h-auto print:bg-white bg-background">
      <PrintControls 
        onBack={handleBack}
        onPrint={handlePrint}
        certificateNumber={serviceRecord.certificate_number}
        customerName={serviceRecord.company?.company_name}
        equipmentName="Service Equipment"
        className="print:hidden sticky top-0 z-10 mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      />
      <div className="print:absolute print:inset-0 print:m-0 print:p-0 print:w-[210mm] print:h-[297mm] print:overflow-hidden">
        <div className="w-[210mm] h-[297mm] bg-white text-black p-[12mm] print:p-[12mm] mx-auto flex flex-col">
          <div className="flex-1">
            <CertificateHeader certificateNumber={serviceRecord.certificate_number} />

            <div className="grid grid-cols-2 gap-8 mb-8 mt-6">
              <CertificateCustomerInfo
                companyName={serviceRecord.company?.company_name}
                address={serviceRecord.company?.address}
                city={serviceRecord.company?.city}
                postcode={serviceRecord.company?.postcode}
              />
              <CertificateServiceInfo
                testDate={serviceRecord.test_date}
                retestDate={serviceRecord.retest_date}
                engineerName={serviceRecord.engineer_name}
              />
            </div>

            <div className="space-y-6">
              <CertificateEquipment serviceRecord={serviceRecord} />
              <CertificateStandardTests />
            </div>
          </div>

          <CertificateFooter notes={serviceRecord.notes} />
        </div>
      </div>
    </div>
  );
}