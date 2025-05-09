import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, User, Mail, Phone, Smartphone, Edit, Trash2, Plus, X, Save, ArrowLeft, Loader2, Globe, Wrench, ClipboardList, Users, MessageSquare, MessageCircle, NotepadText, Pencil, MapPin, CheckCircle, Clock, AlertTriangle, Image, Upload, ListFilter, Check, ClipboardCheck, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContactInfoCard } from "@/components/contacts/ContactInfoCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Notes, NotesRef } from '@/components/shared/Notes';
import { MapsProvider } from '@/contexts/MapsContext';
import { CompanyMap } from '@/components/maps/CompanyMap';
import { ServiceRecordsTable } from "@/components/service/components/ServiceRecordsTable";
import { EquipmentStatusCount } from "@/components/service/components/EquipmentStatusCount";
import { CompanyAllEquipmentTable } from "@/components/company/CompanyAllEquipmentTable";
import LogoUploader from '@/components/LogoUploader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import axios from "axios";

interface Company {
  id: string;
  company_name: string;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  telephone?: string;
  industry?: string;
  website?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at?: string;
  updated_at?: string;
  logo_url?: string;
}

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
  role?: 'user' | 'admin';
  password?: string;
  created_at?: string;
  updated_at?: string;
}

interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  next_test_date: string;
  status: "valid" | "expired" | "upcoming";
}

interface WorkOrder {
  id: string;
  work_order_number: string;
  job_tracker: string;
  date: string;
  status: string;
  description: string;
  total: number;
}

// Component for Notes Section
const NotesSection = ({ companyId, companyName }: { companyId: string, companyName: string }) => {
  const notesRef = useRef<NotesRef>(null);

  const handleAddNoteClick = () => {
    if (notesRef.current) {
      notesRef.current.toggleAddNote();
    }
  };

  return (
    <div className="flex-1 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex flex-row items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center">
            <MessageCircle className="mr-2 h-6 w-6 text-teal-500" />
            Notes
          </h2>
        </div>
        <Button
          onClick={handleAddNoteClick}
          className="bg-[#22c55e] hover:bg-opacity-90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>
      
      <Notes 
        ref={notesRef}
        companyId={companyId} 
        isAdmin={false}
        hideHeader={true}
      />
    </div>
  );
};

