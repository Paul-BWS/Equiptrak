import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  ChevronLeft, 
  UserCircle, 
  Phone, 
  Mail, 
  Plus,
  Star,
  StarOff,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      if (!id || !user?.token) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/companies/${id}/contacts`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          const sortedContacts = data.sort((a: Contact, b: Contact) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return 0;
          });
          setContacts(sortedContacts);
        } else {
          throw new Error('Failed to fetch contacts');
        }
      } catch (error) {
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
      contact.email?.toLowerCase().includes(searchLower) ||
      contact.job_title?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50">
        <div className="flex items-center justify-between p-4">
          <div className="w-10 h-10 flex items-center justify-center bg-[#f0f2f5] rounded-full cursor-pointer"
               onClick={() => navigate(`/company/${id}`)}>
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </div>
          <h1 className="text-lg font-semibold">Contacts</h1>
          <div className="w-10 h-10" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 px-4 pb-6">
        {/* Search Bar */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Add Contact Button */}
        <button 
          className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-center space-x-2 text-[#7496da] hover:bg-[#7496da]/5 transition-colors mb-6"
          onClick={() => console.log('Add contact')}
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Add New Contact</span>
        </button>

        {/* Contacts List */}
        <div className="space-y-4">
          {filteredContacts.map((contact) => (
            <div key={contact.id} className="bg-white rounded-2xl p-6 shadow-sm">
              {/* Contact Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#7496da]/10 rounded-full flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-[#7496da]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {contact.first_name} {contact.last_name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {contact.is_primary && (
                        <span className="text-xs px-2 py-0.5 bg-[#7496da]/10 text-[#7496da] rounded-full font-medium">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => console.log('Edit')}>
                      Edit Contact
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => console.log('Toggle primary')}
                      className="text-[#7496da]"
                    >
                      {contact.is_primary ? 'Remove Primary' : 'Make Primary'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => console.log('Delete')}
                    >
                      Delete Contact
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                {contact.mobile && (
                  <div>
                    <label className="text-sm text-gray-500">Mobile Phone</label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-base">{contact.mobile}</span>
                      <a href={`tel:${contact.mobile}`}>
                        <Phone className="h-5 w-5 text-[#7496da]" />
                      </a>
                    </div>
                  </div>
                )}

                {contact.telephone && (
                  <div>
                    <label className="text-sm text-gray-500">Office Phone</label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-base">{contact.telephone}</span>
                      <a href={`tel:${contact.telephone}`}>
                        <Phone className="h-5 w-5 text-[#7496da]" />
                      </a>
                    </div>
                  </div>
                )}

                {contact.email && (
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-base">{contact.email}</span>
                      <a href={`mailto:${contact.email}`}>
                        <Mail className="h-5 w-5 text-[#7496da]" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 