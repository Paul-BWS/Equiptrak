// Update to use QR Server API which is more reliable
interface QRCodeProps {
  certificateId: string;
  size?: number;
}

export function CertificateQRCode({ certificateId, size = 100 }: QRCodeProps) {
  // Create the URL that the QR code will point to
  const baseUrl = window.location.origin;
  const certificateUrl = `${baseUrl}/certificate/${certificateId}`;
  
  // Use QR Server API to generate a QR code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(certificateUrl)}`;
  
  console.log('Certificate URL:', certificateUrl);
  console.log('QR Code URL:', qrCodeUrl);
  
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