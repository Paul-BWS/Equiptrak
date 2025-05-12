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
import { useTheme } from "@/components/theme-provider";

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
  const { theme } = useTheme();
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
        console.log('Fetching contacts for company ID:', id);
        const response = await fetch(`/api/companies/${id}/contacts`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Received contacts data:', data);
          const sortedContacts = data.sort((a: Contact, b: Contact) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return 0;
          });
          console.log('Sorted contacts:', sortedContacts);
          setContacts(sortedContacts);
        } else {
          console.error('Failed to fetch contacts:', response.status);
          throw new Error('Failed to fetch contacts');
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: "Error",
          description: "Failed to load contacts. Please try again.",
          variant: "destructive",
        });
        setContacts([]);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-card z-50 border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            className="hover:bg-accent"
            onClick={() => navigate(`/mobile/company/${id}`)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
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
            className="w-full bg-card"
          />
        </div>

        {/* Add Contact Button */}
        <Button 
          variant={theme === 'dark' ? 'dark' : 'light'}
          className="w-full rounded-2xl p-4 flex items-center justify-center space-x-2 mb-6"
          onClick={() => console.log('Add contact')}
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Add New Contact</span>
        </Button>

        {/* Contacts List */}
        <div className="space-y-4">
          {filteredContacts.length === 0 ? (
            <div className="bg-card rounded-2xl p-6 text-center text-muted-foreground border border-border">
              {contacts.length === 0 ? (
                "No contacts found. Add your first contact!"
              ) : (
                "No contacts match your search."
              )}
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div key={contact.id} className="bg-card rounded-2xl p-6 border border-border">
                {/* Contact Header */}
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="flex items-center space-x-4 flex-1 cursor-pointer"
                    onClick={() => navigate(`/mobile/company/${id}/contacts/${contact.id}`)}
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{contact.first_name} {contact.last_name}</h3>
                        {contact.is_primary && (
                          <span className="bg-[#a6e15a] text-black text-xs px-2 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      {contact.job_title && (
                        <p className="text-sm text-muted-foreground">{contact.job_title}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/mobile/company/${id}/contacts/${contact.id}`)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => console.log('Delete contact')} className="text-destructive">
                        Delete Contact
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {contact.mobile && (
                    <Button
                      variant="outline"
                      asChild
                      className="flex items-center justify-center space-x-2"
                    >
                      <a href={`tel:${contact.mobile}`}>
                        <Phone className="h-5 w-5 text-primary" />
                        <span>Call Mobile</span>
                      </a>
                    </Button>
                  )}
                  {contact.email && (
                    <Button
                      variant="outline"
                      asChild
                      className="flex items-center justify-center space-x-2"
                    >
                      <a href={`mailto:${contact.email}`}>
                        <Mail className="h-5 w-5 text-primary" />
                        <span>Send Email</span>
                      </a>
                    </Button>
                  )}
                </div>

                {/* Contact Details */}
                <div className="space-y-4">
                  {contact.mobile && (
                    <div>
                      <label className="text-sm text-muted-foreground">Mobile Phone</label>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-base">{contact.mobile}</span>
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
                      <label className="text-sm text-muted-foreground">Telephone</label>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-base">{contact.telephone}</span>
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
                      <label className="text-sm text-muted-foreground">Email</label>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-base">{contact.email}</span>
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
            ))
          )}
        </div>
      </div>
    </div>
  );
} 