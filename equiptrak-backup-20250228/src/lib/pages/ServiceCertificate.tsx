import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CertificateHeader } from '@/components/service/certificate/CertificateHeader';
import { CertificateCustomerInfo } from '@/components/service/certificate/CertificateCustomerInfo';
import { CertificateFooter } from '@/components/service/certificate/CertificateFooter';
import { PrintControls } from '@/components/service/certificate/layout/PrintControls';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CertificateEquipment } from '@/components/service/certificate/CertificateEquipment';

export default function ServiceCertificate() {
  const { serviceId, customerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: serviceRecord, isLoading } = useQuery({
    queryKey: ['serviceRecord', serviceId],
    queryFn: async () => {
      if (!serviceId) {
        throw new Error('No service ID provided');
      }

      console.log('Fetching service record:', serviceId);
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
        console.error('Error fetching service record:', error);
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

      console.log('Service record:', data);
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
    navigate(`/admin/customer/${customerId}/service`);
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
        customerName={serviceRecord.company?.company_name}
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
            <div>
              <h2 className="text-lg font-semibold text-blue-600 mb-4">Service Information</h2>
              <div className="space-y-2">
                <div className="grid grid-cols-2">
                  <span className="font-medium">Test Date:</span>
                  <span>{new Date(serviceRecord.test_date).toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-medium">Retest Date:</span>
                  <span>{new Date(serviceRecord.retest_date).toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-medium">Engineer:</span>
                  <span>{serviceRecord.engineer_name}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">Equipment</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 font-semibold">Equipment Type</th>
                  <th className="text-right py-2 font-semibold">Serial Number</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6].map(i => {
                  const nameField = `equipment${i}_name`;
                  const serialField = `equipment${i}_serial`;
                  
                  if (serviceRecord[nameField]) {
                    return (
                      <tr key={i} className="border-b border-gray-300">
                        <td className="py-2">{serviceRecord[nameField]}</td>
                        <td className="py-2 text-right">{serviceRecord[serialField]}</td>
                      </tr>
                    );
                  }
                  return null;
                })}
              </tbody>
            </table>
          </div>

          <CertificateFooter notes={serviceRecord.notes || "Equipment has been tested in accordance with the Electricity at Work Regulations 1989 and is safe for use until the retest date shown."} />
        </div>
      </div>
    </div>
  );
} 