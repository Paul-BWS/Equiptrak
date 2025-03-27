import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface ServiceRecordData {
  id: string;
  certificate_number: string;
  service_date: string;
  retest_date: string;
  equipment1_name?: string;
  equipment1_serial?: string;
  equipment2_name?: string;
  equipment2_serial?: string;
  equipment3_name?: string;
  equipment3_serial?: string;
  equipment4_name?: string;
  equipment4_serial?: string;
  equipment5_name?: string;
  equipment5_serial?: string;
  equipment6_name?: string;
  equipment6_serial?: string;
  engineer_name?: string;
  status: string;
}

interface CompanyData {
  id: string;
  company_name: string;
  address?: string;
  city?: string;
  postcode?: string;
}

interface CertificateData {
  certificate: ServiceRecordData;
  company: CompanyData;
}

export function PublicCertificateView() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  
  useEffect(() => {
    const fetchCertificate = async () => {
      if (!id || !token) {
        setError('Invalid certificate link. Missing ID or access token.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get(`/api/public/certificate/${id}?token=${token}`);
        setCertificateData(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to fetch certificate:', err);
        setError(err.response?.data?.error || 'Failed to load certificate data');
        setLoading(false);
      }
    };
    
    fetchCertificate();
  }, [id, token]);
  
  const handlePrint = () => {
    window.print();
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a6e15a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !certificateData) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
        <Card className="max-w-md w-full p-6">
          <div className="text-center">
            <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mt-4 text-red-600">Certificate Unavailable</h2>
            <p className="mt-2 text-gray-600">{error || 'Unable to display the requested certificate'}</p>
          </div>
        </Card>
      </div>
    );
  }
  
  // Format dates
  const serviceDate = certificateData.certificate.service_date 
    ? format(new Date(certificateData.certificate.service_date), 'dd/MM/yyyy')
    : 'N/A';
  
  const retestDate = certificateData.certificate.retest_date
    ? format(new Date(certificateData.certificate.retest_date), 'dd/MM/yyyy')
    : 'N/A';
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Print Button - Hidden when printing */}
      <div className="print:hidden fixed top-4 right-4">
        <Button 
          onClick={handlePrint} 
          className="bg-[#a6e15a] hover:bg-[#95cc4f] text-white"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print Certificate
        </Button>
      </div>
      
      {/* Certificate Content */}
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Certificate Header */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <img src="/images/logo.png" alt="BWS Logo" className="h-16 mr-4" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Calibration Certificate</h1>
                  <p className="text-gray-600">BWS Ltd</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">{certificateData.certificate.certificate_number}</p>
                <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {certificateData.certificate.status === 'valid' ? 'Valid' : certificateData.certificate.status}
                </div>
              </div>
            </div>
          </div>
          
          {/* Customer Info */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-3 border-b pb-2">Customer Information</h2>
              <p className="font-semibold">{certificateData.company.company_name}</p>
              {certificateData.company.address && (
                <p className="text-gray-600">{certificateData.company.address}</p>
              )}
              {certificateData.company.city && (
                <p className="text-gray-600">{certificateData.company.city}</p>
              )}
              {certificateData.company.postcode && (
                <p className="text-gray-600">{certificateData.company.postcode}</p>
              )}
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-3 border-b pb-2">Certificate Details</h2>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-gray-600">Service Date:</p>
                <p className="font-medium">{serviceDate}</p>
                
                <p className="text-gray-600">Retest Date:</p>
                <p className="font-medium">{retestDate}</p>
                
                <p className="text-gray-600">Engineer:</p>
                <p className="font-medium">{certificateData.certificate.engineer_name || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          {/* Equipment Table */}
          <div className="p-6 border-t">
            <h2 className="text-lg font-semibold mb-3">Equipment Tested</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipment
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serial Number
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {certificateData.certificate.equipment1_name && (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {certificateData.certificate.equipment1_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {certificateData.certificate.equipment1_serial || 'N/A'}
                      </td>
                    </tr>
                  )}
                  {certificateData.certificate.equipment2_name && (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {certificateData.certificate.equipment2_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {certificateData.certificate.equipment2_serial || 'N/A'}
                      </td>
                    </tr>
                  )}
                  {certificateData.certificate.equipment3_name && (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {certificateData.certificate.equipment3_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {certificateData.certificate.equipment3_serial || 'N/A'}
                      </td>
                    </tr>
                  )}
                  {certificateData.certificate.equipment4_name && (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {certificateData.certificate.equipment4_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {certificateData.certificate.equipment4_serial || 'N/A'}
                      </td>
                    </tr>
                  )}
                  {certificateData.certificate.equipment5_name && (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {certificateData.certificate.equipment5_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {certificateData.certificate.equipment5_serial || 'N/A'}
                      </td>
                    </tr>
                  )}
                  {certificateData.certificate.equipment6_name && (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {certificateData.certificate.equipment6_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {certificateData.certificate.equipment6_serial || 'N/A'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t bg-gray-50">
            <div className="text-center">
              <p className="font-medium">BWS Ltd, 232 Briscoe Lane, Manchester, M40 2XG</p>
              <p className="text-gray-600">Tel: 0161 223 1843</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 