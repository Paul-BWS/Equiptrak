import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Key } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EnableUserAccess } from "./EnableUserAccess";

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  role: z.string().min(1, "Role is required"),
});

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  mobile: string | null;
  role: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  has_user_access: boolean;
}

interface ContactListProps {
  companyId?: string;
}

export function ContactList({ companyId }: ContactListProps) {
  const queryClient = useQueryClient();
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      mobile: "",
      role: "",
    },
  });

  const editForm = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: selectedContact?.name || "",
      email: selectedContact?.email || "",
      phone: selectedContact?.phone || "",
      mobile: selectedContact?.mobile || "",
      role: selectedContact?.role || "",
    },
  });

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["contacts", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("company_id", companyId)
        .order("name");

      if (error) {
        toast.error("Error fetching contacts: " + error.message);
        throw error;
      }

      return data as Contact[];
    },
    enabled: !!companyId,
  });

  const onSubmit = async (values: z.infer<typeof contactFormSchema>) => {
    try {
      const { error } = await supabase.from("contacts").insert({
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        mobile: values.mobile || null,
        role: values.role,
        company_id: companyId,
      });

      if (error) throw error;

      toast.success("Contact added successfully");
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setIsAddingContact(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const onEditSubmit = async (values: z.infer<typeof contactFormSchema>) => {
    if (!selectedContact) return;
    
    try {
      const { error } = await supabase
        .from("contacts")
        .update({
          name: values.name,
          email: values.email,
          phone: values.phone || null,
          mobile: values.mobile || null,
          role: values.role,
        })
        .eq("id", selectedContact.id);

      if (error) throw error;

      toast.success("Contact updated successfully");
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setIsEditingContact(false);
      setSelectedContact(null);
      editForm.reset();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEditClick = (e: React.MouseEvent, contact: Contact) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedContact(contact);
    editForm.reset({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || "",
      mobile: contact.mobile || "",
      role: contact.role,
    });
    setIsEditingContact(true);
  };

  const showStoredCredentials = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('stored_password')
        .eq('email', email)
        .single();

      if (error) throw error;

      if (data?.stored_password) {
        toast("Login Credentials", {
          description: `Email: ${email}\nPassword: ${data.stored_password}\n\nPlease save these details!`,
          duration: 30000,
        });
      } else {
        toast.error("No password found for this user.");
      }
    } catch (error: any) {
      console.error('Error fetching credentials:', error);
      toast.error("Could not retrieve credentials");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Company Contacts</h3>
        <Button onClick={() => setIsAddingContact(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Add Contact</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditingContact} onOpenChange={setIsEditingContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Update Contact</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Access</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : contacts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No contacts found
                </TableCell>
              </TableRow>
            ) : (
              contacts?.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>{contact.mobile}</TableCell>
                  <TableCell>{contact.role}</TableCell>
                  <TableCell>
                    <EnableUserAccess 
                      contact={contact}
                      onSuccess={() => queryClient.invalidateQueries({ queryKey: ["contacts", companyId] })}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEditClick(e, contact)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {contact.has_user_access && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => showStoredCredentials(contact.email)}
                          title="Show login credentials"
                        >
                          <Key className="h-4 w-4 text-blue-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}