import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ChevronLeft, Share2, Building, User, ClipboardList, 
  Wrench, Users, MessageSquare, Phone, Mail, Plus, Users2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  telephone?: string;
  mobile?: string;
  job_title?: string;
  is_primary: boolean;
  has_system_access: boolean;
}

interface Company {
  id: string;
  company_name: string;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  contacts: Contact[];
}

export function CompanyDetailsMobile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add debugging logs
  console.log('CompanyDetailsMobile - Rendering with ID:', id);
  console.log('CompanyDetailsMobile - User:', user);
  console.log('CompanyDetailsMobile - Current path:', window.location.pathname);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user?.token) {
        console.log('Missing id or token:', { id, token: user?.token });
        setError('Missing required data');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching company data for ID:', id);
        
        // Fetch company data
        const companyResponse = await fetch(`/api/companies/${id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Company response status:', companyResponse.status);
        
        if (!companyResponse.ok) {
          const errorText = await companyResponse.text();
          console.error('Company fetch failed:', companyResponse.status, errorText);
          throw new Error(`Failed to fetch company data: ${companyResponse.status}`);
        }
        
        const companyData = await companyResponse.json();
        console.log('Received company data:', companyData);
        
        if (!companyData || typeof companyData !== 'object') {
          console.error('Invalid company data received:', companyData);
          throw new Error('Invalid company data format');
        }
        
        setCompany(companyData);

        // Fetch contacts data
        console.log('Fetching contacts data for company:', id);
        const contactsResponse = await fetch(`/api/companies/${id}/contacts`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Contacts response status:', contactsResponse.status);
        
        if (!contactsResponse.ok) {
          const errorText = await contactsResponse.text();
          console.error('Contacts fetch failed:', contactsResponse.status, errorText);
          
          if (contactsResponse.status === 403) {
            toast({
              title: "Access Denied",
              description: "You are not authorized to view contacts for this company.",
              variant: "destructive"
            });
            setContacts([]);
          } else {
            toast({
              title: "Error",
              description: "Failed to load contacts. Please try again later.",
              variant: "destructive"
            });
          }
          return;
        }
        
        const contactsData = await contactsResponse.json();
        console.log('Received contacts data:', contactsData);
        
        if (Array.isArray(contactsData)) {
          const sortedContacts = contactsData.sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return 0;
          });
          console.log('Sorted contacts:', sortedContacts);
          setContacts(sortedContacts);
        } else {
          console.error('Invalid contacts data received:', contactsData);
          setContacts([]);
          toast({
            title: "Error",
            description: "Invalid contacts data received",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user?.token, toast]);

  // Add a debug effect
  useEffect(() => {
    console.log('Current contacts state:', contacts);
    console.log('Primary contact:', contacts.find(contact => contact.is_primary));
  }, [contacts]);

  const navigationTabs = [
    { id: 'details', icon: Building, label: 'Details', color: '#7496da' },
    { id: 'contacts', icon: Users, label: 'Contacts', color: '#4CAF50' },
    { id: 'notes', icon: MessageSquare, label: 'Notes', color: '#FF9800' },
    { id: 'equipment', icon: Wrench, label: 'Equipment', color: '#E91E63' },
    { id: 'service', icon: ClipboardList, label: 'Service', color: '#9C27B0' },
    { id: 'certificates', icon: Share2, label: 'Certificates', color: '#795548' }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4">
        <div className="text-center mb-4">
          <p className="text-red-600 mb-2">{error}</p>
          <p className="text-gray-600">Unable to load company details</p>
        </div>
        <button 
          onClick={() => navigate(user?.role === 'admin' ? '/mobile/companies' : '/dashboard')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Back to Companies
        </button>
      </div>
    );
  }

  // Show error state if no company data
  if (!company) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4">
        <div className="text-center mb-4">
          <p className="text-gray-600">Failed to load company data</p>
        </div>
        <button 
          onClick={() => navigate(user?.role === 'admin' ? '/mobile/companies' : '/dashboard')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Back to Companies
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50">
        <div className="flex items-center justify-between p-4">
          <div 
            className="w-10 h-10 flex items-center justify-center bg-[#f0f2f5] rounded-full cursor-pointer"
            onClick={() => navigate(user?.role === 'admin' ? '/mobile/companies' : '/dashboard')}
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </div>
          <h1 className="text-lg font-semibold">Details</h1>
          <div className="w-10 h-10" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 px-4 pb-6">
        {/* Company Icon and Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#e8eeff] rounded-2xl flex items-center justify-center mb-3">
            <Building className="h-8 w-8 text-[#7496da]" />
          </div>
          <h2 className="text-xl font-semibold mb-1">{company.company_name}</h2>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {navigationTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'contacts') {
                  navigate(`/mobile/company/${company.id}/contacts`);
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`flex flex-col items-center justify-center p-4 rounded-xl transition-colors ${
                activeTab === tab.id ? 'bg-white shadow-sm' : 'bg-transparent'
              }`}
            >
              <tab.icon className={`h-6 w-6 mb-2`} style={{ color: tab.color }} />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Details Section */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Details</h3>
            <div className="space-y-4">
              {/* Primary Contact Details */}
              {contacts.find(contact => contact.is_primary) && (
                <>
                  <div>
                    <label className="text-sm text-gray-500">Primary Contact</label>
                    <div className="text-base mt-1">
                      {(() => {
                        const primaryContact = contacts.find(contact => contact.is_primary);
                        if (primaryContact) {
                          return `${primaryContact.first_name} ${primaryContact.last_name}`;
                        }
                        return '';
                      })()}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Mobile Phone</label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-base">
                        {(() => {
                          const primaryContact = contacts.find(contact => contact.is_primary);
                          return primaryContact?.mobile || '';
                        })()}
                      </span>
                      <Phone className="h-5 w-5 text-[#7496da]" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Office Phone</label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-base">
                        {(() => {
                          const primaryContact = contacts.find(contact => contact.is_primary);
                          return primaryContact?.telephone || '';
                        })()}
                      </span>
                      <Phone className="h-5 w-5 text-[#7496da]" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-base">
                        {(() => {
                          const primaryContact = contacts.find(contact => contact.is_primary);
                          return primaryContact?.email || '';
                        })()}
                      </span>
                      <Mail className="h-5 w-5 text-[#7496da]" />
                    </div>
                  </div>
                </>
              )}

              {/* Company Address */}
              {(company.address || company.city || company.county || company.postcode) && (
                <div>
                  <label className="text-sm text-gray-500">Address</label>
                  <div className="text-base mt-1">
                    {[
                      company.address,
                      company.city,
                      company.county,
                      company.postcode
                    ].filter(Boolean).join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Equipment Section */}
        {activeTab === 'equipment' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Equipment</h3>
              <button className="text-primary hover:text-primary/90">
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-500 text-center py-4">No equipment found</p>
          </div>
        )}
      </div>
    </div>
  );
} 