export default function CompanyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [equipmentCounts, setEquipmentCounts] = useState({
    valid: 0,
    upcoming: 0,
    expired: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Company>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    telephone: string;
    mobile: string;
    job_title: string;
    is_primary: boolean;
    has_system_access: boolean;
    role: 'user' | 'admin';
    password?: string;
  }>({
    first_name: '',
    last_name: '',
    email: '',
    telephone: '',
    mobile: '',
    job_title: '',
    is_primary: false,
    has_system_access: false,
    role: 'user'
  });
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isEditContactDialogOpen, setIsEditContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isUpdatingContact, setIsUpdatingContact] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'QUOTATION': 'bg-blue-500',
      'COMPLETED': 'bg-green-500',
      'AWAIT ATTEND': 'bg-orange-500',
      'AWAIT COMP': 'bg-purple-500',
      'AWAIT DEL': 'bg-indigo-500',
      'AWAIT SPARES': 'bg-red-500',
      'AWAIT ONO': 'bg-pink-500',
      'WORKSHOP': 'bg-cyan-500',
      'WARRANTY': 'bg-emerald-500',
      'ON HIRE': 'bg-teal-500',
      'BWS': 'bg-sky-500',
      'BACK ORDER': 'bg-amber-500',
      'DEBT LIST': 'bg-rose-500',
      'AWAIT RETURN': 'bg-violet-500',
      'PENDING': 'bg-yellow-500'
    };

    return (
      <Badge className={`${statusColors[status] || 'bg-gray-500'}`}>
        {status}
      </Badge>
    );
  };

  // Move fetchCompanyData outside useEffect
  const fetchCompanyData = async () => {
    if (!id || !user?.token) return;
    
    // Security check - verify user is authorized to access this company
    if (user.role !== 'admin' && user.company_id !== id) {
      console.error(`Unauthorized access: User ${user.email} (${user.role}) with company_id ${user.company_id} attempted to access company ${id}`);
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to view this company"
      });
      navigate('/dashboard');
      return;
    }
    
    try {
      setLoading(true);
      console.log(`Fetching company data for ID: ${id}`);
      
      const response = await fetch(`/api/companies/${id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", errorText);
        throw new Error(`Failed to fetch company data: ${response.status} ${errorText}`);
      }
      
      const companyData = await response.json();
      setCompany(companyData);
      setEditFormData(companyData);
      
      // Initialize empty arrays for contacts and equipment since endpoints don't exist yet
      setContacts([]);
      setEquipment([]);
      setEquipmentCounts({
        valid: 0,
        upcoming: 0,
        expired: 0
      });
      
      setError(null);
      
      // Fetch company contacts
      try {
        console.log(`Fetching contacts for company ID: ${id}`);
        const contactsResponse = await fetch(`/api/companies/${id}/contacts`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();
          console.log(`Retrieved ${contactsData.length} contacts for company`);
          setContacts(contactsData);
        } else {
          console.error("Error fetching contacts:", await contactsResponse.text());
        }
      } catch (contactErr) {
        console.error("Error fetching company contacts:", contactErr);
        // Don't set the main error state, as we still have the company data
      }
    } catch (err) {
      console.error("Error fetching company data:", err);
      setError("Failed to load company data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [id, user?.token]);

  const handleBackClick = () => {
    navigate('/admin');
  };

  const handleEditClick = () => {
    if (company) {
      setEditFormData(company);
      setIsEditDialogOpen(true);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCompany = async () => {
    if (!company || !editFormData.company_name || !user?.token) return;
    
    try {
      setIsSaving(true);
      console.log("Saving company data:", editFormData);
      
      const response = await fetch(`/api/companies/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(editFormData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to update company');
      }
      
      const updatedCompany = await response.json();
      setCompany(updatedCompany);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Company details updated successfully",
      });
    } catch (err) {
      console.error("Error saving company data:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update company details",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddContact = async () => {
    if (!id || !user?.token) return;
    
    setIsAddingContact(true);
    try {
      // Validate required fields
      if (!newContact.first_name || !newContact.last_name) {
        throw new Error('First name and last name are required');
      }

      // If system access is enabled, email is required
      if (newContact.has_system_access && !newContact.email) {
        throw new Error('Email is required for contacts with system access');
      }
      
      // If system access is enabled, role is required
      if (newContact.has_system_access && !newContact.role) {
        throw new Error('Role is required for contacts with system access');
      }
      
      // Create request payload with guaranteed role when system access is enabled
      const contactPayload = {
        ...newContact,
        company_id: id,
        role: newContact.has_system_access ? (newContact.role || 'user') : undefined
      };
      
      console.log('Sending contact creation request with data:', contactPayload);

      // Create the contact with all necessary information in a single call
      const response = await fetch(`/api/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(contactPayload),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create contact');
      }

      const data = await response.json();
      
      // If a password was generated, show it to the user
      if (data.generated_password) {
        toast({
          title: 'Contact Created',
          description: (
            <div className="space-y-2">
              <p>Contact created successfully.</p>
              <div className="p-2 bg-gray-100 rounded border">
                <p className="font-medium">Generated Password:</p>
                <code className="block bg-white p-1 rounded mt-1">
                  {data.generated_password}
                </code>
              </div>
              <p className="text-sm text-gray-500">
                Please save this password as it won't be shown again.
              </p>
            </div>
          ),
          duration: 20000 // Show for 20 seconds
        });
      } else {
        toast({
          title: 'Success',
          description: 'Contact created successfully'
        });
      }

      // Refresh contacts list
      const contactsResponse = await fetch(`/api/companies/${id}/contacts`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
        credentials: 'include'
      });
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        setContacts(contactsData);
      }

      // Reset form and close dialog
      setIsAddContactDialogOpen(false);
      setNewContact({
        first_name: '',
        last_name: '',
        email: '',
        telephone: '',
        mobile: '',
        job_title: '',
        is_primary: false,
        has_system_access: false,
        role: 'user'
      });
    } catch (error) {
      console.error('Error creating contact:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create contact',
        variant: 'destructive'
      });
    } finally {
      setIsAddingContact(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!user?.token) return;
    
    if (!confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      // Refresh contacts list
      const contactsResponse = await fetch(`/api/companies/${id}/contacts`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
        credentials: 'include'
      });
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        setContacts(contactsData);
      }

      toast({
        title: 'Success',
        description: 'Contact deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete contact',
        variant: 'destructive'
      });
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsEditContactDialogOpen(true);
  };

  const handleUpdateContact = async () => {
    if (!editingContact || !user?.token) return;
    
    setIsUpdatingContact(true);
    try {
      // Print what we're sending to help debug
      const updateData = {
        first_name: editingContact.first_name,
        last_name: editingContact.last_name,
        email: editingContact.email,
        telephone: editingContact.telephone,
        mobile: editingContact.mobile,
        job_title: editingContact.job_title,
        is_primary: editingContact.is_primary,
        has_system_access: editingContact.has_system_access,
        role: editingContact.role,
        password: editingContact.password,
        company_id: company.id
      };
      
      console.log('Updating contact with data:', updateData);
      
      const response = await fetch(`/api/contacts/${editingContact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(updateData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update contact');
      }

      const updatedContact = await response.json();
      
      // Update the contacts list with the new data
      setContacts(prev => prev.map(c => c.id === editingContact.id ? updatedContact : c));
      
      // If a password was generated, show it to the user
      if (updatedContact.generated_password) {
        toast({
          title: 'Contact Updated',
          description: (
            <div className="space-y-2">
              <p>Contact updated successfully with system access.</p>
              <div className="p-2 bg-gray-100 rounded border">
                <p className="font-medium">Generated Password:</p>
                <code className="block bg-white p-1 rounded mt-1">
                  {updatedContact.generated_password}
                </code>
              </div>
              <p className="text-sm text-gray-500">
                Please save this password as it won't be shown again.
              </p>
            </div>
          ),
          duration: 20000 // Show for 20 seconds
        });
      } else {
        toast({
          title: 'Success',
          description: 'Contact updated successfully'
        });
      }
      
      setIsEditContactDialogOpen(false);
      setEditingContact(null);
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update contact',
        variant: 'destructive'
      });
    } finally {
      setIsUpdatingContact(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!id || !user?.token) {
      toast({
        title: 'Error',
        description: 'You must be logged in to delete a company',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsDeleting(true);
      
      // Make the DELETE request
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': user.token.startsWith('Bearer ') ? user.token : `Bearer ${user.token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete company');
      }
      
      toast({
        title: 'Success',
        description: 'Company deleted successfully',
        variant: 'default'
      });
      
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete company',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Add fetchWorkOrders function
  const fetchWorkOrders = async () => {
    if (!id || !user?.token) return;
    
    try {
      const response = await axios.get(`/api/work-orders`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        params: {
          companyId: id
        }
      });
      
      if (response.data) {
        setWorkOrders(response.data);
      } else {
        throw new Error('Failed to fetch work orders');
      }
    } catch (err) {
      console.error('Error fetching work orders:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load work orders"
      });
    }
  };

  // Add useEffect to fetch work orders
  useEffect(() => {
    fetchWorkOrders();
  }, [id, user?.token]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="container mx-auto p-4">
        <Button variant="outline" onClick={handleBackClick} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="bg-destructive/15 p-4 rounded-md text-destructive">
          {error || "Company not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="outline" onClick={handleBackClick} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEditClick} className="border-gray-300 bg-white hover:bg-gray-50">
              <Edit className="mr-2 h-4 w-4" />
              Edit Details
            </Button>
            <Button variant="outline" onClick={handleDeleteClick} className="border-gray-300 bg-white hover:bg-gray-50">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-6xl">
        <Tabs defaultValue="details" className="mt-8">
          <div className="flex justify-center mb-20">
            <TabsList className="flex flex-wrap gap-2 md:gap-4 justify-center border-0 bg-transparent p-4 rounded-lg shadow-sm">
              <TabsTrigger 
                value="details" 
                className="flex flex-col items-center justify-center h-20 w-20 md:h-24 md:w-28 rounded-lg bg-white shadow-sm data-[state=active]:ring-2 data-[state=active]:ring-blue-500 hover:bg-gray-50"
              >
                <Building className="h-6 w-6 md:h-8 md:w-8 text-blue-500 mb-1 md:mb-2" />
                <span className="font-medium text-xs md:text-sm">Details</span>
              </TabsTrigger>
              <TabsTrigger 
                value="contacts" 
                className="flex flex-col items-center justify-center h-20 w-20 md:h-24 md:w-28 rounded-lg bg-white shadow-sm data-[state=active]:ring-2 data-[state=active]:ring-green-500 hover:bg-gray-50"
              >
                <User className="h-6 w-6 md:h-8 md:w-8 text-green-500 mb-1 md:mb-2" />
                <span className="font-medium text-xs md:text-sm">Contacts</span>
              </TabsTrigger>
              <TabsTrigger 
                value="jobs" 
                className="flex flex-col items-center justify-center h-20 w-20 md:h-24 md:w-28 rounded-lg bg-white shadow-sm data-[state=active]:ring-2 data-[state=active]:ring-orange-500 hover:bg-gray-50"
              >
                <ClipboardList className="h-6 w-6 md:h-8 md:w-8 text-orange-500 mb-1 md:mb-2" />
                <span className="font-medium text-xs md:text-sm">Work Orders</span>
              </TabsTrigger>
              <TabsTrigger 
                value="service" 
                className="flex flex-col items-center justify-center h-20 w-20 md:h-24 md:w-28 rounded-lg bg-white shadow-sm data-[state=active]:ring-2 data-[state=active]:ring-purple-500 hover:bg-gray-50"
              >
                <ClipboardList className="h-6 w-6 md:h-8 md:w-8 text-purple-500 mb-1 md:mb-2" />
                <span className="font-medium text-xs md:text-sm">Service</span>
              </TabsTrigger>
              <TabsTrigger 
                value="personnel" 
                className="flex flex-col items-center justify-center h-20 w-20 md:h-24 md:w-28 rounded-lg bg-white shadow-sm data-[state=active]:ring-2 data-[state=active]:ring-amber-500 hover:bg-gray-50"
              >
                <Users className="h-6 w-6 md:h-8 md:w-8 text-amber-500 mb-1 md:mb-2" />
                <span className="font-medium text-xs md:text-sm">Personnel</span>
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="flex flex-col items-center justify-center h-20 w-20 md:h-24 md:w-28 rounded-lg bg-white shadow-sm data-[state=active]:ring-2 data-[state=active]:ring-pink-500 hover:bg-gray-50"
              >
                <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-pink-500 mb-1 md:mb-2" />
                <span className="font-medium text-xs md:text-sm">Chat</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="mt-10">
            <TabsContent value="details" className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <Card className="flex-1 shadow-sm border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <LogoUploader
                        companyId={company.id}
                        logoUrl={company.logo_url}
                        onUploadComplete={(newLogoUrl) => {
                          // Update local state immediately for better UX
                          setCompany({
                            ...company,
                            logo_url: newLogoUrl
                          });
                          // Refresh all company data
                          fetchCompanyData();
                        }}
                        inline
                        size="sm"
                      />
                      <CardTitle className="flex items-center text-xl font-semibold">
                        {company.company_name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                      <div>
                        <Label className="text-muted-foreground text-sm">Company Name</Label>
                        <div className="font-medium mt-1">{company.company_name}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">Telephone</Label>
                        <div className="font-medium mt-1">
                          {company.telephone ? (
                            <a href={`tel:${company.telephone}`} className="text-primary hover:underline flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {company.telephone}
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">Address</Label>
                        <div className="font-medium mt-1">{company.address || "N/A"}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">City</Label>
                        <div className="font-medium mt-1">{company.city || "N/A"}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">County</Label>
                        <div className="font-medium mt-1">{company.county || "N/A"}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">Postcode</Label>
                        <div className="font-medium mt-1">{company.postcode || "N/A"}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">Country</Label>
                        <div className="font-medium mt-1">{company.country || "N/A"}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">Industry</Label>
                        <div className="font-medium mt-1">{company.industry || "N/A"}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">Website</Label>
                        <div className="font-medium mt-1">
                          {company.website ? (
                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                              <Globe className="h-4 w-4 mr-1" />
                              {company.website}
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">Contact Name</Label>
                        <div className="font-medium mt-1">{company.contact_name || "N/A"}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">Contact Email</Label>
                        <div className="font-medium mt-1">
                          {company.contact_email ? (
                            <a href={`mailto:${company.contact_email}`} className="text-primary hover:underline flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {company.contact_email}
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">Contact Phone</Label>
                        <div className="font-medium mt-1">
                          {company.contact_phone ? (
                            <a href={`tel:${company.contact_phone}`} className="text-primary hover:underline flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {company.contact_phone}
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium flex items-center">
                      <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                      Location
                    </h3>
                  </div>
                  <div className="p-0 h-[400px]">
                    <MapsProvider>
                      <CompanyMap 
                        address={[
                          company.address,
                          company.city,
                          company.county,
                          company.postcode,
                          company.country
                        ].filter(Boolean).join(', ')} 
                      />
                    </MapsProvider>
                  </div>
                </div>
              </div>

              {/* Notes Section (moved from tab) */}
              <NotesSection companyId={company.id} companyName={company.company_name} />
            </TabsContent>
            
            <TabsContent value="contacts" className="space-y-4">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex flex-row items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center">
                      <User className="mr-2 h-6 w-6 text-green-500" />
                      {company.company_name}
                    </h2>
                  </div>
                  <Button size="sm" onClick={() => setIsAddContactDialogOpen(true)} className="bg-[#22c55e] hover:bg-opacity-90 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Contact
                  </Button>
                </div>
                
                {contacts.length === 0 ? (
                  <p>No contacts found for this company.</p>
                ) : (
                  <ContactInfoCard 
                    contacts={contacts}
                    title=""
                    showHeader={false}
                    onEditContact={(contactId) => {
                      const contact = contacts.find(c => c.id === contactId);
                      if (contact) handleEditContact(contact);
                    }}
                    onDeleteContact={handleDeleteContact}
                  />
                )}
              </div>
            </TabsContent>
            
            {/* Jobs Tab */}
            <TabsContent value="jobs" className="space-y-4">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex flex-row items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center">
                      <ClipboardList className="mr-2 h-6 w-6 text-orange-500" />
                      Work Orders
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-[#22c55e] hover:bg-opacity-90 text-white"
                      onClick={() => navigate(`/work-orders/new?companyId=${id}`)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Work Order
                    </Button>
                  </div>
                </div>
                
                {/* Work Orders Table */}
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Work Order</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No work orders found. Click "Work Order" to create one.
                          </TableCell>
                        </TableRow>
                      ) : (
                        workOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>{order.work_order_number}</TableCell>
                            <TableCell>{format(new Date(order.date), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>
                              {getStatusBadge(order.status)}
                            </TableCell>
                            <TableCell className="max-w-md truncate">{order.description}</TableCell>
                            <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/work-orders/${order.work_order_number}/${id}`)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
            
            {/* Service Tab */}
            <TabsContent value="service" className="space-y-4">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex flex-row items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center">
                      <ClipboardList className="mr-2 h-6 w-6 text-purple-500" />
                      {company.company_name}
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-[#22c55e] hover:bg-opacity-90 text-white"
                      onClick={() => navigate(`/equipment-types?companyId=${id}`)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Equipment Types
                    </Button>
                  </div>
                </div>
                
                {/* Equipment Status Dashboard */}
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <h3 className="text-md font-semibold mb-4 flex items-center">
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Equipment Status
                    </h3>
                    
                    <div className="flex flex-row items-center justify-around text-center gap-4">
                      {/* Valid Equipment */}
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                          <Check className="h-6 w-6 text-green-500" />
                        </div>
                        <h3 className="text-sm font-medium">Valid</h3>
                        <p className="text-2xl font-bold mt-1">
                          <EquipmentStatusCount 
                            companyId={id} 
                            status="valid" 
                          />
                        </p>
                      </div>
                      
                      {/* Upcoming Equipment */}
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                          <Clock className="h-6 w-6 text-amber-500" />
                        </div>
                        <h3 className="text-sm font-medium">Upcoming</h3>
                        <p className="text-2xl font-bold mt-1">
                          <EquipmentStatusCount 
                            companyId={id} 
                            status="upcoming" 
                          />
                        </p>
                      </div>
                      
                      {/* Invalid Equipment */}
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                          <AlertTriangle className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-sm font-medium">Invalid</h3>
                        <p className="text-2xl font-bold mt-1">
                          <EquipmentStatusCount 
                            companyId={id} 
                            status="invalid" 
                          />
                        </p>
                      </div>
                    </div>

                    <p className="text-center text-gray-500 mt-4 text-xs">
                      Data from company equipment service records
                    </p>
                  </CardContent>
                </Card>
                
                {/* All Equipment List */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-semibold">All Equipment</h3>
                  </div>
                  <CompanyAllEquipmentTable companyId={id!} />
                </div>
              </div>
            </TabsContent>
            
            {/* Personnel Tab */}
            <TabsContent value="personnel" className="space-y-4">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex flex-row items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center">
                      <Users className="mr-2 h-6 w-6 text-amber-500" />
                      {company.company_name}
                    </h2>
                  </div>
                  <Button size="sm" className="bg-[#22c55e] hover:bg-opacity-90 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Personnel
                  </Button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 text-center">
                  <p className="text-gray-500">Manage personnel information, certifications, and training records for {company.company_name} staff.</p>
                </div>
              </div>
            </TabsContent>
            
            {/* Chat Tab */}
            <TabsContent value="chat" className="space-y-4">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex flex-row items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center">
                      <MessageSquare className="mr-2 h-6 w-6 text-pink-500" />
                      {company.company_name}
                    </h2>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg min-h-[400px] flex flex-col">
                  <div className="flex-1 mb-4 overflow-y-auto">
                    <div className="bg-gray-100 p-3 rounded-lg mb-2 max-w-[80%]">
                      <p className="text-sm font-medium">System</p>
                      <p>Welcome to the communication channel for {company.company_name}.</p>
                      <p className="text-xs text-gray-500 mt-1">Today, 9:30 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input placeholder="Type your message..." className="flex-1" />
                    <Button className="bg-[#22c55e] hover:bg-opacity-90 text-white">
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Company Details</DialogTitle>
              <DialogDescription>
                Make changes to the company information below
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={editFormData.company_name || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Telephone</Label>
                <Input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={editFormData.telephone || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={editFormData.address || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={editFormData.city || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  name="county"
                  value={editFormData.county || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  name="postcode"
                  value={editFormData.postcode || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={editFormData.country || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  name="industry"
                  value={editFormData.industry || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={editFormData.website || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input
                  id="contact_name"
                  name="contact_name"
                  value={editFormData.contact_name || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={editFormData.contact_email || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  value={editFormData.contact_phone || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCompany} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddContactDialogOpen} onOpenChange={setIsAddContactDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>
                Add a new contact to {company?.company_name}. Enable system access to allow them to log in.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddContact(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={newContact.first_name}
                    onChange={(e) => setNewContact(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={newContact.last_name}
                    onChange={(e) => setNewContact(prev => ({ ...prev, last_name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                    required={newContact.has_system_access}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={newContact.job_title}
                    onChange={(e) => setNewContact(prev => ({ ...prev, job_title: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telephone">Telephone</Label>
                  <Input
                    id="telephone"
                    value={newContact.telephone}
                    onChange={(e) => setNewContact(prev => ({ ...prev, telephone: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    id="mobile"
                    value={newContact.mobile}
                    onChange={(e) => setNewContact(prev => ({ ...prev, mobile: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="is_primary" 
                    checked={newContact.is_primary}
                    onCheckedChange={(checked) => setNewContact(prev => ({ ...prev, is_primary: checked as boolean }))}
                  />
                  <Label htmlFor="is_primary">Primary Contact</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="has_system_access" 
                    checked={newContact.has_system_access}
                    onCheckedChange={(checked) => {
                      const hasAccess = checked as boolean;
                      setNewContact(prev => ({ 
                        ...prev, 
                        has_system_access: hasAccess,
                        // Keep or set default role when enabling system access
                        role: hasAccess ? (prev.role || 'user') : 'user',
                        // Clear password if disabling system access
                        password: hasAccess ? prev.password : undefined
                      }));
                    }}
                  />
                  <Label htmlFor="has_system_access">Enable System Access</Label>
                </div>
                
                {newContact.has_system_access && (
                  <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select 
                        value={newContact.role || 'user'}
                        onValueChange={(value) => setNewContact(prev => ({ ...prev, role: value as 'user' | 'admin' }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role">
                            {newContact.role === 'user' ? 'User' : newContact.role === 'admin' ? 'Admin' : 'Select a role'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password (Optional)</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="password"
                          type="text"
                          value={newContact.password || ''}
                          onChange={(e) => setNewContact(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Leave empty to auto-generate"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        If left empty, a secure password will be generated automatically.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddContactDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-22c55e text-black hover:bg-opacity-90"
                  disabled={isAddingContact}
                >
                  {isAddingContact ? 'Adding...' : 'Add Contact'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditContactDialogOpen} onOpenChange={setIsEditContactDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Contact</DialogTitle>
              <DialogDescription>
                Edit contact information for {editingContact?.first_name} {editingContact?.last_name}
              </DialogDescription>
            </DialogHeader>
            
            {editingContact && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_first_name">First Name *</Label>
                  <Input
                    id="edit_first_name"
                    value={editingContact.first_name}
                    onChange={(e) => setEditingContact(prev => prev ? ({ ...prev, first_name: e.target.value }) : null)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit_last_name">Last Name *</Label>
                  <Input
                    id="edit_last_name"
                    value={editingContact.last_name}
                    onChange={(e) => setEditingContact(prev => prev ? ({ ...prev, last_name: e.target.value }) : null)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit_email">Email</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={editingContact.email || ''}
                    onChange={(e) => setEditingContact(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit_telephone">Telephone</Label>
                  <Input
                    id="edit_telephone"
                    type="tel"
                    value={editingContact.telephone || ''}
                    onChange={(e) => setEditingContact(prev => prev ? ({ ...prev, telephone: e.target.value }) : null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit_mobile">Mobile</Label>
                  <Input
                    id="edit_mobile"
                    type="tel"
                    value={editingContact.mobile || ''}
                    onChange={(e) => setEditingContact(prev => prev ? ({ ...prev, mobile: e.target.value }) : null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit_job_title">Job Title</Label>
                  <Input
                    id="edit_job_title"
                    value={editingContact.job_title || ''}
                    onChange={(e) => setEditingContact(prev => prev ? ({ ...prev, job_title: e.target.value }) : null)}
                  />
                </div>
                
                <div className="col-span-2 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_is_primary"
                      checked={editingContact.is_primary}
                      onCheckedChange={(checked) => 
                        setEditingContact(prev => prev ? ({ ...prev, is_primary: checked === true }) : null)
                      }
                    />
                    <Label htmlFor="edit_is_primary">Primary Contact</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_has_system_access"
                      checked={editingContact.has_system_access}
                      onCheckedChange={(checked) => {
                        const hasAccess = checked === true;
                        setEditingContact(prev => prev ? ({ 
                          ...prev, 
                          has_system_access: hasAccess,
                          // Explicitly set role to 'user' if enabling system access and no role is set
                          role: hasAccess ? (prev.role || 'user') : undefined
                        }) : null);
                      }}
                    />
                    <Label htmlFor="edit_has_system_access">Enable System Access</Label>
                  </div>
                  
                  {editingContact.has_system_access && (
                    <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                      <div className="space-y-2">
                        <Label htmlFor="edit_role">User Role *</Label>
                        <Select
                          value={editingContact.role || 'user'}
                          onValueChange={(value) => 
                            setEditingContact(prev => prev ? ({ ...prev, role: value as 'user' | 'admin' }) : null)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role">
                              {editingContact.role === 'user' ? 'User' : editingContact.role === 'admin' ? 'Admin' : 'User'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit_password">Password (Optional)</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="edit_password"
                            type="text"
                            value={editingContact.password || ''}
                            onChange={(e) => setEditingContact(prev => prev ? ({ ...prev, password: e.target.value }) : null)}
                            placeholder="Leave empty to auto-generate"
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          If left empty, a secure password will be generated automatically.
                          Only needed when enabling system access for existing contacts.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditContactDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateContact} disabled={isUpdatingContact}>
                {isUpdatingContact ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Contact'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the company
                "{company.company_name}" and all of its associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteCompany} 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}