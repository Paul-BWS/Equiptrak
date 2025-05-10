import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Phone, Mail, FileText, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
}

interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  manufacturer: string;
  model: string;
  location: string;
  last_service_date?: string;
  next_service_date?: string;
  status: string;
}

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user?.company_id) {
        toast({
          title: "Error",
          description: "No company associated with this user",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch company details
        const companyResponse = await fetch(`/api/companies/${user.company_id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!companyResponse.ok) {
          const errorText = await companyResponse.text();
          console.error("Company fetch error:", errorText);
          throw new Error(`Failed to fetch company data: ${companyResponse.status} ${errorText}`);
        }
        
        const companyData = await companyResponse.json();
        setCompany(companyData);
        
        // Fetch company equipment
        const equipmentResponse = await fetch(`/api/equipment?companyId=${user.company_id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!equipmentResponse.ok) {
          const errorText = await equipmentResponse.text();
          console.error("Equipment fetch error:", errorText);
          throw new Error(`Failed to fetch equipment data: ${equipmentResponse.status} ${errorText}`);
        }
        
        const equipmentData = await equipmentResponse.json();
        setEquipment(equipmentData);
      } catch (error) {
        console.error('Error fetching company data:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load company data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [user, navigate, toast]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">No Company Found</h1>
          <p className="text-muted-foreground">Please contact your administrator.</p>
          <Button onClick={handleLogout} variant="outline" className="mt-4">
            Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{company.company_name}</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {[company.address, company.city, company.county, company.postcode]
                .filter(Boolean)
                .join(", ")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {company.telephone || "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {equipment.length} items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Service Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View history
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="equipment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="equipment" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Equipment
          </TabsTrigger>
          <TabsTrigger value="service" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Service Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipment">
          <Card>
            <CardHeader>
              <CardTitle>Equipment List</CardTitle>
            </CardHeader>
            <CardContent>
              {equipment.length === 0 ? (
                <p className="text-muted-foreground">No equipment found.</p>
              ) : (
                <div className="space-y-4">
                  {equipment.map((item) => (
                    <div key={item.id} className="border p-4 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.manufacturer} {item.model}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            S/N: {item.serial_number}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Location: {item.location}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/equipment/${item.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service">
          <Card>
            <CardHeader>
              <CardTitle>Service Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Service history will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 