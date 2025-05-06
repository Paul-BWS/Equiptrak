import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Add necessary print styles
const printStyles = `
@media print {
  body * {
    visibility: hidden;
  }
  
  .certificate-content, .certificate-content * {
    visibility: visible;
    overflow: visible !important;
  }
  
  .certificate-content {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    width: 210mm;
    height: auto;
    margin: 0 auto;
    padding: 20mm 15mm 10mm;
    font-size: 95%;
    overflow: visible;
    page-break-after: avoid;
    page-break-inside: avoid;
    border: none !important;
    box-shadow: none !important;
    outline: none !important;
  }
  
  @page {
    size: A4 portrait;
    margin: 0;
  }
  
  .print\\:hidden {
    display: none !important;
  }
  
  img {
    display: block !important;
    visibility: visible !important;
  }
  
  .signature-image {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  .certificate-table th, .certificate-table td {
    padding: 3px 6px;
    border: 1px solid #e5e7eb;
  }
  
  .certificate-table th {
    background-color: #f9fafb;
    font-weight: 500;
  }
}
`;

interface SpotWelderRecord {
  id: string;
  certificate_number: string;
  service_date: string;
  retest_date: string;
  status: string;
  model: string;
  serial_number: string;
  engineer_name: string;
  equipment_type: string;
  sent_on: string;
  voltage_max: string;
  voltage_min: string;
  air_pressure: string;
  tip_pressure: string;
  length: string;
  diameter: string;
  machine: string;
  meter: string;
  machine_time: string;
  meter_time: string;
  notes: string;
  company_id: string;
  company?: {
    company_name?: string;
    address?: string;
    city?: string;
    postcode?: string;
  };
}

