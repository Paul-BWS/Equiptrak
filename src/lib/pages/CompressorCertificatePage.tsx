import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CertificateHeader } from "@/components/service/certificate/CertificateHeader";
import { CertificateCustomerInfo } from "@/components/service/certificate/CertificateCustomerInfo";
import { CertificateFooter } from "@/components/service/certificate/CertificateFooter";
import { PrintControls } from "@/components/service/certificate/layout/PrintControls";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface CompanyData {
  company_name: string;
  address: string;
  city: string;
  postcode: string;
}

interface CompressorRecordWithCompany {
  id: string;
  company_id: string;
  engineer_name: string;
  test_date: string;
  retest_date: string;
  status: string;
  certificate_number: string;
  notes?: string;
  equipment_name: string;
  equipment_serial: string;
  compressor_model: string;
  pressure_test_result: string | null;
  safety_valve_test: string | null;
  oil_level: string | null;
  belt_condition: string | null;
  created_at: string;
  company?: CompanyData;
}

export default function CompressorCertificatePage() {
  const { serviceId, customerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  console.log('CompressorCertificatePage - Initial Render');
  console.log('URL Parameters:', { serviceId, customerId });

  const { data: serviceRecord, isLoading } = useQuery({
    queryKey: ["compressor", serviceId],
    queryFn: async () => {
      if (!serviceId) {
        console.error('No serviceId provided');
        throw new Error('No service ID provided');
      }

      console.log('Starting Supabase query for compressor:', serviceId);
      
      // First, let's check if the record exists
      const { count, error: countError } = await supabase
        .from('compressor_records')
        .select('*', { count: 'exact', head: true })
        .eq('id', serviceId);

      if (countError) {
        console.error('Error checking record count:', countError);
        throw countError;
      }

      console.log('Record exists check:', { count });

      const { data, error } = await supabase
        .from('compressor_records')
        .select(`
          id,
          company_id,
          engineer_name,
          test_date,
          retest_date,
          status,
          certificate_number,
          notes,
          equipment_name,
          equipment_serial,
          compressor_model,
          pressure_test_result,
          safety_valve_test,
          oil_level,
          belt_condition,
          created_at,
          company:companies!inner(
            company_name,
            address,
            city,
            postcode
          )
        `)
        .eq('id', serviceId)
        .maybeSingle() as { data: CompressorRecordWithCompany | null, error: any };

      console.log('Query completed');
      console.log('Error:', error);
      console.log('Data:', data);

      if (error) {
        console.error('Supabase error details:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        toast({
          title: 'Error',
          description: 'Failed to load certificate',
          variant: 'destructive',
        });
        throw error;
      }

      if (!data) {
        console.error('No data found for compressor ID:', serviceId);
        console.error('Full query parameters:', {
          serviceId,
          customerId,
        });
        toast({
          title: 'Not found',
          description: 'Certificate not found',
          variant: 'destructive',
        });
        throw new Error('Certificate not found');
      }

      console.log('Successfully loaded compressor record:', data);
      return data;
    },
    enabled: !!serviceId,
    retry: false,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate(`/admin/customer/${customerId}/equipment/compressor`);
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
        equipmentName={serviceRecord.compressor_model}
        className="print:hidden sticky top-0 z-10 mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      />
      <div className="print:absolute print:inset-0 print:m-0 print:p-0 print:w-[210mm] print:h-[297mm] print:overflow-hidden">
        <div className="w-[210mm] h-[297mm] bg-white text-black p-[12mm] print:p-[12mm] mx-auto">
          <CertificateHeader 
            certificateNumber={serviceRecord.certificate_number} 
            title="Service Certificate"
          />

          <div className="grid grid-cols-2 gap-12 mb-12">
            <CertificateCustomerInfo
              companyName={serviceRecord.company?.company_name}
              address={serviceRecord.company?.address}
              city={serviceRecord.company?.city}
              postcode={serviceRecord.company?.postcode}
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
                <p className="mt-1">{serviceRecord.engineer_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Make</h3>
                  <p className="mt-1">{serviceRecord.compressor_model}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Serial Number</h3>
                  <p className="mt-1">{serviceRecord.equipment_serial}</p>
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
              <h2 className="text-xl font-semibold border-b pb-2">Test Results</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Pressure Test</h3>
                  <p className="mt-1">{serviceRecord.pressure_test_result || 'Not tested'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Safety Valve Test</h3>
                  <p className="mt-1">{serviceRecord.safety_valve_test || 'Not tested'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Oil Level</h3>
                  <p className="mt-1">{serviceRecord.oil_level || 'Not checked'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Belt Condition</h3>
                  <p className="mt-1">{serviceRecord.belt_condition || 'Not checked'}</p>
                </div>
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
  );
} 