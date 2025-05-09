import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, QrCode } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";

// Add improved print styles for better formatting
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

export default function ServiceCertificatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const companyIdParam = searchParams.get('companyId');

  // Helper function to get auth token
  const getAuthToken = () => {
    const storedUser = localStorage.getItem('equiptrak_user');
    if (!storedUser) return null;
    
    try {
      const userData = JSON.parse(storedUser);
      return userData.token || null;
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  };

  // Get the headers with authentication
  const getAuthHeaders = () => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  const { data: serviceRecord, isLoading, error } = useQuery({
    queryKey: ['serviceRecord', id],
    queryFn: async () => {
      console.log('Attempting to fetch service record with ID:', id);
      
      if (!id) {
        console.error('No id provided');
        throw new Error('No service ID provided');
      }

      try {
        // Fetch the service record from the API
        const response = await fetch(`/api/service-records/${id}`, {
          headers: getAuthHeaders(),
          credentials: 'include'
        });
        
        if (!response.ok) {
          console.error('API Error status:', response.status);
          let errorMessage = 'Failed to fetch service record';
          try {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            console.error('Could not parse error response', e);
          }
          throw new Error(errorMessage);
        }
        
        const serviceData = await response.json();
        console.log('Successfully fetched service record:', serviceData);
        
        // If we don't have company data yet, fetch the company details
        if (serviceData && serviceData.company_id && !serviceData.company) {
          console.log('Fetching company data for ID:', serviceData.company_id);
          const companyResponse = await fetch(`/api/companies/${serviceData.company_id}`, {
            headers: getAuthHeaders(),
            credentials: 'include'
          });
          
          if (companyResponse.ok) {
            const companyData = await companyResponse.json();
            console.log('Successfully fetched company data:', companyData);
            // Attach company data to the service record
            serviceData.company = companyData;
          } else {
            console.error('Failed to fetch company data');
          }
        }
        
        return serviceData;
      } catch (error) {
        console.error('Error fetching service record:', error);
        throw error;
      }
    },
    retry: 1,
    enabled: !!id,
  });

  const handlePrint = () => {
    // Create a dedicated print stylesheet that ensures only the certificate is printed
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = 'print-style-temp';
    
    // Use the improved print styles
    style.innerHTML = printStyles;
    
    document.head.appendChild(style);
    
    // Print the page (only certificate will be visible)
    window.print();
    
    // After printing, remove the temporary style
    document.head.removeChild(style);
  };

  const handleBack = () => {
    // First priority: use company ID from URL
    if (companyIdParam) {
      navigate(`/service?companyId=${companyIdParam}`);
    }
    // Second priority: use company ID from the service record
    else if (serviceRecord?.company_id) {
      navigate(`/service?companyId=${serviceRecord.company_id}`);
    } 
    // Fallback: go to the general service page
    else {
      navigate('/service');
    }
  };

  const handleQRCode = () => {
    navigate(`/service-certificate/${id}/qr`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      return isValid(date) ? format(date, 'd MMM yyyy') : 'N/A';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  // Process equipment items for display in certificate
  const processEquipmentItems = () => {
    if (!serviceRecord) return [];
    
    const items = [];
    
    // Process equipment items dynamically
    for (let i = 1; i <= 8; i++) {
      // Check both naming formats - DB format (equipment_name_${i}) and frontend format (equipment${i}_name)
      const dbNameField = `equipment_name_${i}`;
      const dbSerialField = `equipment_serial_${i}`;
      const frontendNameField = `equipment${i}_name`;
      const frontendSerialField = `equipment${i}_serial`;
      
      // Use the DB field names first, then try frontend field names as fallback
      const name = serviceRecord[dbNameField] || serviceRecord[frontendNameField];
      const serial = serviceRecord[dbSerialField] || serviceRecord[frontendSerialField];
      
      if (name) {
        items.push({
          type: name,
          serial: serial || 'N/A'
        });
      }
    }
    
    // Legacy fallback (keep as is)
    if (items.length === 0 && serviceRecord.equipment_type) {
      items.push({
        type: serviceRecord.equipment_type,
        serial: serviceRecord.serial_number || 'N/A'
      });
    }
    
    return items;
  };

  if (error) {
    console.error('Query error:', error);
    return (
      <div className="min-h-screen bg-[#f8f9fc]">
        <div className="border-b bg-white shadow-sm print:hidden">
          <div className="container mx-auto py-4 px-6 flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="outline"
                onClick={() => navigate('/admin')}
                className="mr-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Error</h1>
            </div>
          </div>
        </div>
        <div className="container mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h2 className="text-red-800 font-semibold">Error Loading Certificate</h2>
            <p className="text-red-600">{error.message}</p>
            <div className="mt-4">
              <Button variant="outline" onClick={() => navigate('/admin')}>
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc]">
        <div className="border-b bg-white shadow-sm print:hidden">
          <div className="container mx-auto py-4 px-6 flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="outline"
                onClick={() => navigate('/admin')}
                className="mr-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Service Certificate</h1>
            </div>
          </div>
        </div>
        <div className="container mx-auto py-12 text-center">Loading certificate...</div>
      </div>
    );
  }

  if (!serviceRecord) {
    return (
      <div className="min-h-screen bg-[#f8f9fc]">
        <div className="border-b bg-white shadow-sm print:hidden">
          <div className="container mx-auto py-4 px-6 flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="outline"
                onClick={() => navigate('/admin')}
                className="mr-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Service Certificate</h1>
            </div>
          </div>
        </div>
        <div className="container mx-auto py-12 text-center">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Service record not found</h2>
            <p className="mb-6">The requested service certificate could not be found.</p>
            <Button variant="outline" onClick={() => navigate('/admin')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get company details from serviceRecord
  const companyDetails = serviceRecord.company || {};
  const engineerName = serviceRecord.engineer_name || 'N/A';
  const certificateNumber = serviceRecord.certificate_number || `BWS-${id?.substring(0, 5)}`;
  const equipmentItems = processEquipmentItems();

  console.log('Rendering certificate with data:', {
    companyName: companyDetails.company_name || companyDetails.name,
    address: companyDetails.address,
    city: companyDetails.city,
    postcode: companyDetails.postcode,
    engineerName,
    equipment: equipmentItems
  });

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
            Service Certificate
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline"
              onClick={handleQRCode}
              className="flex items-center"
            >
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </Button>
            <Button 
              onClick={handlePrint}
              className="flex items-center"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </div>
      
      {/* Certificate Content - Centered, proper A4 size */}
      <div className="container mx-auto px-4 pb-16 max-w-[210mm]">
        <div className="certificate-content bg-white shadow-md rounded-md p-8 overflow-visible">
          {/* Certificate Header with Logo and Title */}
          <div className="flex items-start mb-4 pb-2 border-b">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 flex items-center justify-center bg-gray-800 p-2 rounded">
                <img 
                  src="/images/bws-logo.png" 
                  alt="BWS Logo" 
                  className="max-w-full max-h-full"
                  onError={(e) => {
                    console.log('Logo image failed to load, using fallback');
                    e.currentTarget.src = "/images/logo.png";
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">Service and Inspection Report</h1>
              </div>
            </div>
          </div>

          {/* Certificate Number and Status */}
          <div className="flex justify-between items-center pb-4 mb-4 border-b">
            <div>
              <span className="font-medium">Certificate Number:</span>
              <span className="ml-2">{certificateNumber}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-2">Status:</span>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-sm font-medium">
                PASS
              </div>
            </div>
          </div>
          
          {/* Customer Info */}
          <div className="mb-6 pb-4 border-b">
            <h2 className="text-lg font-bold mb-2">Customer</h2>
            <p className="font-medium">{companyDetails.company_name || "N/A"}</p>
            <p className="text-gray-800">
              {[
                companyDetails.address,
                companyDetails.city,
                companyDetails.postcode,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
          
          {/* Test Information - 3 columns */}
          <div className="grid grid-cols-3 gap-6 mb-6 pb-4 border-b">
            <div>
              <h3 className="font-medium mb-1">Test Date</h3>
              <p>{formatDate(serviceRecord.test_date || serviceRecord.service_date)}</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Retest Date</h3>
              <p>{formatDate(serviceRecord.retest_date)}</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Engineer</h3>
              <p>{engineerName}</p>
            </div>
          </div>
          
          {/* Equipment List */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">Equipment Details</h2>
            <table className="w-full certificate-table border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-center font-medium border">Equipment Type</th>
                  <th className="p-2 text-center font-medium border">Serial Number</th>
                </tr>
              </thead>
              <tbody>
                {/* Display available equipment items */}
                {equipmentItems.map((item, index) => (
                  <tr key={index}>
                    <td className="p-2 text-center border">{item.type}</td>
                    <td className="p-2 text-center border">{item.serial}</td>
                  </tr>
                ))}
                
                {/* Add empty rows to always have 6 rows total */}
                {Array.from({ length: Math.max(0, 6 - equipmentItems.length) }).map((_, index) => (
                  <tr key={`empty-${index}`}>
                    <td className="p-2 text-center border">-</td>
                    <td className="p-2 text-center border">-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Function Tested Section */}
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2">Function Tested</h2>
            <div className="p-3 border border-gray-200 rounded bg-gray-50 text-sm">
              <p className="mb-2">Electrical safety/Insulation. Voltage parameters and welding voltage insulation to earth.</p>
              <p className="mb-2">Insulation resistance checked according to IEE wiring regulations. Welding equipment tested according to BS 7570 (if applicable) and equipment manufacturers recommendations.</p>
              <p>Gas Gauges (If Applicable) have been inspected and tested in accordance with CP7 Gas Safety Regulations</p>
            </div>
          </div>
          
          {/* Notes / Observations */}
          {serviceRecord.notes && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2">Notes / Observations</h3>
              <div className="p-3 border border-gray-200 rounded min-h-[60px]">
                <p className="whitespace-pre-line">{serviceRecord.notes}</p>
              </div>
            </div>
          )}
          
          {/* Signature and Company Info at the bottom */}
          <div className="mt-auto pt-4 border-t flex justify-between items-start">
            <div>
              <p className="text-sm font-medium mb-1">Signature</p>
              <div className="w-32 h-14 flex items-center justify-center p-1">
                <img 
                  src="/images/signature.png" 
                  alt="Engineer Signature" 
                  className="max-h-12 max-w-full signature-image"
                  onError={(e) => {
                    console.log('Signature image failed to load, using fallback');
                  }}
                />
              </div>
            </div>
            
            <div className="text-right text-sm">
              <p className="font-medium">Basic Welding Service LTD</p>
              <p>232 Briscoe lane</p>
              <p>Manchester</p>
              <p>M40 2XG</p>
              <p>0161 223 1843</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}