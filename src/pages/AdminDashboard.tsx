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

interface Company {
  id: string;
  company_name: string;
  address?: string;
  created_at?: string;
  phone?: string;
  email?: string;
  contact_name?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  telephone?: string;
  industry?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
}

interface NewCompany {
  company_name: string;
  address: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
  telephone: string;
  industry: string;
  website: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
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
    county: "",
    postcode: "",
    country: "",
    telephone: "",
    industry: "",
    website: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if we have a user and token
        if (!user || !user.token) {
          console.error("No user or token available", { user });
          setError("Authentication required. Please log in again.");
          setLoading(false);
          return;
        }
        
        console.log("Attempting to connect to API at /api/companies");
        console.log("User token available:", !!user.token);
        
        const response = await fetch('/api/companies', {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }).catch(err => {
          console.error("Fetch error details:", {
            message: err.message,
            name: err.name,
            stack: err.stack
          });
          throw err;
        });
        
        console.log("API Response received:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error response:", {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          
          if (response.status === 401) {
            setError("Authentication failed. Please log in again.");
            toast({
              title: "Authentication Error",
              description: "Your session may have expired. Please log in again.",
              variant: "destructive",
              duration: 5000
            });
          } else {
            setError(`Failed to fetch companies: ${response.status} ${errorText}`);
            toast({
              title: "Connection Error",
              description: `Failed to connect to backend (Status: ${response.status})`,
              variant: "destructive",
              duration: 5000
            });
          }
          
          throw new Error(`Failed to fetch companies: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Companies data received:", {
          count: data.length,
          firstCompany: data[0] ? data[0].company_name : 'No companies'
        });
        
        setCompanies(data);
        toast({
          title: "Connected to API",
          description: `Successfully loaded ${data.length} companies`,
          variant: "default",
          className: "bg-[#a6e15a] text-black border-none",
          duration: 3000
        });

      } catch (err) {
        console.error("Error fetching companies:", {
          error: err,
          message: err.message,
          type: err.name,
          stack: err.stack
        });
        
        if (!error) {
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
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [user?.token]);

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

      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        credentials: 'include',
        body: JSON.stringify(newCompany),
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
      
      setCompanies([...companies, addedCompany]);
      setIsAddModalOpen(false);
      setNewCompany({
        company_name: "",
        address: "",
        city: "",
        county: "",
        postcode: "",
        country: "",
        telephone: "",
        industry: "",
        website: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
      });

      toast({
        title: "Success",
        description: "Company added successfully",
        className: "bg-[#a6e15a] text-black border-none",
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
          <div className="text-gray-600 flex items-center">
            <span className="font-medium">Hello {user?.email?.split('@')[0] || 'Admin'}</span>
            <span className="mx-2">•</span>
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Manage Companies</h2>
              <Button 
                className="bg-[#a6e15a] hover:bg-[#95cc4f] text-white"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Button>
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
                      <TableHead className="text-right text-gray-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow 
                        key={company.id}
                        className="cursor-pointer hover:bg-gray-50"
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
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-[#6c8aec] hover:text-[#5a75d9] hover:bg-[#f8f9fc]">
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={newCompany.address}
                          onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={newCompany.city}
                          onChange={(e) => setNewCompany({ ...newCompany, city: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="county">County</Label>
                        <Input
                          id="county"
                          value={newCompany.county}
                          onChange={(e) => setNewCompany({ ...newCompany, county: e.target.value })}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={newCompany.country}
                          onChange={(e) => setNewCompany({ ...newCompany, country: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="telephone">Telephone</Label>
                        <Input
                          id="telephone"
                          type="tel"
                          value={newCompany.telephone}
                          onChange={(e) => setNewCompany({ ...newCompany, telephone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input
                          id="industry"
                          value={newCompany.industry}
                          onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          type="url"
                          value={newCompany.website}
                          onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="contact_name">Contact Name</Label>
                      <Input
                        id="contact_name"
                        value={newCompany.contact_name}
                        onChange={(e) => setNewCompany({ ...newCompany, contact_name: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="contact_email">Contact Email</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={newCompany.contact_email}
                          onChange={(e) => setNewCompany({ ...newCompany, contact_email: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="contact_phone">Contact Phone</Label>
                        <Input
                          id="contact_phone"
                          type="tel"
                          value={newCompany.contact_phone}
                          onChange={(e) => setNewCompany({ ...newCompany, contact_phone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-[#a6e15a] hover:bg-[#95cc4f] text-white">
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