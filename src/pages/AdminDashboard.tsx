import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, LogOut, Plus, Search, ChevronRight, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

interface Company {
  id: string;
  company_name: string;  // Primary company name field
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  telephone?: string;
  email?: string;
  website?: string;
  company_type?: string;
  status?: string;
  credit_rating?: string;
  site_address?: string;
  billing_address?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  industry?: string;
  company_status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface NewCompany {
  company_name: string;
  address: string;
  city: string;
  postcode: string;
  telephone: string;
  email: string;
}

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState<NewCompany>({
    company_name: "",
    address: "",
    city: "",
    postcode: "",
    telephone: "",
    email: ""
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user token exists
        if (!user?.token) {
          console.error('No authentication token available');
          setError('No authentication token available. Please login again.');
          toast({
            title: "Authentication Error",
            description: "Please login again to continue",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }
        
        console.log('Fetching companies from API with auth token...');
        const response = await fetch('/api/companies', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Companies fetched successfully:', data);
          setCompanies(data);
        } else {
          console.error('Failed to fetch companies from API, status:', response.status);
          const errorMessage = `Failed to fetch companies (Status: ${response.status})`;
          setError(errorMessage);
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error("Error fetching companies:", {
          error: err,
          message: err.message,
          type: err.name,
          stack: err.stack
        });
        
        const errorMessage = err.message.includes('Failed to fetch') 
          ? 'Cannot connect to the backend server. Please check if the server is running.'
          : 'Failed to load companies. Please try again later.';
          
        setError(errorMessage);
        toast({
          title: "Connection Error",
          description: errorMessage,
          variant: "destructive",
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleCompanyClick = (companyId: string) => {
    navigate(`/company/${companyId}`);
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Attempting to add company:", newCompany);
      
      if (!user?.token) {
        throw new Error('No authentication token available');
      }

      // Create payload with company_name for the API
      const payload = {
        company_name: newCompany.company_name,
        address: newCompany.address,
        city: newCompany.city,
        postcode: newCompany.postcode,
        telephone: newCompany.telephone,
        email: newCompany.email,
        // Set status to Active by default
        status: 'Active'
      };

      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      console.log("Add company response:", {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to add company:", {
          status: response.status,
          error: errorText
        });
        throw new Error(`Failed to add company: ${errorText}`);
      }

      const addedCompany = await response.json();
      console.log("Successfully added company:", addedCompany);
      
      // Add company_name for UI compatibility
      const companyWithDisplayName = {
        ...addedCompany,
        company_name: addedCompany.company_name || addedCompany.name || ''
      };
      
      setCompanies([...companies, companyWithDisplayName]);
      setIsAddModalOpen(false);
      setNewCompany({
        company_name: "",
        address: "",
        city: "",
        postcode: "",
        telephone: "",
        email: ""
      });

      toast({
        title: "Success",
        description: "Company added successfully",
      });
    } catch (error: any) {
      console.error('Error adding company:', {
        error,
        message: error.message,
        stack: error.stack
      });
      
      toast({
        title: "Error",
        description: error.message || "Failed to add company. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  const filteredCompanies = companies.filter(company =>
    company && company.company_name && 
    company.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <div className="flex items-center">
            <div className="text-gray-600 items-center mr-4 hidden sm:flex">
              <span className="font-medium">Hello {user?.email?.split('@')[0] || 'Admin'}</span>
              <span className="mx-2">•</span>
              <span>{new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <Button 
              className="bg-white sm:bg-[#21c15b] hover:bg-gray-100 sm:hover:bg-[#21c15b]/90 text-[#21c15b] sm:text-white border border-[#21c15b]"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Company</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Manage Companies</h2>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50"
              />
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6c8aec] border-r-transparent" />
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md text-red-600">
                {error}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-100">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-gray-600">Company Name</TableHead>
                      <TableHead className="text-gray-600">Address</TableHead>
                      <TableHead className="text-gray-600">Added Date</TableHead>
                      <TableHead className="text-right text-gray-600 hidden sm:table-cell">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow 
                        key={company.id}
                        className="cursor-pointer hover:bg-gray-50 hover:shadow-md transition-shadow"
                        onClick={() => handleCompanyClick(company.id)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Building className="mr-2 h-4 w-4 text-[#6c8aec]" />
                            {company.company_name}
                          </div>
                        </TableCell>
                        <TableCell>{company.address || "No address provided"}</TableCell>
                        <TableCell>
                          {new Date(company.created_at || Date.now()).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[#6c8aec] hover:text-[#5a75d9] hover:bg-[#f8f9fc]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompanyClick(company.id);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Shopify Integration card has been removed from here */}
            </div>

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Company</DialogTitle>
                  <DialogDescription>
                    Enter the company details below
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCompany}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="company_name">Company Name *</Label>
                      <Input
                        id="company_name"
                        value={newCompany.company_name}
                        onChange={(e) => setNewCompany({ ...newCompany, company_name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={newCompany.address}
                        onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={newCompany.city}
                          onChange={(e) => setNewCompany({ ...newCompany, city: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="postcode">Postcode</Label>
                        <Input
                          id="postcode"
                          value={newCompany.postcode}
                          onChange={(e) => setNewCompany({ ...newCompany, postcode: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="telephone">Telephone</Label>
                      <Input
                        id="telephone"
                        value={newCompany.telephone}
                        onChange={(e) => setNewCompany({ ...newCompany, telephone: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={newCompany.email}
                        onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      className="bg-[#22c55e] hover:bg-opacity-90 text-white"
                    >
                      Add Company
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
} 