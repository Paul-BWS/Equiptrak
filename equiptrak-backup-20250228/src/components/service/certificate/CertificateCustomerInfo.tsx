interface CustomerInfoProps {
  companyName?: string | null;
  address?: string | null;
  city?: string | null;
  postcode?: string | null;
}

export function CertificateCustomerInfo({ 
  companyName, 
  address, 
  city, 
  postcode
}: CustomerInfoProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-blue-600">Customer</h2>
      <div className="space-y-2">
        <p className="text-base font-medium">{companyName}</p>
        <div className="text-sm text-gray-600">
          <p>{address}</p>
          <p>{city}</p>
          <p>{postcode}</p>
        </div>
      </div>
    </div>
  );
}