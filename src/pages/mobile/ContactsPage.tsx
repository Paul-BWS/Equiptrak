import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, Plus } from "lucide-react";
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
}

export default function ContactsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchContacts = async () => {
      if (!id || !user?.token) {
        console.log('Missing id or token:', { id, token: user?.token });
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching contacts for company:', id);
        const response = await fetch(`/api/companies/${id}/contacts`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch contacts:', response.status, errorText);
          throw new Error('Failed to fetch contacts');
        }

        const data = await response.json();
        console.log('Received contacts:', data);
        setContacts(data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: "Error",
          description: "Failed to load contacts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [id, user?.token, toast]);

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.first_name.toLowerCase().includes(searchLower) ||
      contact.last_name.toLowerCase().includes(searchLower) ||
      (contact.email || '').toLowerCase().includes(searchLower) ||
      (contact.job_title || '').toLowerCase().includes(searchLower)
    );
  });

  const handleContactClick = (contactId: string) => {
    navigate(`/mobile/company/${id}/contacts/${contactId}`);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#1D2125]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white dark:bg-[#1E2227] z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div 
            className="w-10 h-10 flex items-center justify-center bg-[#f0f2f5] dark:bg-gray-800 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => navigate(`/mobile/company/${id}`)}
          >
            <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Contacts</h1>
          <div className="w-10 h-10 flex items-center justify-center bg-[#f0f2f5] dark:bg-gray-800 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
            <Plus className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-[#f0f2f5] dark:bg-gray-800 text-gray-900 dark:text-white 
              placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 px-4 pb-6">
        {loading ? (
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          </div>
        ) : filteredContacts.length > 0 ? (
          <div className="space-y-4">
            {filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleContactClick(contact.id)}
                className="w-full text-left bg-white dark:bg-[#1E2227] rounded-xl p-4 shadow-sm 
                  border border-gray-200 dark:border-gray-800
                  hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                  active:bg-gray-100 dark:active:bg-gray-800 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {contact.first_name} {contact.last_name}
                      {contact.is_primary && (
                        <span className="text-xs bg-primary/10 dark:bg-primary/20 text-primary px-2 py-1 rounded-full">
                          Primary
                        </span>
                      )}
                    </h3>
                    {contact.job_title && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{contact.job_title}</p>
                    )}
                    {contact.email && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{contact.email}</p>
                    )}
                    {(contact.telephone || contact.mobile) && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {contact.mobile || contact.telephone}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">No contacts found</div>
        )}
      </div>
    </div>
  );
} 