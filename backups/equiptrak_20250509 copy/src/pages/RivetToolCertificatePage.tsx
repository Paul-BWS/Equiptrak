import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CertificateHeader } from '@/components/service/certificate/CertificateHeader';
import { CertificateCustomerInfo } from '@/components/service/certificate/CertificateCustomerInfo';
import { RivetToolServiceInfo } from '@/components/rivet-tool/certificate/RivetToolServiceInfo';
import { PrintControls } from '@/components/service/certificate/layout/PrintControls';
import { CertificateFooter } from '@/components/service/certificate/CertificateFooter';
import { useEffect } from 'react';

export default function RivetToolCertificatePage() {
  const { serviceId, customerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: serviceRecord, isLoading } = useQuery({
    queryKey: ['rivetToolServiceRecord', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rivet_tool_service_records')
        .select(`
          *,
          engineers (
            name
          ),
          equipment (
            name,
            serial_number,
            customer_id,
            profiles (
              company_name,
              email,
              address,
              city,
              postcode
            )
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

      return data;
    },
  });

  // Update document title when certificate number is available
  useEffect(() => {
    if (serviceRecord?.certificate_number) {
      document.title = `Certificate ${serviceRecord.certificate_number}`;
    }
    return () => {
      document.title = 'EquipTrak';
    };
  }, [serviceRecord?.certificate_number]);

  const handleBack = () => {
    navigate(`/admin/customer/${customerId}/equipment/rivet-tools`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div>Loading certificate...</div>;
  }

  if (!serviceRecord) {
    return <div>Certificate not found</div>;
  }

  const getMachineSetting = (num: number): string => {
    const value = serviceRecord[`machine_setting_${num}` as keyof typeof serviceRecord];
    return typeof value === 'number' ? value.toString() : '-';
  };

  const getActualReading = (num: number): string => {
    const value = serviceRecord[`actual_reading_${num}` as keyof typeof serviceRecord];
    return typeof value === 'number' ? value.toString() : '-';
  };

  return (
    <div className="min-h-screen print:min-h-0 print:h-auto print:bg-white bg-background">
      <PrintControls 
        onBack={handleBack}
        onPrint={handlePrint}
        customerEmail={serviceRecord.equipment?.profiles?.email}
        certificateNumber={serviceRecord.certificate_number}
        customerName={serviceRecord.equipment?.profiles?.company_name}
        equipmentName={serviceRecord.equipment?.name}
        className="print:hidden sticky top-0 z-10 mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      />
      <div className="print:absolute print:inset-0 print:m-0 print:p-0 print:w-[210mm] print:h-[297mm] print:overflow-hidden">
        <div className="w-[210mm] h-[297mm] bg-white text-black p-[12mm] print:p-[12mm] mx-auto">
          <CertificateHeader certificateNumber={serviceRecord.certificate_number} />

          <div className="grid grid-cols-2 gap-8 mb-8 mt-6">
            <CertificateCustomerInfo
              companyName={serviceRecord.equipment?.profiles?.company_name}
              address={serviceRecord.equipment?.profiles?.address}
              city={serviceRecord.equipment?.profiles?.city}
              postcode={serviceRecord.equipment?.profiles?.postcode}
            />
            <RivetToolServiceInfo
              testDate={serviceRecord.test_date}
              retestDate={serviceRecord.retest_date}
              engineerName={serviceRecord.engineers?.name}
              equipmentName={serviceRecord.equipment?.name}
              serialNumber={serviceRecord.equipment?.serial_number}
            />
          </div>

          {/* Machine Settings and Actual Readings */}
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Machine Settings (kN)</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="p-3 bg-gray-50 print:bg-white rounded-lg">
                      <p className="text-sm text-gray-600">Setting {num}</p>
                      <p className="font-medium">{getMachineSetting(num)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Actual Readings (kN)</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="p-3 bg-gray-50 print:bg-white rounded-lg">
                      <p className="text-sm text-gray-600">Reading {num}</p>
                      <p className="font-medium">{getActualReading(num)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Function Tested and Test Method Sections */}
          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-blue-600 mb-2">Function Tested</h2>
              <p className="text-sm leading-relaxed text-gray-600">
                Checked pressure activation button is working correctly. Seals and oil chambers checked for leaks.
                Maintenance carried out to manufacturers specification. Anvils, plunger & gun operationally tested.
                Squeeze pressures validated for repeatability using specialised squeeze test meters.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-blue-600 mb-2">Test Method</h2>
              <p className="text-sm leading-relaxed text-gray-600">
                I/We hereby certify that the above equipment has been tested/inspected in accordance with manufacturer specifications and according to BS 10125 requirements.
              </p>
            </div>
          </div>

          <CertificateFooter notes={serviceRecord.notes} />
        </div>
      </div>
    </div>
  );
}