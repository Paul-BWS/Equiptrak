import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Printer, QrCode } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Add necessary print styles at the top
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
    top: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 15mm;
    overflow: visible;
    page-break-after: avoid;
    page-break-inside: avoid;
    border: none !important;
    box-shadow: none !important;
    outline: none !important;
  }
  
  .certificate-footer {
    position: fixed;
    bottom: 15mm;
    left: 15mm;
    right: 15mm;
    visibility: visible;
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
    max-width: 100% !important;
    height: auto !important;
  }
  
  .signature-image {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
}
`;

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
  
  // Legacy test fields
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
  
  // Legacy status fields
  safe_working_test_status?: string;
  emergency_stops_test_status?: string;
  limit_switches_test_status?: string;
  safety_devices_test_status?: string;
  hydraulic_system_test_status?: string;
  pressure_relief_test_status?: string;
  electrical_system_test_status?: string;
  platform_operation_test_status?: string;
  fail_safe_devices_test_status?: string;
  lifting_structure_test_status?: string;
  
  // New inspection fields
  load_test?: string;
  tension_suspension_rope?: string;
  tension_foundation_bolt?: string;
  tension_column_bolt?: string;
  tension_platform_bolt?: string;
  cable_pulley?: string;
  drive_belt_chains?: string;
  hydraulic_connections?: string;
  oil_levels?: string;
  guide_rollers?: string;
  wheel_free_systems?: string;
  limit_devices?: string;
  arm_locks?: string;
  safety_devices?: string;
  clean_safety_rods?: string;
  auto_chocks_fixed_stops?: string;
  anti_toe_chocks?: string;
  lift_markings_swl?: string;
  lifting_arms_pads?: string;
  air_safety_locks?: string;
  column_alignment?: string;
  electrical_check?: string;
  dead_man_controls?: string;
  guards_fixings?: string;
  main_screw_load_safety_nuts?: string;
  
  // Additional equipment details
  location?: string;
  installation_date?: string;
  manufacturer?: string;
  
  status?: string;
  public_access_token: string;
  company?: CompanyData;
  load_test_conducted?: boolean;
  equipment_out_of_action?: boolean;
}

export default function LiftCertificate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [record, setRecord] = useState<LiftServiceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const certificateRef = useRef<HTMLDivElement>(null);
  
  // Helper to get auth headers
  const getAuthHeaders = () => {
    const headers = {};
    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    return headers;
  };
  
  // Fetch the lift service record
  useEffect(() => {
    const fetchLiftServiceRecord = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/lift-service-records/${id}`, {
          headers: getAuthHeaders()
        });
        setRecord(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching lift service record:", err);
        setError("Could not load the certificate. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchLiftServiceRecord();
  }, [id]);
  
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
  
  // Handle QR code generation - simplified to avoid Promise return type issue
  const handlePrintQRCode = () => {
    if (!id) return;
    
    // Fetch the record and navigate to QR code page
    axios.get(`/api/lift-service-records/${id}`, {
      headers: getAuthHeaders()
    })
    .then((response) => {
      if (!response.data.public_access_token) {
        // TEMPORARY WORKAROUND: Generate a frontend-only token
        const tempToken = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        
        // Manually add the token to our local record
        const updatedRecord = { 
          ...response.data, 
          public_access_token: tempToken 
        };
        
        // Update the local state with our temporary token
        setRecord(updatedRecord);
        
        toast.success('QR Code generated (temporary token)');
        
        // Navigate to QR code page with state containing our temporary token
        navigate(`/lift-certificate/${id}/qr`, { 
          state: { tempRecord: updatedRecord }
        });
      } else {
        // Regular flow - navigate to QR code page
        navigate(`/lift-certificate/${id}/qr`);
      }
    })
    .catch((err) => {
      console.error('Error generating QR code:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Please try again.';
      toast.error('Failed to generate QR code: ' + errorMessage);
    });
  };
  
  // Handle printing directly with window.print()
  const handlePrint = () => {
    window.print();
  };
  
  // Handle back button
  const handleBack = () => {
    if (record?.company_id) {
      navigate(`/lift-service?companyId=${record.company_id}`);
    } else {
      // Try to get companyId from URL query parameters
      const params = new URLSearchParams(window.location.search);
      const companyId = params.get('companyId');
      if (companyId) {
        navigate(`/lift-service?companyId=${companyId}`);
      } else {
        navigate('/lift-service');
      }
    }
  };
  
  // Add helper functions to determine test status
  const getTestStatusText = (status: boolean | string | undefined) => {
    // First check if we have the new status format
    if (typeof status === 'string') {
      return status; // Return the actual status text (YES, OK, FAIL, REMEDIAL, NA)
    } 
    // Fall back to boolean for backward compatibility
    else if (typeof status === 'boolean') {
      return status ? "YES" : "NO";
    }
    
    // Default case
    return "N/A";
  };
  
  // Get style class based on test status
  const getTestStatusClass = (status: boolean | string | undefined) => {
    // Check for string format first
    if (typeof status === 'string') {
      switch(status.toUpperCase()) {
        case 'YES':
        case 'OK':
          return 'text-green-600';
        case 'NO':
        case 'FAIL':
          return 'text-red-600';
        case 'REMEDIAL':
          return 'text-orange-600';
        default:
          return 'text-gray-600';
      }
    }
    // Fall back to boolean
    else if (typeof status === 'boolean') {
      return status ? 'text-green-600' : 'text-red-600';
    }
    
    return 'text-gray-600';
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
            <Button 
              variant="outline" 
              onClick={() => {
                // Try to get companyId from URL if record isn't available
                const params = new URLSearchParams(window.location.search);
                const companyId = params.get('companyId');
                if (companyId) {
                  navigate(`/lift-service?companyId=${companyId}`);
                } else {
                  navigate('/lift-service');
                }
              }} 
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lift Services
            </Button>
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
            <Button variant="outline" onClick={handleBack} className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="font-semibold text-lg">
            Lift Service Certificate
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrintQRCode}>
              <QrCode className="h-4 w-4 mr-2" />
              Print QR
            </Button>
            <Button 
              onClick={handlePrint} 
              className="bg-[#21c15b] hover:bg-[#1ba34b] text-white"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Certificate
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-6 flex justify-center">
        {/* Add print styles */}
        <style type="text/css">
          {printStyles}
        </style>

        {/* Certificate - Page 1 ONLY - centered with max-width */}
        <div 
          ref={certificateRef} 
          className="certificate-content bg-white p-6 w-full max-w-4xl relative shadow-sm"
          style={{ border: 'none', boxShadow: 'none', outline: 'none' }}
        >
          {/* Header */}
          <div className="mb-4 pb-3 border-b">
            <div className="flex items-start">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 flex items-center justify-center">
                  <img src="/images/logo.png" alt="BWS Logo" className="max-w-full max-h-full" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Service and Inspection Report</h1>
                  <p className="text-xs text-gray-600">The Lifting Operations and Lifting Equipment Regulations 1998 Regulation 9/3</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center">
                <span className="font-bold mr-2 text-sm">Certificate Number:</span>
                <span className="font-medium text-sm">{record?.certificate_number || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <span className="font-bold mr-2 text-sm">Status:</span>
                <span className={`px-2 py-0.5 rounded text-sm font-medium ${
                  record?.status?.toLowerCase() === 'pass' || record?.status?.toLowerCase() === 'safe' 
                    ? 'bg-green-100 text-green-700' 
                    : record?.status?.toLowerCase() === 'remedial' 
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-700'
                }`}>
                  {record?.status?.toUpperCase() || "N/A"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Customer Info */}
          <div className="mb-4">
            <h2 className="text-base font-bold mb-2">Customer</h2>
            <p className="font-semibold text-sm">{record.company?.company_name || "N/A"}</p>
            <p className="text-sm">
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

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="font-semibold text-sm">Test Date</p>
              <p className="text-sm">{formatDate(record.service_date)}</p>
            </div>
            <div>
              <p className="font-semibold text-sm">Retest Date</p>
              <p className="text-sm">{formatDate(record.retest_date)}</p>
            </div>
            <div>
              <p className="font-semibold text-sm">Engineer</p>
              <p className="text-sm">{record.engineer_name || "N/A"}</p>
            </div>
          </div>
          
          {/* Equipment Details */}
          <div className="mb-4">
            <h2 className="text-base font-bold mb-2">Equipment Details</h2>
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border">
                  <td className="border p-2 bg-gray-50 font-semibold w-1/3 text-sm">Equipment Type</td>
                  <td className="border p-2 text-sm">{record.product_category || "N/A"}</td>
                </tr>
                <tr className="border">
                  <td className="border p-2 bg-gray-50 font-semibold text-sm">Model</td>
                  <td className="border p-2 text-sm">{record.model || "N/A"}</td>
                </tr>
                <tr className="border">
                  <td className="border p-2 bg-gray-50 font-semibold text-sm">Serial Number</td>
                  <td className="border p-2 text-sm">{record.serial_number || "N/A"}</td>
                </tr>
                <tr className="border">
                  <td className="border p-2 bg-gray-50 font-semibold text-sm">Safe Working Load</td>
                  <td className="border p-2 text-sm">{record.swl || "N/A"}</td>
                </tr>
                {record.location && (
                  <tr className="border">
                    <td className="border p-2 bg-gray-50 font-semibold text-sm">Location</td>
                    <td className="border p-2 text-sm">{record.location}</td>
                  </tr>
                )}
                {record.manufacturer && (
                  <tr className="border">
                    <td className="border p-2 bg-gray-50 font-semibold text-sm">Manufacturer</td>
                    <td className="border p-2 text-sm">{record.manufacturer}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Inspection Results */}
          <div className="mb-4">
            <h2 className="text-base font-bold mb-2">Inspection Results</h2>
            
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border">
                  <th className="border p-2 text-left text-sm font-semibold">Test</th>
                  <th className="border p-2 text-center w-24 text-sm font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {record.load_test && (
                  <tr className="border">
                    <td className="border p-2 text-sm">Load Test - tested with a vehicle</td>
                    <td className={`border p-2 text-center font-semibold text-sm ${getTestStatusClass(record.load_test)}`}>
                      {getTestStatusText(record.load_test)}
                    </td>
                  </tr>
                )}
                <tr className="border">
                  <td className="border p-2 text-sm">Equipment Out of Action</td>
                  <td className={`border p-2 text-center font-semibold text-sm ${record.equipment_out_of_action ? 'text-red-600' : 'text-green-600'}`}>
                    {record.equipment_out_of_action ? 'YES' : 'NO'}
                  </td>
                </tr>
                {record.tension_column_bolt && (
                  <tr className="border">
                    <td className="border p-2 text-sm">Tension Column Bolt - check</td>
                    <td className={`border p-2 text-center font-semibold text-sm ${getTestStatusClass(record.tension_column_bolt)}`}>
                      {getTestStatusText(record.tension_column_bolt)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Observations Section with Border */}
          <div className="mb-4">
            <h3 className="font-medium mb-2 text-sm">Observations / additional comments relative to this thorough examination</h3>
            <div className="border border-gray-300 p-2 min-h-[40px]">
              <p className="text-sm">{record.notes || "No additional notes"}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-700">
              The above equipment has been thoroughly inspected. To be legally compliant with The lifting Operations 
              and Lifting Equipment Regulations 1998 Regulation 9/3 and must be thoroughly examined at least every 
              12 months.
            </p>
          </div>
          
          {/* Footer with Signature and Company Info */}
          <div className="mt-auto pt-4 border-t">
            <div className="grid grid-cols-2">
              <div>
                <div>
                  <p className="text-sm font-medium mb-1">Signature</p>
                  <div className="h-16 border border-gray-200 flex items-center justify-center w-32">
                    <img 
                      src="/images/signature.png" 
                      alt="Signature" 
                      className="max-h-12 max-w-full signature-image" 
                      style={{ display: 'block', visibility: 'visible', opacity: 1 }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end justify-start">
                <div className="text-right">
                  <p className="font-medium text-sm">Basic Welding Service LTD</p>
                  <p className="text-sm">
                    232 Briscoe lane<br />
                    Manchester<br />
                    M40 2XG<br />
                    0161 223 1843
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}