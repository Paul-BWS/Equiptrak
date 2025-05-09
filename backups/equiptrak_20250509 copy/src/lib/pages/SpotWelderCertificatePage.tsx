import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CertificateHeader } from '@/components/service/certificate/CertificateHeader';
import { CertificateCustomerInfo } from '@/components/service/certificate/CertificateCustomerInfo';
import { CertificateFooter } from '@/components/service/certificate/CertificateFooter';
import { SpotWelderServiceInfo } from '@/components/spot-welder/certificate/SpotWelderServiceInfo';
import { PrintControls } from '@/components/service/certificate/layout/PrintControls';
import { SpotWelderParameters } from '@/components/spot-welder/certificate/SpotWelderParameters';
import { SpotWelderTestData } from '@/components/spot-welder/certificate/SpotWelderTestData';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function SpotWelderCertificatePage() {
  const { serviceId, customerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: serviceRecord, isLoading } = useQuery({
    queryKey: ['spotWelderService', serviceId],
    queryFn: async () => {
      if (!serviceId) {
        throw new Error('No service ID provided');
      }

      console.log('Fetching spot welder service record:', serviceId);
      const { data, error } = await supabase
        .from('spot_welder_service_records')
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
        console.error('Error fetching spot welder service record:', error);
        toast({
          title: 'Error',
          description: 'Failed to load certificate',
          variant: 'destructive',
        });
        throw error;
      }

      if (!data) {
        toast({
          title: 'Not found',
          description: 'Certificate not found',
          variant: 'destructive',
        });
        throw new Error('Certificate not found');
      }

      console.log('Spot welder service record:', data);
      return data;
    },
    enabled: !!serviceId,
    retry: false,
  });

  // Update document title when certificate number is available
  useEffect(() => {
    if (serviceRecord?.certificate_number) {
      document.title = `Certificate ${serviceRecord.certificate_number}`;
    }
    // Cleanup on unmount
    return () => {
      document.title = 'EquipTrak';
    };
  }, [serviceRecord?.certificate_number]);

  const handleBack = () => {
    navigate(`/admin/customer/${customerId}/equipment/spot-welder`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (!serviceRecord) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Certificate not found</h2>
          <p className="text-muted-foreground">The requested certificate could not be found.</p>
          <Button onClick={handleBack} variant="outline">Go back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen print:min-h-0 print:h-auto print:bg-white bg-background">
      <PrintControls 
        onBack={handleBack}
        onPrint={handlePrint}
        certificateNumber={serviceRecord.certificate_number}
        customerName={serviceRecord.equipment_name}
        className="print:hidden sticky top-0 z-10 mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      />
      <div className="print:absolute print:inset-0 print:m-0 print:p-0 print:w-[210mm] print:h-[297mm] print:overflow-hidden">
        <div className="w-[210mm] h-[297mm] bg-white text-black p-[12mm] print:p-[12mm] mx-auto">
          <CertificateHeader certificateNumber={serviceRecord.certificate_number} />

          <div className="grid grid-cols-2 gap-8 mb-8 mt-6">
            <CertificateCustomerInfo
              companyName={serviceRecord.company?.company_name}
              address={serviceRecord.company?.address}
              city={serviceRecord.company?.city}
              postcode={serviceRecord.company?.postcode}
            />
            <SpotWelderServiceInfo
              testDate={serviceRecord.test_date}
              retestDate={serviceRecord.retest_date}
              engineerName={serviceRecord.engineer_name}
              equipmentName={serviceRecord.equipment_name}
              serialNumber={serviceRecord.equipment_serial}
            />
          </div>

          <SpotWelderParameters serviceRecord={serviceRecord} />
          <SpotWelderTestData serviceRecord={serviceRecord} />
          <CertificateFooter notes={serviceRecord.notes} />
        </div>
      </div>
    </div>
  );
}