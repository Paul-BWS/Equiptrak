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
  const { recordId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: serviceRecord, isLoading, error } = useQuery({
    queryKey: ['serviceRecord', recordId],
    queryFn: async () => {
      console.log('Attempting to fetch service record with ID:', recordId);
      
      if (!recordId) {
        console.error('No recordId provided');
        throw new Error('No service ID provided');
      }

      // First, get the service record
      const { data: serviceData, error: serviceError } = await supabase
        .from('service_records')
        .select('*')
        .eq('id', recordId)
        .single();

      if (serviceError) {
        console.error('Supabase error fetching service record:', serviceError);
        throw serviceError;
      }

      if (!serviceData) {
        console.error('No service record found for recordId:', recordId);
        throw new Error('Service record not found');
      }

      // Then, get the company details
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', serviceData.company_id)
        .single();

      if (companyError) {
        console.error('Supabase error fetching company:', companyError);
        // Don't throw here, we'll just return the service data without company info
      }

      // Combine the data
      const combinedData = {
        ...serviceData,
        companies: companyData || null
      };

      console.log('Successfully fetched service record with company data:', combinedData);
      return combinedData;
    },
    retry: 1,
    enabled: !!recordId,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    // Navigate back to the customer's service list using the company_id
    if (serviceRecord?.company_id) {
      navigate(`/admin/service/${serviceRecord.company_id}`);
    } else {
      // Fallback to the main service list if no company_id is available
      navigate('/admin');
    }
  };

  const handlePrintQR = () => {
    navigate(`/certificate/${recordId}/qr`);
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

  console.log('Rendering certificate with data:', {
    companyName: serviceRecord.companies?.company_name,
    address: serviceRecord.companies?.address,
    city: serviceRecord.companies?.city,
    postcode: serviceRecord.companies?.postcode,
    engineerName: serviceRecord.engineer_name
  });

  return (
    <div className="min-h-screen print:min-h-0 print:h-auto print:bg-white bg-background">
      <PrintControls 
        onBack={handleBack}
        onPrint={handlePrint}
        onPrintQR={handlePrintQR}
        certificateNumber={serviceRecord.certificate_number}
        customerName={serviceRecord.companies?.company_name}
        equipmentName="Service Equipment"
        className="print:hidden sticky top-0 z-10 mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      />
      <div className="print:absolute print:inset-0 print:m-0 print:p-0 print:w-[210mm] print:h-[297mm] print:overflow-hidden">
        <div className="w-[210mm] h-[297mm] bg-white text-black p-[15mm] print:p-[15mm] mx-auto flex flex-col">
          <div className="flex-1">
            <CertificateHeader certificateNumber={serviceRecord.certificate_number} />

            <div className="grid grid-cols-2 gap-8 mb-8 mt-6">
              <CertificateCustomerInfo
                companyName={serviceRecord.companies?.company_name}
                address={serviceRecord.companies?.address}
                city={serviceRecord.companies?.city}
                postcode={serviceRecord.companies?.postcode}
              />
              <CertificateServiceInfo
                testDate={serviceRecord.test_date}
                retestDate={serviceRecord.retest_date}
                engineerName={serviceRecord.engineer_name}
              />
            </div>

            <div className="space-y-6 max-w-3xl mx-auto">
              <CertificateEquipment serviceRecord={serviceRecord} />
              <CertificateStandardTests />
            </div>
          </div>

          <CertificateFooter 
            notes={serviceRecord.notes} 
            certificateId={recordId || ''} 
          />
        </div>
      </div>
    </div>
  );
}