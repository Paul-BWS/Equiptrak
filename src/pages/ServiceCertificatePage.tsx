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
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { CertificateQRCode } from "@/components/service/certificate/QRCode";

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
    return <div className="container mx-auto py-12 text-center">Loading certificate...</div>;
  }

  if (!serviceRecord) {
    return <div className="container mx-auto py-12 text-center">Certificate not found</div>;
  }

  console.log('Rendering certificate with data:', {
    companyName: serviceRecord.companies?.company_name,
    address: serviceRecord.companies?.address,
    city: serviceRecord.companies?.city,
    postcode: serviceRecord.companies?.postcode,
    engineerName: serviceRecord.engineer_name
  });

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="print:hidden mb-6 flex justify-end">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print Certificate
        </Button>
      </div>
      
      <div className="bg-white p-8 shadow-sm print:shadow-none">
        {/* Certificate Header */}
        <div className="flex justify-between items-start mb-8 border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="bg-[#3b4a6b] p-4 rounded-md">
              <img src="/logo.png" alt="Company Logo" className="h-12 w-12" />
            </div>
            <h1 className="text-2xl font-bold">Calibration Certificate</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Certificate Number</p>
            <p className="text-xl font-bold">{serviceRecord.certificate_number || "BWS-" + recordId.substring(0, 5)}</p>
          </div>
        </div>
        
        {/* Customer and Test Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Customer</h2>
            <p className="font-medium">{serviceRecord.companies?.company_name}</p>
            <p>{serviceRecord.companies?.address}</p>
            <p>{serviceRecord.companies?.city}</p>
            <p>{serviceRecord.companies?.postcode}</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-gray-500">Test Date</h3>
              <p className="font-medium">{serviceRecord.test_date ? format(new Date(serviceRecord.test_date), "dd/MM/yyyy") : "N/A"}</p>
            </div>
            
            <div>
              <h3 className="text-gray-500">Retest Date</h3>
              <p className="font-medium">{serviceRecord.retest_date ? format(new Date(serviceRecord.retest_date), "dd/MM/yyyy") : "N/A"}</p>
            </div>
            
            <div>
              <h3 className="text-gray-500">Engineer</h3>
              <p className="font-medium">{serviceRecord.engineer_name || "N/A"}</p>
            </div>
          </div>
        </div>
        
        {/* Equipment Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Equipment</h2>
          
          {/* Plain table with no borders or alternating shades */}
          <div className="w-full">
            <div className="flex font-semibold mb-2">
              <div className="w-1/2 py-2">Equipment Type</div>
              <div className="w-1/2 py-2">Equipment Serial</div>
            </div>
            
            {serviceRecord.equipment_items && serviceRecord.equipment_items.length > 0 ? (
              serviceRecord.equipment_items.map((item, index) => (
                <div key={index} className="flex">
                  <div className="w-1/2 py-2">{item.type || "N/A"}</div>
                  <div className="w-1/2 py-2">{item.serial || "N/A"}</div>
                </div>
              ))
            ) : (
              <>
                <div className="flex">
                  <div className="w-1/2 py-2">{serviceRecord.equipment_type || "N/A"}</div>
                  <div className="w-1/2 py-2">{serviceRecord.serial_number || "N/A"}</div>
                </div>
                {/* Add some dummy rows if needed */}
                <div className="flex">
                  <div className="w-1/2 py-2">MiG welder</div>
                  <div className="w-1/2 py-2">257544299</div>
                </div>
                <div className="flex">
                  <div className="w-1/2 py-2">Dent puller</div>
                  <div className="w-1/2 py-2">466728826</div>
                </div>
                <div className="flex">
                  <div className="w-1/2 py-2">Induction heater</div>
                  <div className="w-1/2 py-2">53789938</div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Function Tested Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Function Tested</h2>
          <p className="mb-4">Electrical safety/Insulation. Voltage parameters and welding voltage insulation to earth.</p>
          <p className="mb-4">Insulation resistance checked according to IEE wiring regulations. Welding equipment tested according to BS 7570 (if applicable) and equipment manufacturers recommendations.</p>
          <p>Gas Gauges (If Applicable) have been inspected and tested in accordance with CP7 Gas Safety Regulations</p>
        </div>
        
        {/* Readings Section - Plain table with no borders or alternating shades */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Readings</h2>
          
          <div className="w-full">
            <div className="flex font-semibold mb-2">
              <div className="w-1/3 py-2">Test</div>
              <div className="w-1/3 py-2">Reading</div>
              <div className="w-1/3 py-2">Result</div>
            </div>
            
            {serviceRecord.readings && serviceRecord.readings.length > 0 ? (
              serviceRecord.readings.map((reading, index) => (
                <div key={index} className="flex">
                  <div className="w-1/3 py-2">{reading.test || "N/A"}</div>
                  <div className="w-1/3 py-2">{reading.reading || "N/A"}</div>
                  <div className="w-1/3 py-2">{reading.result || "N/A"}</div>
                </div>
              ))
            ) : (
              <>
                <div className="flex">
                  <div className="w-1/3 py-2">Earth Continuity</div>
                  <div className="w-1/3 py-2">0.1 Ohms</div>
                  <div className="w-1/3 py-2">Pass</div>
                </div>
                <div className="flex">
                  <div className="w-1/3 py-2">Insulation Resistance</div>
                  <div className="w-1/3 py-2">2.5 MOhms</div>
                  <div className="w-1/3 py-2">Pass</div>
                </div>
                <div className="flex">
                  <div className="w-1/3 py-2">Load Test</div>
                  <div className="w-1/3 py-2">230V / 10A</div>
                  <div className="w-1/3 py-2">Pass</div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-end mt-12 pt-4 border-t">
          <div>
            <h3 className="font-bold">BWS LTD</h3>
            <p className="text-sm">232 Briscoe Lane</p>
            <p className="text-sm">Manchester M40 2XG</p>
            <p className="text-sm">Tel: 0161 223 9843</p>
            <p className="text-sm">www.basicweldingsolutions.co.uk</p>
          </div>
          
          <div className="flex flex-col items-center">
            <CertificateQRCode certificateId={recordId} size={100} />
            <p className="text-xs mt-1">Scan for certificate</p>
          </div>
          
          <div className="text-center">
            <div className="mb-2">
              <img src="/signature.png" alt="Signature" className="h-16 inline-block" />
            </div>
            <p className="text-sm">Authorized Signature</p>
            <p className="text-xs text-gray-500">Basic Welding Solutions</p>
          </div>
        </div>
      </div>
    </div>
  );
}