export default function SpotWelderCertificatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [record, setRecord] = useState<SpotWelderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const headers = {};
    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    return headers;
  };

  // Function to refresh the record data
  const refreshRecord = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/spot-welders/${id}`, {
        headers: getAuthHeaders()
      });
      
      // If we don't have company data, fetch it
      if (response.data.company_id && !response.data.company) {
        try {
          const companyResponse = await axios.get(`/api/companies/${response.data.company_id}`, {
            headers: getAuthHeaders()
          });
          response.data.company = companyResponse.data;
        } catch (err) {
          console.error('Error fetching company data:', err);
        }
      }
      
      setRecord(response.data);
    } catch (err) {
      console.error('Error fetching spot welder record:', err);
      setError('Failed to load spot welder record. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to call the refresh function
  useEffect(() => {
    refreshRecord();
  }, [id, user]);

  const handleBack = () => {
    navigate(`/spot-welders?companyId=${record?.company_id}`);
  };

  const handlePrint = () => {
    // Create a dedicated print stylesheet to format the certificate
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = 'print-style-temp';
    style.innerHTML = printStyles;
    
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "d MMM yyyy");
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Spot Welder Certificate</h1>
        </div>
        <div className="text-center py-8">Loading spot welder record...</div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Spot Welder Certificate</h1>
        </div>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-red-600">{error || "Record not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Full-width header */}
      <div className="w-full bg-white shadow-sm print:hidden mb-6">
        <div className="max-w-[95%] mx-auto py-3 flex justify-between items-center">
          <div>
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="font-semibold text-lg">
            Spot Welder Certificate
          </div>
          
          <div>
            <Button 
              onClick={handlePrint}
              className="bg-[#21c15b] hover:bg-[#1ba34b] text-white"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header with controls - hidden when printing */}
        <style type="text/css">
          {printStyles}
        </style>

        <Card className="print:shadow-none">
          <CardContent className="p-6 certificate-content flex flex-col">
            {/* Logo and title */}
            <div className="mb-8 relative">
              <div className="w-14 h-14 absolute left-0 top-0">
                <img src="/images/logo.png" alt="BWS Logo" className="max-w-full max-h-full" />
              </div>
              <h1 className="text-2xl font-bold text-center">Spot Welder Test Certificate</h1>
            </div>
            
            {/* Separator line below title */}
            <div className="border-t w-full mb-5 mt-1"></div>

            {/* Main Content - Two Columns */}
            <div className="grid grid-cols-2 gap-x-8 mb-5">
              {/* Customer Information - Left Column */}
              <div>
                <div className="text-gray-500 mb-1">Customer</div>
                <div className="mb-2">
                  <p className="font-medium">{record.company?.company_name || "Acme Company"}</p>
                  <p>{record.company?.address || "10 Greenside Gardens"}</p>
                  <p>{record.company?.city || "Manchester"}</p>
                  <p>{record.company?.postcode || "HX62UP"}</p>
                </div>
              </div>

              {/* Machine Information - Right Column */}
              <div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div className="text-gray-500">Certificate Number</div>
                  <div>{record.certificate_number || "SW-0000"}</div>
                  
                  <div className="text-gray-500">Machine Model</div>
                  <div>{record.model || "N/A"}</div>
                  
                  <div className="text-gray-500">Serial No</div>
                  <div>{record.serial_number || "N/A"}</div>
                  
                  <div className="text-gray-500">Service Date</div>
                  <div>{formatDate(record.service_date) || "30 Apr 2025"}</div>
                  
                  <div className="text-gray-500">Retest Date</div>
                  <div>{formatDate(record.retest_date) || "29 Apr 2026"}</div>
                </div>
              </div>
            </div>
            
            {/* Separator line after customer/machine info */}
            <div className="border-t w-full mb-5 mt-1"></div>
            
            {/* Measurement Parameters */}
            <div className="grid grid-cols-5 gap-x-2 mb-5">
              <div>
                <div className="text-gray-500 mb-1">Pressure</div>
                <div>{record.tip_pressure || "500"}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Tip Diameter</div>
                <div>{record.diameter || "13"}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Arm length</div>
                <div>{record.length || "200"}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Volts Max</div>
                <div>{record.voltage_max || "417"}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Volts Min</div>
                <div>{record.voltage_min || "399"}</div>
              </div>
            </div>

            {/* Machine Test Details */}
            <div className="mb-5">
              <div className="text-gray-500 mb-3">Machine Test Details</div>
              <table className="w-full certificate-table border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-1 border">Machine Amps</th>
                    <th className="text-left p-1 border">Meter Amps</th>
                    <th className="text-left p-1 border">Machine Time</th>
                    <th className="text-left p-1 border">Meter Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-1 border">{record.machine || "N/A"}</td>
                    <td className="p-1 border">{record.meter || "N/A"}</td>
                    <td className="p-1 border">{record.machine_time || "N/A"}</td>
                    <td className="p-1 border">{record.meter_time || "N/A"}</td>
                  </tr>
                  {/* Add placeholder rows for consistency with the image */}
                  <tr>
                    <td className="p-1 border">&nbsp;</td>
                    <td className="p-1 border">&nbsp;</td>
                    <td className="p-1 border">&nbsp;</td>
                    <td className="p-1 border">&nbsp;</td>
                  </tr>
                  <tr>
                    <td className="p-1 border">&nbsp;</td>
                    <td className="p-1 border">&nbsp;</td>
                    <td className="p-1 border">&nbsp;</td>
                    <td className="p-1 border">&nbsp;</td>
                  </tr>
                  <tr>
                    <td className="p-1 border">&nbsp;</td>
                    <td className="p-1 border">&nbsp;</td>
                    <td className="p-1 border">&nbsp;</td>
                    <td className="p-1 border">&nbsp;</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Details Section */}
            <div className="mb-6">
              <div className="text-gray-500 mb-1">Details</div>
              <p className="text-sm">The above readings were produced Using calibrated Voltage, Current and pressure test equipment according to BS EN IEC 60974-14:2018 Calibration and validation of welding equipment. Periodic inspection and electrical safety testing was also tested in accordance with BS EN 60974-4:2016</p>
            </div>

            {/* Traceability Section */}
            {/* Notes Section - Only show if there are notes */}
            {record.notes && (
              <div className="mb-5">
                <div className="text-gray-500 mb-1">Notes</div>
                <p className="text-sm whitespace-pre-wrap">{record.notes}</p>
              </div>
            )}
            
            {/* Signature and Details */}
            <div className="grid grid-cols-2 gap-6 mt-6 pt-4 border-t">
              <div>
                <div className="mb-3">
                  <div className="text-gray-500 mb-1">Signature</div>
                  <div className="h-12 flex items-center">
                    <img 
                      src="/images/signature.png" 
                      alt="Signature" 
                      className="max-h-12 max-w-full signature-image" 
                      style={{ display: 'block', visibility: 'visible', opacity: 1 }}
                    />
                  </div>
                </div>
                <div className="text-sm">
                  <div className="grid grid-cols-2 gap-y-1">
                    <div className="text-gray-500">Inspector</div>
                    <div>{record.engineer_name || "Paul Jones"}</div>
                  </div>
                </div>
              </div>
              
              <div className="text-right text-sm">
                <div className="text-gray-500 mb-1">Inspection Authority</div>
                <p className="font-medium">Basic Welding Service LTD</p>
                <p>232 Briscoe lane</p>
                <p>Manchester</p>
                <p>M40 2XG</p>
                <p>0161 223 1843</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}