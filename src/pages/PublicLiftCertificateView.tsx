import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Forklift, Printer } from "lucide-react";
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
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div className="flex items-center">
            <Forklift className="h-10 w-10 text-[#7b96d4] mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lift Service Certificate</h1>
              <p className="text-gray-600">Certificate No: {record.certificate_number || "N/A"}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="font-semibold">Service Date: {formatDate(record.service_date)}</p>
            <p className="text-gray-600">Next Service Due: {formatDate(record.retest_date)}</p>
          </div>
        </div>
        
        {/* Company Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Customer Information</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="font-semibold text-gray-900">{record.company?.company_name || "N/A"}</p>
            <p className="text-gray-600">
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
        
        {/* Equipment Details */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Equipment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Lift Type:</p>
              <p className="font-semibold">{record.product_category || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-600">Model:</p>
              <p className="font-semibold">{record.model || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-600">Serial Number:</p>
              <p className="font-semibold">{record.serial_number || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-600">Safe Working Load (SWL):</p>
              <p className="font-semibold">{record.swl || "N/A"}</p>
            </div>
          </div>
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
        
        {/* Notes */}
        {record.notes && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Additional Notes</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700 whitespace-pre-line">{record.notes}</p>
            </div>
          </div>
        )}
        
        {/* Certificate Footer */}
        <div className="mt-10 pt-6 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Engineer:</p>
              <p className="font-semibold">{record.engineer_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-600">Signature:</p>
              <p className="font-semibold">{record.engineer_signature || "(Electronic Signature)"}</p>
            </div>
          </div>
          <div className="mt-6 text-center text-gray-500 text-sm">
            <p>This certificate was generated electronically and is valid without a physical signature.</p>
            <p>This is an official record of the lift service inspection conducted on the date shown above.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 