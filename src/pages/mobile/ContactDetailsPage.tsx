import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, UserCircle, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function ContactDetailsPage() {
  const { id: companyId, contactId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      if (!companyId || !contactId || !user?.token) {
        console.log('Missing required params:', { companyId, contactId, token: user?.token });
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching contact details:', { companyId, contactId });
        const response = await fetch(`http://localhost:3001/api/companies/${companyId}/contacts/${contactId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch contact:', response.status, errorText);
          throw new Error('Failed to fetch contact details');
        }

        const data = await response.json();
        console.log('Received contact data:', data);
        setContact(data);
      } catch (error) {
        console.error('Error fetching contact:', error);
        toast({
          title: "Error",
          description: "Failed to load contact details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [companyId, contactId, user?.token, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#1D2125] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#1D2125] p-4">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Contact not found</p>
          <Button
            variant="ghost"
            onClick={() => navigate(`/mobile/company/${companyId}/contacts`)}
            className="mt-4"
          >
            Back to Contacts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#1D2125]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white dark:bg-[#1E2227] z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div 
            className="w-10 h-10 flex items-center justify-center bg-[#f0f2f5] dark:bg-gray-800 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => navigate(`/mobile/company/${companyId}/contacts`)}
          >
            <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Details</h1>
          <div className="w-10 h-10" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 px-4 pb-6">
        {/* Contact Header */}
        <div className="bg-white dark:bg-[#1E2227] rounded-xl p-6 mb-4 shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <UserCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {contact.first_name} {contact.last_name}
                {contact.is_primary && (
                  <span className="text-xs bg-[#a6e15a] text-black px-2 py-1 rounded-full">
                    Primary
                  </span>
                )}
              </h2>
              {contact.job_title && (
                <p className="text-gray-500 dark:text-gray-400 mt-1">{contact.job_title}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {contact.mobile && (
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <a href={`tel:${contact.mobile}`} className="flex items-center justify-center gap-2">
                <Phone className="h-5 w-5" />
                <span>Call Mobile</span>
              </a>
            </Button>
          )}
          {contact.email && (
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <a href={`mailto:${contact.email}`} className="flex items-center justify-center gap-2">
                <Mail className="h-5 w-5" />
                <span>Send Email</span>
              </a>
            </Button>
          )}
        </div>

        {/* Contact Details */}
        <div className="bg-white dark:bg-[#1E2227] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Contact Information</h3>
          <div className="space-y-4">
            {contact.mobile && (
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Mobile Phone</label>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-gray-900 dark:text-white">{contact.mobile}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-primary"
                  >
                    <a href={`tel:${contact.mobile}`}>
                      <Phone className="h-5 w-5" />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {contact.telephone && (
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Telephone</label>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-gray-900 dark:text-white">{contact.telephone}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-primary"
                  >
                    <a href={`tel:${contact.telephone}`}>
                      <Phone className="h-5 w-5" />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {contact.email && (
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-gray-900 dark:text-white">{contact.email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-primary"
                  >
                    <a href={`mailto:${contact.email}`}>
                      <Mail className="h-5 w-5" />
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}