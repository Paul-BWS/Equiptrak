import { CompanyMap } from "@/components/maps/CompanyMap";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Phone, Globe, Building } from "lucide-react";

interface Company {
  id: string;
  name?: string;
  company_name?: string;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  telephone?: string;
  email?: string;
  website?: string;
  company_type?: string;
  status?: string;
  credit_rating?: string;
  site_address?: string;
  billing_address?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  industry?: string;
  company_status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface CompanyInformationProps {
  company: Company;
}

export function CompanyInformation({ company }: CompanyInformationProps) {
  const { user } = useAuth();
  const isAdmin = user?.email === "paul@basicwelding.co.uk" || 
                 user?.email === "sales@basicwelding.co.uk";

  // Get the company name from either field
  const companyName = company.name || company.company_name || "Unknown Company";
  
  console.log("CompanyInformation - Company data:", company);

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
            <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
            <p className="text-lg whitespace-pre-line">{address}</p>
          </div>
          
          {company.telephone && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Telephone</h3>
              <p className="text-lg flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                {company.telephone}
              </p>
            </div>
          )}
          
          {company.email && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
              <p className="text-lg flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                {company.email}
              </p>
            </div>
          )}
          
          {company.website && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Website</h3>
              <p className="text-lg flex items-center">
                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {company.website}
                </a>
              </p>
            </div>
          )}
          
          {company.company_type && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Company Type</h3>
              <p className="text-lg">{company.company_type}</p>
            </div>
          )}
          
          {company.status && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="text-lg">{company.status}</p>
            </div>
          )}
          
          {company.credit_rating && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Credit Rating</h3>
              <p className="text-lg">{company.credit_rating}</p>
            </div>
          )}
          
          {company.industry && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Industry</h3>
              <p className="text-lg">{company.industry}</p>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="h-[300px] rounded-lg overflow-hidden">
            <CompanyMap address={address} />
          </div>
          
          {(company.contact_name || company.contact_email || company.contact_phone) && (
            <div className="border p-4 rounded-md">
              <h3 className="font-medium mb-3">Contact Information</h3>
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
                    <p className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      {company.contact_email}
                    </p>
                  </div>
                )}
                {company.contact_phone && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Contact Phone</h4>
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      {company.contact_phone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {(company.site_address || company.billing_address) && (
            <div className="border p-4 rounded-md">
              <h3 className="font-medium mb-3">Additional Addresses</h3>
              <div className="space-y-3">
                {company.site_address && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Site Address</h4>
                    <p className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      {company.site_address}
                    </p>
                  </div>
                )}
                {company.billing_address && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Billing Address</h4>
                    <p className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      {company.billing_address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {company.notes && (
            <div className="border p-4 rounded-md">
              <h3 className="font-medium mb-3">Notes</h3>
              <p className="text-sm whitespace-pre-line">{company.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}