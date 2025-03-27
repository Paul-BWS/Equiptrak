import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, QrCode } from "lucide-react";
import { format } from "date-fns";

export function ServiceCertificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  
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
  
  // Fetch service record data with company information
  const { data: record, isLoading, error } = useQuery({
    queryKey: ["service-record", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Service record ID not provided");
      }

      console.log("Fetching service record with ID:", id);
      
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
        if (serviceData && serviceData.company_id && !serviceData.companies) {
          console.log('Fetching company data for ID:', serviceData.company_id);
          const companyResponse = await fetch(`/api/companies/${serviceData.company_id}`, {
            headers: getAuthHeaders(),
            credentials: 'include'
          });
          
          if (companyResponse.ok) {
            const companyData = await companyResponse.json();
            console.log('Successfully fetched company data:', companyData);
            // Attach company data to the service record
            serviceData.companies = companyData;
          } else {
            console.error('Failed to fetch company data');
          }
        }
        
        return serviceData;
      } catch (error) {
        console.error("Error fetching service record:", error);
        throw error;
      }
    },
    retry: 1,
    enabled: !!id
  });
  
  // Update the back button to navigate to the service page
  const handleBack = () => {
    if (record?.company_id) {
      navigate(`/service?companyId=${record.company_id}`);
    } else {
      navigate('/service');
    }
  };

  const handlePrint = () => {
    // Create a dedicated print stylesheet that ensures only the certificate is printed
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = 'print-style-temp';
    
    // This CSS hides everything except the certificate content
    style.innerHTML = `
      @media print {
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
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    // Print the page (only certificate will be visible)
    window.print();
    
    // After printing, remove the temporary style
    document.head.removeChild(style);
  };

  const handlePrintQR = () => {
    console.log("Print QR code for service:", id);
    // Redirect to QR code page when implemented
    navigate(`/service-certificate/${id}/qr`);
  };
  
  if (error) {
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
            <p className="text-red-600">{error instanceof Error ? error.message : "Unknown error"}</p>
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
  
  if (!record) {
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
  
  // Check for equipment fields
  for (let i = 1; i <= 6; i++) {
    const nameField = `equipment${i}_name`;
    const serialField = `equipment${i}_serial`;
    
    if (record[nameField]) {
      equipmentItems.push({
        type: record[nameField],
        serial: record[serialField] || 'N/A'
      });
    }
  }
  
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
      
      {/* Certificate Content */}
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="bg-white p-8 shadow-sm print:shadow-none certificate-print-content">
          {/* Certificate Header */}
          <div className="flex justify-between items-start mb-8 border-b pb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center">
                <img src="/images/logo.png" alt="BWS Logo" className="h-14 w-auto object-contain" />
              </div>
              <h1 className="text-2xl font-bold">Calibration Certificate</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Certificate Number</p>
              <p className="text-xl font-bold">{record.certificate_number || "BWS-" + id?.substring(0, 5)}</p>
            </div>
          </div>
          
          {/* Customer and Test Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Customer</h2>
              <p className="font-medium">{record.companies?.company_name}</p>
              <p>{record.companies?.address}</p>
              <p>{record.companies?.city}</p>
              <p>{record.companies?.postcode}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-500">Test Date</h3>
                <p className="font-medium">{record.service_date || record.test_date ? format(new Date(record.service_date || record.test_date), "dd/MM/yyyy") : "N/A"}</p>
              </div>
              
              <div>
                <h3 className="text-gray-500">Retest Date</h3>
                <p className="font-medium">{record.retest_date ? format(new Date(record.retest_date), "dd/MM/yyyy") : "N/A"}</p>
              </div>
              
              <div>
                <h3 className="text-gray-500">Engineer</h3>
                <p className="font-medium">{record.engineer_name || "N/A"}</p>
              </div>
            </div>
          </div>
          
          {/* Equipment Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Equipment</h2>
            
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipment Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serial Number
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {equipmentItems.length > 0 ? (
                    equipmentItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.serial}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
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
            <h2 className="text-xl font-bold mb-4">Function Tested</h2>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="mb-4">Electrical safety/Insulation. Voltage parameters and welding voltage insulation to earth.</p>
              <p className="mb-4">Insulation resistance checked according to IEE wiring regulations. Welding equipment tested according to BS 7570 (if applicable) and equipment manufacturers recommendations.</p>
              <p>Gas Gauges (If Applicable) have been inspected and tested in accordance with CP7 Gas Safety Regulations</p>
            </div>
          </div>
          
          {/* Notes Section - only show if there are notes */}
          {record.notes && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Notes</h2>
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p>{record.notes}</p>
              </div>
            </div>
          )}
          
          {/* Footer with Signature */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-gray-500 mb-1">Signature</p>
                <div className="h-20 w-56">
                  <img src="/images/signature.png" alt="Technician Signature" className="h-full object-contain" />
                </div>
                <p className="mt-2 text-sm">{record.engineer_name || "Technician"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">BWS Ltd</p>
                <p className="text-sm">232 Briscoe Lane, Manchester</p>
                <p className="text-sm">M40 2XG</p>
                <p className="text-sm">Tel: 0161 223 1843</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceCertificate; 