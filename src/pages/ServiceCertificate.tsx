import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, QrCode } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

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
    padding: 15mm 15mm 10mm;
    font-size: 92%;
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
    padding: 2px 5px;
    border: 1px solid #e5e7eb;
  }
  
  .certificate-table th {
    background-color: #f9fafb;
    font-weight: 500;
  }
  
  h1, h2, h3 {
    margin-bottom: 0.3rem !important;
  }
  
  p {
    margin-bottom: 0.2rem !important;
  }
  
  .company-details {
    font-size: 90%;
    line-height: 1.2;
  }
}
`;

export function ServiceCertificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const companyIdParam = searchParams.get('companyId');
  const { user } = useAuth();
  
  // Fetch service record data
  const { data: record, isLoading, error } = useQuery({
    queryKey: ["service-record", id],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/service-records/${id}`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch service record: ${response.status}`);
        }
        
        const data = await response.json();
        
        // If we don't have company data, fetch it
        if (data.company_id && !data.company) {
          const companyResponse = await fetch(`/api/companies/${data.company_id}`, {
            headers: {
              'Authorization': `Bearer ${user?.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (companyResponse.ok) {
            const companyData = await companyResponse.json();
            data.company = companyData;
          }
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching service record:", error);
        throw error;
      }
    },
    retry: 1,
    enabled: !!id && !!user?.token
  });

  const handleBack = () => {
    // First priority: use company ID from URL
    if (companyIdParam) {
      navigate(`/service?companyId=${companyIdParam}`);
    }
    // Second priority: use company ID from the service record
    else if (record?.company_id) {
      navigate(`/service?companyId=${record.company_id}`);
    } 
    // Fallback: go to the general service page
    else {
      navigate('/service');
    }
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

  const handlePrintQR = () => {
    navigate(`/service-certificate/${id}/qr`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
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
            
            <div className="flex gap-2">
              {/* Buttons disabled while loading */}
              <Button 
                variant="outline"
                disabled
                className="flex items-center gap-2"
              >
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
              <Button 
                disabled
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
        
        <div className="max-w-[95%] mx-auto pb-6">
          <div className="bg-white p-6 shadow">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin h-8 w-8 rounded-full border-t-2 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-gray-100">
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
              Error Loading Certificate
            </div>
            
            <div></div>
          </div>
        </div>
        
        <div className="max-w-[95%] mx-auto pb-6">
          <div className="bg-red-50 border border-red-200 p-6 rounded-md">
            <h2 className="text-red-800 font-semibold mb-2">Error</h2>
            <p className="text-red-600">{error instanceof Error ? error.message : "Failed to load service certificate"}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Get company information
  const companyName = record.company?.company_name || "Unknown Customer";
  const formattedServiceDate = record.service_date ? format(new Date(record.service_date), "d MMM yyyy") : "N/A";
  const formattedRetestDate = record.retest_date ? format(new Date(record.retest_date), "d MMM yyyy") : "N/A";
  const certificateNumber = record.certificate_number || "N/A";
  
  // Get the list of equipment that was serviced
  const equipmentItems = [];
  for (let i = 1; i <= 8; i++) {
    // Check both naming formats - DB format (equipment_name_${i}) and frontend format (equipment${i}_name)
    const dbNameField = `equipment_name_${i}`;
    const dbSerialField = `equipment_serial_${i}`;
    const frontendNameField = `equipment${i}_name`;
    const frontendSerialField = `equipment${i}_serial`;
    
    // Use the DB field names first, then try frontend field names as fallback
    const name = record[dbNameField] || record[frontendNameField];
    const serial = record[dbSerialField] || record[frontendSerialField];
    
    if (name && name.trim() !== '') {
      equipmentItems.push({
        name: name,
        serial: serial || "N/A"
      });
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
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
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handlePrintQR}
              className="flex items-center gap-2"
            >
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </Button>
            <Button 
              onClick={handlePrint}
              className="bg-[#21c15b] hover:bg-[#21c15b]/90 text-white flex items-center gap-2"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </div>
      
      {/* Certificate Content */}
      <div className="container mx-auto px-4 pb-16 max-w-[210mm]">
        <div className="certificate-content bg-white shadow-md rounded-md p-8 overflow-visible">
          {/* Certificate Header with Logo and Title */}
          <div className="flex items-start mb-3 pb-2 border-b">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 flex items-center justify-center p-2 rounded">
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
          <div className="flex justify-between items-center pb-3 mb-3 border-b">
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
          <div className="mb-3 pb-3 border-b">
            <h2 className="text-lg font-bold mb-1">Customer</h2>
            <p className="font-medium">{companyName}</p>
            <p className="text-gray-800">
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
          
          {/* Test Information - 3 columns */}
          <div className="grid grid-cols-3 gap-4 mb-3 pb-3 border-b">
            <div>
              <h3 className="font-medium mb-0">Test Date</h3>
              <p>{formattedServiceDate}</p>
            </div>
            <div>
              <h3 className="font-medium mb-0">Retest Date</h3>
              <p>{formattedRetestDate}</p>
            </div>
            <div>
              <h3 className="font-medium mb-0">Engineer</h3>
              <p>{record.engineer_name || "N/A"}</p>
            </div>
          </div>
          
          {/* Equipment List */}
          <div className="mb-3">
            <h2 className="text-lg font-bold mb-2">Equipment Details</h2>
            <table className="w-full certificate-table border-collapse">
              <thead>
                <tr>
                  <th className="p-1 text-center font-medium border">Equipment Type</th>
                  <th className="p-1 text-center font-medium border">Serial Number</th>
                </tr>
              </thead>
              <tbody>
                {/* Display available equipment items */}
                {equipmentItems.map((item, index) => (
                  <tr key={index}>
                    <td className="p-1 text-center border">{item.name}</td>
                    <td className="p-1 text-center border">{item.serial}</td>
                  </tr>
                ))}
                
                {/* Add empty rows to always have 6 rows total */}
                {Array.from({ length: Math.max(0, 6 - equipmentItems.length) }).map((_, index) => (
                  <tr key={`empty-${index}`}>
                    <td className="p-1 text-center border">-</td>
                    <td className="p-1 text-center border">-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Function Tested Section */}
          <div className="mb-3">
            <h2 className="font-bold text-lg mb-1">Function Tested</h2>
            <div className="p-2 border border-gray-200 rounded bg-gray-50 text-sm">
              <p className="mb-1">Electrical safety/Insulation. Voltage parameters and welding voltage insulation to earth.</p>
              <p className="mb-1">Insulation resistance checked according to IEE wiring regulations. Welding equipment tested according to BS 7570 (if applicable) and equipment manufacturers recommendations.</p>
              <p>Gas Gauges (If Applicable) have been inspected and tested in accordance with CP7 Gas Safety Regulations</p>
            </div>
          </div>
          
          {/* Notes / Observations */}
          {record.notes && record.notes.trim() !== '' && (
            <div className="mb-3">
              <h3 className="font-bold text-lg mb-1">Notes / Observations</h3>
              <div className="p-2 border border-gray-200 rounded min-h-[50px]">
                <p className="whitespace-pre-line">{record.notes}</p>
              </div>
            </div>
          )}
          
          {/* Signature and Company Info at the bottom */}
          <div className="mt-auto pt-3 border-t flex justify-between items-start">
            <div>
              <p className="text-sm font-medium mb-0">Signature</p>
              <div className="w-24 h-12 flex items-center justify-center">
                <img 
                  src="/images/signature.png" 
                  alt="Engineer Signature" 
                  className="max-h-10 max-w-full signature-image"
                  onError={(e) => {
                    console.log('Signature image failed to load, using fallback');
                  }}
                />
              </div>
            </div>
            
            <div className="text-right text-xs company-details">
              <p className="font-medium">Basic Welding Service LTD</p>
              <p>232 Briscoe lane, Manchester</p>
              <p>M40 2XG</p>
              <p>0161 223 1843</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceCertificate; 