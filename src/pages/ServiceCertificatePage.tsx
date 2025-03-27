import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, QrCode } from "lucide-react";
import { format } from "date-fns";

export default function ServiceCertificatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

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
    
    // This CSS hides everything except the certificate content
    style.innerHTML = `
      @media print {
        @page {
          size: A4 portrait;
          margin: 0;
        }
        
        body * {
          visibility: hidden;
        }
        
        .certificate-print-content, .certificate-print-content * {
          visibility: visible;
        }
        
        .certificate-print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 210mm;
          height: 297mm;
          padding: 10mm;
          margin: 0;
          box-sizing: border-box;
          font-size: 10pt;
          background-color: white !important;
        }
        
        /* Force colors to print */
        .certificate-print-content * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Ensure all content fits */
        .certificate-print-content .mb-10 {
          margin-bottom: 1.5rem !important;
        }
        
        .certificate-print-content table {
          font-size: 9pt !important;
        }
        
        .certificate-print-content th,
        .certificate-print-content td {
          padding-top: 0.5rem !important;
          padding-bottom: 0.5rem !important;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    // Print the page (only certificate will be visible)
    window.print();
    
    // After printing, remove the temporary style
    document.head.removeChild(style);
  };

  const handleBack = () => {
    // Navigate back to the customer's service list using the company_id
    if (serviceRecord?.company_id) {
      navigate(`/service?companyId=${serviceRecord.company_id}`);
    } else {
      // Fallback to the main service list if no company_id is available
      navigate('/service');
    }
  };

  const handlePrintQR = () => {
    navigate(`/certificate/${id}/qr`);
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
              <h1 className="text-2xl font-bold">Certificate Not Found</h1>
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

  // Process equipment data
  const equipmentItems = [];
  
  // Check for numbered equipment fields
  for (let i = 1; i <= 6; i++) {
    const nameField = `equipment${i}_name`;
    const serialField = `equipment${i}_serial`;
    
    if (serviceRecord[nameField]) {
      equipmentItems.push({
        type: serviceRecord[nameField],
        serial: serviceRecord[serialField] || 'N/A'
      });
    }
  }
  
  // If no items found, try legacy fields
  if (equipmentItems.length === 0 && serviceRecord.equipment_type) {
    equipmentItems.push({
      type: serviceRecord.equipment_type,
      serial: serviceRecord.serial_number || 'N/A'
    });
  }

  // Get company details from serviceRecord
  const companyDetails = serviceRecord.company || {};
  const engineerName = serviceRecord.engineer_name || 'N/A';
  const certificateNumber = serviceRecord.certificate_number || `BWS-${id?.substring(0, 5)}`;

  console.log('Rendering certificate with data:', {
    companyName: companyDetails.company_name || companyDetails.name,
    address: companyDetails.address,
    city: companyDetails.city,
    postcode: companyDetails.postcode,
    engineerName,
    equipment: equipmentItems
  });

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* White Header Section */}
      <div className="border-b bg-white shadow-sm print:hidden">
        <div className="container mx-auto py-4 px-6 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="outline"
              onClick={handleBack}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Service Certificate</h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handlePrintQR}
              className="flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              Print QR
            </Button>
            <Button 
              onClick={handlePrint}
              className="bg-[#a6e15a] hover:bg-[#95cc4f] text-white flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print Certificate
            </Button>
          </div>
        </div>
      </div>
      
      {/* Certificate Content - Clean Layout */}
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="bg-white shadow-sm print:shadow-none p-6 certificate-print-content">
          {/* Certificate Header with Logo and Title */}
          <div className="flex items-center justify-between mb-5 border-b pb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center">
                <img 
                  src="/images/logo.png" 
                  alt="BWS Logo" 
                  className="h-14 w-auto object-contain"
                  onError={(e) => {
                    console.log('Logo image failed to load, using fallback');
                  }}
                />
              </div>
              <h1 className="text-2xl font-bold">Calibration Certificate</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Certificate Number</p>
              <p className="text-xl font-bold">{certificateNumber}</p>
            </div>
          </div>
          
          {/* Customer and Test Info in Two Columns */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="font-bold text-lg mb-1">Customer</h2>
              <p className="font-medium">{companyDetails.company_name || companyDetails.name || "N/A"}</p>
              <p>{companyDetails.address || "N/A"}</p>
              <p>{companyDetails.city || "N/A"}</p>
              <p>{companyDetails.postcode || "N/A"}</p>
            </div>
            
            <div>
              <h2 className="font-bold text-lg mb-1">Test Information</h2>
              <div className="grid grid-cols-[100px_1fr]">
                <p className="font-medium">Test Date:</p>
                <p>{serviceRecord.service_date ? format(new Date(serviceRecord.service_date), "dd/MM/yyyy") : "N/A"}</p>
                
                <p className="font-medium">Retest Date:</p>
                <p>{serviceRecord.retest_date ? format(new Date(serviceRecord.retest_date), "dd/MM/yyyy") : "N/A"}</p>
                
                <p className="font-medium">Engineer:</p>
                <p>{engineerName}</p>
              </div>
            </div>
          </div>
          
          {/* Equipment Section */}
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2">Equipment</h2>
            
            <div className="border border-gray-200 rounded">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Equipment Type
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Serial Number
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {equipmentItems.length > 0 ? (
                    equipmentItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {item.type}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          {item.serial}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-3 py-2 text-center text-sm text-gray-500">
                        No equipment data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Function Tested Section */}
          <div className="mb-8">
            <h2 className="font-bold text-lg mb-2">Function Tested</h2>
            <div className="p-3 border border-gray-200 rounded bg-gray-50 text-sm">
              <p className="mb-2">Electrical safety/Insulation. Voltage parameters and welding voltage insulation to earth.</p>
              <p className="mb-2">Insulation resistance checked according to IEE wiring regulations. Welding equipment tested according to BS 7570 (if applicable) and equipment manufacturers recommendations.</p>
              <p>Gas Gauges (If Applicable) have been inspected and tested in accordance with CP7 Gas Safety Regulations</p>
            </div>
          </div>
          
          {/* Footer with Signature and Company Info */}
          <div className="mt-auto pt-4 border-t flex justify-between items-end">
            <div>
              <div className="mb-1">
                <img 
                  src="/images/signature.png" 
                  alt="Engineer Signature" 
                  className="h-14 w-auto object-contain"
                  onError={(e) => {
                    console.log('Signature image failed to load, using fallback');
                  }}
                />
              </div>
              <p className="font-medium">{engineerName}</p>
            </div>
            
            <div className="text-right text-sm">
              <p className="font-semibold">BWS Ltd</p>
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