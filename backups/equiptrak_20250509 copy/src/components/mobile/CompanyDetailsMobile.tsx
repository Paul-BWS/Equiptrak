import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ChevronLeft, Share2, Building, User, ClipboardList, 
  Wrench, Users, MessageSquare, Phone, Mail, Plus 
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

  // Add debugging useEffect
  useEffect(() => {
    console.log('Current contacts state:', contacts);
  }, [contacts]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user?.token) return;
      
      try {
        setLoading(true);
        
        // Fetch company data
        const companyResponse = await fetch(`/api/companies/${id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!companyResponse.ok) {
          throw new Error('Failed to fetch company data');
        }
        
        const companyData = await companyResponse.json();
        setCompany(companyData);

        // Fetch contacts data
        const contactsResponse = await fetch(`/api/companies/${id}/contacts`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();
          console.log('Received contacts data:', contactsData);
          
          // Ensure we have valid contact data
          if (Array.isArray(contactsData)) {
            // Sort contacts to ensure primary contacts appear first
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
          }
        } else {
          console.error("Error fetching contacts:", await contactsResponse.text());
          setContacts([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load data",
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
    { id: 'contacts', icon: User, label: 'Contacts', color: '#4CAF50' },
    { id: 'workorders', icon: ClipboardList, label: 'Work Orders', color: '#FF9800' },
    { id: 'service', icon: Wrench, label: 'Service', color: '#9C27B0' },
    { id: 'personnel', icon: Users, label: 'Personnel', color: '#FFB74D' },
    { id: 'chat', icon: MessageSquare, label: 'Chat', color: '#E91E63' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] p-4">
        <div className="text-center text-gray-500">Company not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50">
        <div className="flex items-center justify-between p-4">
          <div className="w-10 h-10 flex items-center justify-center bg-[#f0f2f5] rounded-full cursor-pointer"
               onClick={() => navigate('/admin')}>
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </div>
          <h1 className="text-lg font-semibold">Details</h1>
          <div className="w-10 h-10 flex items-center justify-center bg-[#f0f2f5] rounded-full cursor-pointer">
            <Share2 className="h-5 w-5 text-gray-600" />
          </div>
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
          <span className="text-sm text-gray-500">Company Profile</span>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {navigationTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'contacts') {
                  navigate(`/company/${id}/contacts`);
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className="flex flex-col items-center"
            >
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                  activeTab === tab.id 
                  ? 'bg-white/80' 
                  : 'bg-white shadow-sm'
                }`}
              >
                <tab.icon 
                  className={`h-5 w-5 transition-colors ${
                    activeTab === tab.id || (tab.id === 'contacts' && activeTab !== tab.id) || (tab.id === 'workorders' && activeTab !== tab.id) || (tab.id === 'service' && activeTab !== tab.id) || (tab.id === 'personnel' && activeTab !== tab.id) || (tab.id === 'chat' && activeTab !== tab.id)
                    ? tab.id === 'contacts' ? 'text-[#4CAF50]'
                    : tab.id === 'workorders' ? 'text-[#FF9800]'
                    : tab.id === 'service' ? 'text-[#9C27B0]'
                    : tab.id === 'personnel' ? 'text-[#FFB74D]'
                    : tab.id === 'chat' ? 'text-[#E91E63]'
                    : tab.id === activeTab ? `text-[${tab.color}]`
                    : 'text-gray-400'
                    : 'text-gray-400'
                  }`}
                />
              </div>
              <span 
                className={`text-xs transition-colors ${
                  activeTab === tab.id 
                  ? tab.id === 'details' ? 'text-[#7496da] font-medium'
                  : tab.id === 'contacts' ? 'text-[#4CAF50] font-medium'
                  : tab.id === 'workorders' ? 'text-[#FF9800] font-medium'
                  : tab.id === 'service' ? 'text-[#9C27B0] font-medium'
                  : tab.id === 'personnel' ? 'text-[#FFB74D] font-medium'
                  : 'text-[#E91E63] font-medium'
                  : 'text-gray-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Details Section */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Name</label>
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
            </div>
          </div>
        )}

        {/* Contacts Section */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            {/* Add Contact Button */}
            <button 
              className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-center space-x-2 text-[#4CAF50] hover:bg-[#4CAF50]/5 transition-colors"
              onClick={() => console.log('Add contact')}
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Add New Contact</span>
            </button>

            {/* Contacts List */}
            {contacts.map((contact, index) => (
              <div key={contact.id} className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
                {/* Contact Header */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#4CAF50]/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-[#4CAF50]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {contact.first_name} {contact.last_name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {contact.is_primary && (
                        <span className="text-xs px-2 py-0.5 bg-[#4CAF50]/10 text-[#4CAF50] rounded-full font-medium">
                          Primary Contact
                        </span>
                      )}
                      {contact.job_title && (
                        <span className="text-sm text-gray-500">
                          {contact.job_title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <a 
                    href={`tel:${contact.mobile}`}
                    className="flex items-center justify-center space-x-2 bg-[#f8f9fa] rounded-xl py-3 hover:bg-[#4CAF50]/5 transition-colors"
                  >
                    <Phone className="h-5 w-5 text-[#4CAF50]" />
                    <span className="text-sm font-medium text-gray-700">Call Mobile</span>
                  </a>
                  <a 
                    href={`mailto:${contact.email}`}
                    className="flex items-center justify-center space-x-2 bg-[#f8f9fa] rounded-xl py-3 hover:bg-[#4CAF50]/5 transition-colors"
                  >
                    <Mail className="h-5 w-5 text-[#4CAF50]" />
                    <span className="text-sm font-medium text-gray-700">Send Email</span>
                  </a>
                </div>

                {/* Contact Details */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Mobile Phone</label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-base">{contact.mobile || ''}</span>
                      <a href={`tel:${contact.mobile}`}>
                        <Phone className="h-5 w-5 text-[#4CAF50]" />
                      </a>
                    </div>
                  </div>

                  {contact.telephone && (
                    <div>
                      <label className="text-sm text-gray-500">Office Phone</label>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-base">{contact.telephone}</span>
                        <a href={`tel:${contact.telephone}`}>
                          <Phone className="h-5 w-5 text-[#4CAF50]" />
                        </a>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-base">{contact.email || ''}</span>
                      <a href={`mailto:${contact.email}`}>
                        <Mail className="h-5 w-5 text-[#4CAF50]" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Other tab content sections would go here */}
      </div>
    </div>
  );
} 