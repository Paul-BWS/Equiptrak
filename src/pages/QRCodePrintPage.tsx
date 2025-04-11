import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Printer } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

// This component handles both /certificate/:id/qr and /service-certificate/:recordId/qr 
// and /lift-certificate/:id/qr
export default function QRCodePrintPage() {
  const location = useLocation();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [certificateNumber, setCertificateNumber] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  
  // Determine the record type based on the URL path
  const isLiftCertificate = location.pathname.includes('lift-certificate');
  const isServiceCertificate = location.pathname.includes('service-certificate');
  
  // Check if we have a temporary record passed via state (our workaround)
  const tempRecord = location.state?.tempRecord;
  
  useEffect(() => {
    const fetchCertificateInfo = async () => {
      try {
        setLoading(true);
        
        // If we have a temporary record for lift certificates, use it directly
        if (tempRecord && isLiftCertificate) {
          setCertificateNumber(tempRecord.certificate_number || 'Unknown');
          setCompanyName(tempRecord.company?.company_name || 'Unknown');
          
          // Create the public URL with the temporary token
          const { protocol, host } = window.location;
          const baseUrl = `${protocol}//${host}`;
          const publicEndpoint = `/public/lift-certificate/${params.id}`;
          const fullUrl = `${baseUrl}${publicEndpoint}?token=${tempRecord.public_access_token}`;
          
          setPublicUrl(fullUrl);
          setLoading(false);
          return;
        }
        
        // Regular flow - determine the API endpoint based on the type
        let endpoint;
        let id;
        
        if (isLiftCertificate) {
          endpoint = `/api/lift-service-records/${params.id}`;
          id = params.id;
        } else if (isServiceCertificate) {
          endpoint = `/api/service-records/${params.recordId}`;
          id = params.recordId;
        } else {
          endpoint = `/api/certificate/${params.id}`;
          id = params.id;
        }
        
        const response = await axios.get(endpoint);
        
        // Get certificate info (different properties based on type)
        const data = response.data;
        let certificateToken;
        let publicEndpoint;
        
        if (isLiftCertificate) {
          setCertificateNumber(data.certificate_number || 'Unknown');
          setCompanyName(data.company?.company_name || 'Unknown');
          certificateToken = data.public_access_token;
          publicEndpoint = `/public/lift-certificate/${id}`;
        } else if (isServiceCertificate) {
          setCertificateNumber(data.certificate_number || 'Unknown');
          setCompanyName(data.company?.company_name || 'Unknown');
          certificateToken = data.public_access_token;
          publicEndpoint = `/public-certificate/${id}`;
        } else {
          setCertificateNumber(data.certificate_number || 'Unknown');
          setCompanyName(data.customer_name || 'Unknown');
          certificateToken = data.public_access_token;
          publicEndpoint = `/public-certificate/${id}`;
        }
        
        // Construct the public URL with token
        if (certificateToken) {
          // Get the full domain
          const { protocol, host } = window.location;
          const baseUrl = `${protocol}//${host}`;
          const fullUrl = `${baseUrl}${publicEndpoint}?token=${certificateToken}`;
          setPublicUrl(fullUrl);
        } else {
          setError('Certificate does not have a public access token.');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching certificate information:', err);
        setError('Failed to load certificate information. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchCertificateInfo();
  }, [params, isLiftCertificate, isServiceCertificate, tempRecord]);
  
  const handlePrint = () => {
    window.print();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error || !publicUrl) {
    return (
      <div className="container max-w-md mx-auto p-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error || 'Unable to generate QR code'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-md mx-auto p-6">
      <div className="print:hidden mb-6">
        <Button onClick={handlePrint} className="w-full bg-[#a6e15a] hover:bg-[#95cc4f] text-white">
          <Printer className="h-4 w-4 mr-2" />
          Print QR Code
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          Click the button above to print this QR code or save it as a PDF.
        </p>
      </div>
      
      <Card className="text-center p-6">
        <CardContent className="pt-6">
          <h1 className="text-xl font-bold mb-2">Certificate QR Code</h1>
          <p className="text-sm text-gray-600 mb-6">
            Scan to view certificate {certificateNumber} for {companyName}
          </p>
          
          <div className="flex justify-center mb-6">
            <div className="border p-3 inline-block bg-white">
              <QRCode 
                value={publicUrl}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>
          
          <div className="text-xs text-gray-500 break-all">
            <p className="font-semibold mb-1">URL:</p>
            <p>{publicUrl}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 