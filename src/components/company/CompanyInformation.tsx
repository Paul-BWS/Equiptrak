import { CompanyMap } from "@/components/maps/CompanyMap";
import { useAuth } from "@/contexts/AuthContext";

interface Company {
  id: string;
  name?: string;
  company_name?: string;
  email?: string;
  telephone?: string;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  created_at?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  industry?: string;
  website?: string;
}

interface CompanyInformationProps {
  company: Company;
}

export function CompanyInformation({ company }: CompanyInformationProps) {
  const { user } = useAuth();
  const isAdmin = user?.email === "paul@basicwelding.co.uk" || 
                 user?.email === "sales@basicwelding.co.uk";

  // Get the company name and contact info from either field
  const companyName = company.name || company.company_name || "Unknown Company";
  const companyEmail = company.contact_email || "";
  const companyPhone = company.telephone || company.contact_phone || "";
  
  console.log("CompanyInformation - Company data:", company);
  console.log("CompanyInformation - Company email:", companyEmail);
  console.log("CompanyInformation - Company phone:", companyPhone);

  // Format the address for display
  const formatAddress = () => {
    const addressParts = [];
    if (company.address) addressParts.push(company.address);
    if (company.city) addressParts.push(company.city);
    if (company.county) addressParts.push(company.county);
    if (company.postcode) addressParts.push(company.postcode);
    if (company.country) addressParts.push(company.country);
    
    return addressParts.length > 0 
      ? addressParts.join(', ')
      : 'No address provided';
  };

  const address = formatAddress();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Company Name</h3>
            <p className="text-lg">{companyName}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Telephone</h3>
            <p className="text-lg">{companyPhone || 'Not provided'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
            <p className="text-lg whitespace-pre-line">{address}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
            <p className="text-lg">{companyEmail || 'Not provided'}</p>
          </div>
          
          {company.industry && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Industry</h3>
              <p className="text-lg">{company.industry}</p>
            </div>
          )}
          
          {company.website && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Website</h3>
              <p className="text-lg">
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {company.website}
                </a>
              </p>
            </div>
          )}
        </div>
        
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Contact Information</h3>
            {company.contact_name || company.contact_email || company.contact_phone ? (
              <div className="space-y-2">
                {company.contact_name && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Contact Name</h4>
                    <p>{company.contact_name}</p>
                  </div>
                )}
                {company.contact_email && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Contact Email</h4>
                    <p>{company.contact_email}</p>
                  </div>
                )}
                {company.contact_phone && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Contact Phone</h4>
                    <p>{company.contact_phone}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No contact information provided</p>
            )}
          </div>
          
          <div className="h-[300px] rounded-lg overflow-hidden">
            <CompanyMap address={address} />
          </div>
        </div>
      </div>
    </div>
  );
}