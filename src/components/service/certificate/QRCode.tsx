// Update to use QR Server API which is more reliable
import { useState, useEffect } from 'react';
import axios from 'axios';

interface QRCodeProps {
  certificateId: string;
  size?: number;
}

export function CertificateQRCode({ certificateId, size = 100 }: QRCodeProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  
  // Fetch the public token when the component loads
  useEffect(() => {
    const fetchPublicToken = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/service-records/${certificateId}`);
        setPublicToken(response.data.public_access_token);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch certificate public token:', err);
        setError('Could not generate QR code. Please try again later.');
        setLoading(false);
      }
    };
    
    if (certificateId) {
      fetchPublicToken();
    }
  }, [certificateId]);
  
  // Create the URL that the QR code will point to
  const baseUrl = window.location.origin;
  const certificateUrl = publicToken 
    ? `${baseUrl}/public-certificate/${certificateId}?token=${publicToken}`
    : '';
  
  // Use QR Server API to generate a QR code
  const qrCodeUrl = certificateUrl 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(certificateUrl)}`
    : '';
  
  if (loading) {
    return (
      <div className="flex flex-col items-center">
        <div className={`w-${size} h-${size} bg-gray-100 flex items-center justify-center`}>
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error || !certificateUrl) {
    return (
      <div className="flex flex-col items-center">
        <div className={`w-${size} h-${size} bg-red-50 flex items-center justify-center border border-red-200`}>
          <span className="text-sm text-red-500 text-center p-2">{error || 'Failed to create QR code'}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center">
      <img 
        src={qrCodeUrl}
        alt="Certificate QR Code"
        width={size}
        height={size}
        style={{ border: '1px solid #eee' }}
        onError={(e) => {
          console.error('Error loading QR code image');
          // Try Google Charts API as fallback
          e.currentTarget.src = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(certificateUrl)}&chld=L|0`;
        }}
      />
      <p className="text-xs mt-1">Scan for certificate</p>
    </div>
  );
} 