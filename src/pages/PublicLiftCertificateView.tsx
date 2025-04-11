import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface CompanyData {
  id: string;
  company_name: string;
  address: string;
  city: string;
  county: string;
  postcode: string;
  phone_number: string;
  email: string;
}

interface LiftServiceRecord {
  id: string;
  company_id: string;
  certificate_number: string;
  product_category: string;
  model: string;
  serial_number: string;
  service_date: string;
  retest_date: string;
  swl: string;
  engineer_name: string;
  engineer_signature: string;
  notes: string;
  safe_working_test: boolean;
  emergency_stops_test: boolean;
  limit_switches_test: boolean;
  safety_devices_test: boolean;
  hydraulic_system_test: boolean;
  pressure_relief_test: boolean;
  electrical_system_test: boolean;
  platform_operation_test: boolean;
  fail_safe_devices_test: boolean;
  lifting_structure_test: boolean;
  company?: CompanyData;
}

export default function PublicLiftCertificateView() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [record, setRecord] = useState<LiftServiceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const certificateRef = useRef<HTMLDivElement>(null);
  
  // Fetch the lift service record
  useEffect(() => {
    const fetchLiftServiceRecord = async () => {
      try {
        if (!id || !token) {
          setError("Invalid certificate URL. Missing ID or token.");
          setLoading(false);
          return;
        }
        
        // Check if this is a temporary token (our workaround)
        if (token.startsWith('temp_')) {
          // For temporary tokens, create a mock display record instead of calling the API
          // This will allow the QR code to display something useful for testing
          setRecord({
            id: id || '',
            company_id: '',
            certificate_number: 'TEMP-CERTIFICATE',
            product_category: 'Temporary Test Certificate',
            model: 'Test Model',
            serial_number: 'TEST-123',
            service_date: new Date().toISOString(),
            retest_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            swl: '1000kg',
            engineer_name: 'Test Engineer',
            engineer_signature: '',
            notes: 'This is a temporary test certificate created for QR code testing purposes. No actual inspection was performed. This certificate is not valid for compliance purposes.',
            safe_working_test: true,
            emergency_stops_test: true,
            limit_switches_test: true,
            safety_devices_test: true,
            hydraulic_system_test: true,
            pressure_relief_test: true,
            electrical_system_test: true,
            platform_operation_test: true,
            fail_safe_devices_test: true,
            lifting_structure_test: true,
            company: {
              id: '',
              company_name: 'Test Company',
              address: '123 Test Street',
              city: 'Test City',
              county: 'Test County',
              postcode: 'TE1 1ST',
              phone_number: '01234567890',
              email: 'test@example.com'
            }
          });
          setLoading(false);
          return;
        }
        
        // Regular flow - call the API for real tokens
        setLoading(true);
        const response = await axios.get(`/api/public/lift-service-certificate/${id}?token=${token}`);
        setRecord(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching lift service record:", err);
        setError("Could not load the certificate. Please check the URL and try again.");
        setLoading(false);
      }
    };
    
    fetchLiftServiceRecord();
  }, [id, token]);
  
  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };
  
  // Handle printing
  const handlePrint = () => {
    window.print();
  };
  
  // Check if a test passed
  const getStatusText = (passed: boolean | undefined) => {
    return passed ? "PASS" : "FAIL";
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error || !record) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error || "Certificate not found"}</p>
            <p className="mt-4 text-sm text-gray-600">
              This certificate may have expired or the URL may be incorrect. 
              Please contact the issuing company for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Controls */}
      <div className="flex justify-end items-center mb-6 print:hidden">
        <Button 
          onClick={handlePrint} 
          className="bg-[#a6e15a] hover:bg-[#95cc4f] text-white"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Certificate
        </Button>
      </div>
      
      {/* Certificate */}
      <div ref={certificateRef} className="bg-white p-8 border rounded-lg shadow-sm print:shadow-none print:border-none">
        {/* Certificate Header */}
        <div className="flex justify-between border-b pb-4 mb-6">
          <div className="flex items-center">
            <div className="mr-3">
              <img src="/images/logo.png" alt="BWS Logo" className="h-16" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Installation Certificate</h1>
              <p className="text-gray-600">Thorough Examination Report</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="font-bold">Certificate Number</p>
            <p className="text-xl font-bold">{record.certificate_number || "N/A"}</p>
          </div>
        </div>
        
        {/* Customer Info */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Customer</h2>
          <div>
            <p className="font-semibold">{record.company?.company_name || "N/A"}</p>
            <p>
              {[
                record.company?.address,
                record.company?.city,
                record.company?.county,
                record.company?.postcode,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        </div>

        <div className="flex justify-between mb-6">
          <div>
            <p className="font-semibold">Test Date</p>
            <p>{formatDate(record.service_date)}</p>
          </div>
          <div>
            <p className="font-semibold">Retest Date</p>
            <p>{formatDate(record.retest_date)}</p>
          </div>
          <div>
            <p className="font-semibold">Engineer</p>
            <p>{record.engineer_name || "N/A"}</p>
          </div>
        </div>
        
        {/* Equipment Details */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Equipment</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">EQUIPMENT TYPE</th>
                <th className="border p-2 text-left">SERIAL NUMBER</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">{record.product_category || "N/A"}</td>
                <td className="border p-2">{record.serial_number || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Test Results */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Inspection Results</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Test</th>
                <th className="border p-2 text-center w-24">Result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Safe Working Load Test</td>
                <td className={`border p-2 text-center font-semibold ${record.safe_working_test ? 'text-green-600' : 'text-red-600'}`}>
                  {getStatusText(record.safe_working_test)}
                </td>
              </tr>
              <tr>
                <td className="border p-2">Emergency Stops</td>
                <td className={`border p-2 text-center font-semibold ${record.emergency_stops_test ? 'text-green-600' : 'text-red-600'}`}>
                  {getStatusText(record.emergency_stops_test)}
                </td>
              </tr>
              <tr>
                <td className="border p-2">Limit Switches</td>
                <td className={`border p-2 text-center font-semibold ${record.limit_switches_test ? 'text-green-600' : 'text-red-600'}`}>
                  {getStatusText(record.limit_switches_test)}
                </td>
              </tr>
              <tr>
                <td className="border p-2">Safety Devices</td>
                <td className={`border p-2 text-center font-semibold ${record.safety_devices_test ? 'text-green-600' : 'text-red-600'}`}>
                  {getStatusText(record.safety_devices_test)}
                </td>
              </tr>
              <tr>
                <td className="border p-2">Hydraulic System</td>
                <td className={`border p-2 text-center font-semibold ${record.hydraulic_system_test ? 'text-green-600' : 'text-red-600'}`}>
                  {getStatusText(record.hydraulic_system_test)}
                </td>
              </tr>
              <tr>
                <td className="border p-2">Pressure Relief Valves</td>
                <td className={`border p-2 text-center font-semibold ${record.pressure_relief_test ? 'text-green-600' : 'text-red-600'}`}>
                  {getStatusText(record.pressure_relief_test)}
                </td>
              </tr>
              <tr>
                <td className="border p-2">Electrical System</td>
                <td className={`border p-2 text-center font-semibold ${record.electrical_system_test ? 'text-green-600' : 'text-red-600'}`}>
                  {getStatusText(record.electrical_system_test)}
                </td>
              </tr>
              <tr>
                <td className="border p-2">Platform Operation</td>
                <td className={`border p-2 text-center font-semibold ${record.platform_operation_test ? 'text-green-600' : 'text-red-600'}`}>
                  {getStatusText(record.platform_operation_test)}
                </td>
              </tr>
              <tr>
                <td className="border p-2">Fail-Safe Devices</td>
                <td className={`border p-2 text-center font-semibold ${record.fail_safe_devices_test ? 'text-green-600' : 'text-red-600'}`}>
                  {getStatusText(record.fail_safe_devices_test)}
                </td>
              </tr>
              <tr>
                <td className="border p-2">Lifting Structure</td>
                <td className={`border p-2 text-center font-semibold ${record.lifting_structure_test ? 'text-green-600' : 'text-red-600'}`}>
                  {getStatusText(record.lifting_structure_test)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Add Notes section if it doesn't exist */}
        {record.notes && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Function Tested</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700 whitespace-pre-line">{record.notes}</p>
            </div>
          </div>
        )}
        
        {/* Certificate Footer */}
        <div className="mt-10 pt-6 border-t">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-lg font-semibold mb-2">Signature</p>
              <div className="mb-4">
                {record.engineer_signature ? (
                  <img 
                    src={record.engineer_signature} 
                    alt="Engineer Signature" 
                    className="h-16 mb-1" 
                  />
                ) : (
                  <img 
                    src="/images/signature.png" 
                    alt="Engineer Signature" 
                    className="h-16 mb-1" 
                  />
                )}
                <p>{record.engineer_name || "N/A"}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-semibold">{record.company?.company_name || "BWS Ltd"}</p>
              <p>232 Briscoe Lane, Manchester</p>
              <p>M40 2XG</p>
              <p>Tel: 0161 223 1843</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 