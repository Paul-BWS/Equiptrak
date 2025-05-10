interface CertificateCustomerInfoProps {
  companyName?: string;
  address?: string;
  city?: string;
  postcode?: string;
}

export function CertificateCustomerInfo({ 
  companyName, 
  address, 
  city, 
  postcode 
}: CertificateCustomerInfoProps) {
  return (
    <div>
      <h3 className="text-lg font-bold mb-2">Customer</h3>
      <div className="space-y-1">
        {companyName && <p className="font-medium">{companyName}</p>}
        {address && <p>{address}</p>}
        {city && <p>{city}</p>}
        {postcode && <p>{postcode}</p>}
        
        {/* Display a message if no company details are available */}
        {!companyName && !address && !city && !postcode && (
          <p className="text-gray-500 italic">No customer details available</p>
        )}
      </div>
    </div>
  );
}