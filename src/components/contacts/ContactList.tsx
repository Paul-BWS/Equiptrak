import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ContactForm } from './ContactForm';
import { SingleContactView } from './SingleContactView';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  mobile: string;
  job_title: string;
  is_primary: boolean;
  has_system_access?: boolean;
  created_at: string;
  updated_at: string;
}

interface ContactListProps {
  companyId: string;
}

export function ContactList({ companyId }: ContactListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { toast } = useToast();
  
  // Load contacts on mount and when companyId changes
  useEffect(() => {
    if (companyId) {
      fetchContacts();
    }
  }, [companyId]);
  
  // Fetch contacts from API
  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/contacts?companyId=${companyId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contacts. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle edit contact
  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditDialogOpen(true);
  };
  
  // Handle delete contact
  const handleDeleteContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDeleteDialogOpen(true);
  };
  
  // Confirm delete contact
  const confirmDeleteContact = async () => {
    if (!selectedContact) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/contacts/${selectedContact.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }
      
      toast({
        title: 'Success',
        description: 'Contact deleted successfully',
        variant: 'default'
      });
      
      // Refresh contacts list
      fetchContacts();
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      setSelectedContact(null);
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete contact. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Contacts</h2>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-a6e15a text-black hover:bg-opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <p>Loading contacts...</p>
      ) : contacts.length === 0 ? (
        <p>No contacts found. Add your first contact!</p>
      ) : (
        <div className="space-y-2">
          {contacts.map(contact => (
            <div key={contact.id}>
              <SingleContactView
                id={contact.id}
                first_name={contact.first_name}
                last_name={contact.last_name}
                job_title={contact.job_title}
                email={contact.email}
                telephone={contact.telephone}
                mobile={contact.mobile}
                is_primary={contact.is_primary}
                has_system_access={contact.has_system_access}
                onEdit={() => handleEditContact(contact)}
                onDelete={() => handleDeleteContact(contact)}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Add Contact Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <ContactForm 
            companyId={companyId}
            onSuccess={() => {
              setIsAddDialogOpen(false);
              fetchContacts();
            }}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <ContactForm 
              companyId={companyId}
              initialData={selectedContact}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedContact(null);
                fetchContacts();
              }}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedContact(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Contact Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
          </DialogHeader>
          <div className="mb-6">
            <p>Are you sure you want to delete this contact? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteContact}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}