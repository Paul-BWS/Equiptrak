import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, User, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddContactModal } from "./AddContactModal";
import { EditContactModal } from "./EditContactModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Contact {
  id: string;
  company_id: string;
  name: string;
  position?: string;
  telephone?: string;
  mobile?: string;
  email?: string;
  is_user: boolean;
}

interface ContactsListProps {
  companyId: string;
}

export function ContactsList({ companyId }: ContactsListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("company_id", companyId)
        .order("name");

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load contacts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [companyId]);

  const handleDelete = async () => {
    if (!deleteContactId) return;

    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", deleteContactId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });

      fetchContacts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete contact",
        variant: "destructive",
      });
    } finally {
      setDeleteContactId(null);
    }
  };

  if (isLoading && contacts.length === 0) {
    return <div>Loading contacts...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Contacts</h2>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#a6e15a] hover:bg-[#95cc4f] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border">
          <p className="text-gray-500">No contacts found for this company</p>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            variant="link"
            className="mt-2"
          >
            Add your first contact
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <Card key={contact.id} className="overflow-hidden shadow-sm">
              <CardContent className="p-0">
                <div className="p-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 flex-wrap">
                        <h3 className="font-medium text-lg">{contact.name}</h3>
                        {contact.position && (
                          <p className="text-sm text-gray-500">{contact.position}</p>
                        )}
                        
                        {/* Contact details in single line */}
                        <div className="flex items-center space-x-4 flex-wrap">
                          {contact.email && (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-gray-400 mr-2" />
                              <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:underline">
                                {contact.email}
                              </a>
                            </div>
                          )}
                          {contact.telephone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              <a href={`tel:${contact.telephone}`} className="text-sm">
                                {contact.telephone}
                              </a>
                            </div>
                          )}
                          {contact.mobile && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              <a href={`tel:${contact.mobile}`} className="text-sm">
                                {contact.mobile} (Mobile)
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {contact.is_user && (
                      <Badge className="bg-blue-100 text-blue-800">User</Badge>
                    )}
                  </div>
                </div>
                
                <div className="border-t flex">
                  <Button 
                    variant="ghost" 
                    className="flex-1 rounded-none text-blue-600"
                    onClick={() => setEditingContact(contact)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <div className="border-l h-10" />
                  <Button 
                    variant="ghost" 
                    className="flex-1 rounded-none text-red-600"
                    onClick={() => setDeleteContactId(contact.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Contact Modal */}
      <AddContactModal
        companyId={companyId}
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={fetchContacts}
      />

      {/* Edit Contact Modal */}
      {editingContact && (
        <EditContactModal
          contact={editingContact}
          open={!!editingContact}
          onOpenChange={(open) => !open && setEditingContact(null)}
          onSuccess={fetchContacts}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteContactId} onOpenChange={(open) => {
        if (!open) setDeleteContactId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this contact. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 