import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function QRCodePrintPage() {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  
  const baseUrl = window.location.origin;
  const certificateUrl = `${baseUrl}/certificate/${recordId}`;
  
  // Use a different QR code service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certificateUrl)}`;
  
  useEffect(() => {
    console.log('QR Code URL:', qrCodeUrl);
    console.log('Certificate URL:', certificateUrl);
  }, [qrCodeUrl, certificateUrl]);
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-background">
      <div className="w-full max-w-3xl">
        <div className="print:hidden mb-8">
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print QR Code
            </Button>
          </div>
          <h1 className="text-2xl font-bold mb-2">QR Code for Certificate</h1>
          <p className="text-gray-600 mb-6">Print this QR code and place it on the equipment for easy access to the certificate.</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center mx-auto max-w-md">
          {/* Show loading state */}
          {!isImageLoaded && !imageError && (
            <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">Loading QR code...</p>
            </div>
          )}
          
          {/* Show error state */}
          {imageError && (
            <div className="w-[200px] h-[200px] flex items-center justify-center bg-red-50 border border-red-200">
              <div className="text-center p-4">
                <p className="text-red-500 font-medium">Failed to load QR code</p>
                <p className="text-sm text-red-400 mt-2">{imageError}</p>
              </div>
            </div>
          )}
          
          {/* The actual QR code image */}
          <img 
            src={qrCodeUrl}
            alt="Certificate QR Code"
            width={200}
            height={200}
            style={{ 
              border: '1px solid #eee',
              display: isImageLoaded ? 'block' : 'none'
            }}
            onLoad={() => {
              console.log('QR code image loaded successfully');
              setIsImageLoaded(true);
            }}
            onError={(e) => {
              console.error('Error loading QR code image:', e);
              setImageError('Could not load QR code image. Please try again later.');
              // Try an alternative service as fallback
              e.currentTarget.src = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(certificateUrl)}&chld=L|0`;
            }}
          />
          
          <p className="mt-4 text-center font-medium">Scan to view certificate</p>
          <p className="text-sm text-gray-500 mt-1">Certificate ID: {recordId?.substring(0, 8)}...</p>
          
          {/* Debug info (only visible in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-100 rounded text-xs w-full">
              <p><strong>Debug Info:</strong></p>
              <p className="mt-1">Certificate URL: {certificateUrl}</p>
              <p className="mt-1">QR Code URL: {qrCodeUrl}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 