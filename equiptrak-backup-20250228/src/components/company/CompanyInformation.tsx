import { Profile } from "@/types/database";
import { CompanyMap } from "@/components/maps/CompanyMap";
import { useAuth } from "@/contexts/AuthContext";

interface CompanyInformationProps {
  company: Profile;
}

export function CompanyInformation({ company }: CompanyInformationProps) {
  const { session } = useAuth();
  const isAdmin = session?.user?.email === "paul@basicwelding.co.uk" || 
                 session?.user?.email === "sales@basicwelding.co.uk";

  // Format the address for display
  const formatAddress = () => {
    const addressParts = [];
    if (company.address) addressParts.push(company.address);
    if (company.city) addressParts.push(company.city);
    if (company.postal_code) addressParts.push(company.postal_code);
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
            <p className="text-lg">{company.company_name || 'Not provided'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Telephone</h3>
            <p className="text-lg">{company.phone || 'Not provided'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
            <p className="text-lg whitespace-pre-line">{address}</p>
          </div>
          
          {company.email && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
              <p className="text-lg">{company.email}</p>
            </div>
          )}
        </div>
        
        <div>
          <CompanyMap address={address} />
        </div>
      </div>
    </div>
  );
}