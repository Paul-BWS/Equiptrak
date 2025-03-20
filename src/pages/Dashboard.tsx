import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Building, LogOut } from "lucide-react";

interface Company {
  id: string;
  company_name: string;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  telephone?: string;
  website?: string;
  created_at?: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserCompany = async () => {
      // If user doesn't have a company_id, they shouldn't be here
      if (!user?.company_id) {
        setError("No company associated with your account.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching user's company with company_id:", user.company_id);
        
        const response = await fetch(`/api/companies/${user.company_id}`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        console.log("Company response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`Failed to fetch company: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Company data received:", data);
        setCompany(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching company:", err);
        setError("Failed to load your company information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserCompany();
  }, [user?.company_id, user?.token]);

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

  const getFormattedAddress = (company: Company) => {
    if (!company) return "No address provided";
    
    const parts = [
      company.address,
      company.city,
      company.county,
      company.postcode,
      company.country
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(", ") : "No address provided";
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.first_name || user?.email}
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-destructive/15 p-4 rounded-md text-destructive">
          {error}
        </div>
      ) : company ? (
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5 text-primary" />
                {company.company_name}
              </CardTitle>
              <CardDescription>
                {getFormattedAddress(company)}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                {company.telephone && (
                  <p className="text-sm">📞 {company.telephone}</p>
                )}
                {company.website && (
                  <p className="text-sm">🌐 {company.website}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Added: {new Date(company.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="default" 
                className="w-full bg-a6e15a text-black hover:bg-opacity-90"
                onClick={() => handleCompanyClick(company.id)}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="bg-amber-100 p-4 rounded-md text-amber-800">
          No company information found for your account.
        </div>
      )}
    </div>
  );
}