import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, User, Mail, Phone, UserCircle, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddContactModal } from "./AddContactModal";
import { EditContactModal } from "./EditContactModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Link, useNavigate } from "react-router-dom";

interface Contact {
  id: string;
  company_id: string;
  name: string;
  position: string;
  telephone: string;
  mobile: string;
  email: string;
  is_user: boolean;
  has_system_access?: boolean;
}

interface ContactsTableProps {
  companyId: string;
}

export function ContactsTable({ companyId }: ContactsTableProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("company_id", companyId)
        .order("name");

      if (error) throw error;

      console.log("Fetched contacts:", data);
      setContacts(data || []);
    } catch (error: any) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [companyId]);

  const handleDelete = async () => {
    if (!deleteContactId) return;

    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", deleteContactId);

      if (error) throw error;

      setContacts((prev) => prev.filter((c) => c.id !== deleteContactId));

      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting contact:", error);
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Company Contacts</h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsAddModalOpen(true)} 
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 hidden"
            id="add-contact-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md border">
          <p className="text-muted-foreground">No contacts found</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id} className="bg-gray-50 hover:bg-gray-100 shadow-sm">
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.position || "-"}</TableCell>
                  <TableCell>
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        {contact.email}
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {contact.telephone ? (
                      <a
                        href={`tel:${contact.telephone}`}
                        className="flex items-center hover:underline"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        {contact.telephone}
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{contact.mobile || "-"}</TableCell>
                  <TableCell>
                    {(contact.has_system_access || contact.is_user) ? (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        <UserCircle className="h-3 w-3 mr-1" />
                        System User
                      </Badge>
                    ) : (
                      <Badge variant="outline">Contact Only</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingContact(contact)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteContactId(contact.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddContactModal
        companyId={companyId}
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={fetchContacts}
      />

      {editingContact && (
        <EditContactModal
          contact={editingContact}
          open={!!editingContact}
          onOpenChange={(open) => !open && setEditingContact(null)}
          onSuccess={fetchContacts}
        />
      )}

      <AlertDialog open={!!deleteContactId} onOpenChange={(open) => !open && setDeleteContactId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the contact. This action cannot be undone.
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