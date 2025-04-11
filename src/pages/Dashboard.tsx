import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Building, Calendar, Clock, List, ClipboardList, MessageCircle, Plus } from "lucide-react";
import { Notes } from "@/components/shared/Notes";
import LogoUploader from '@/components/LogoUploader';

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
  logo_url?: string;
}

interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  manufacturer: string;
  model: string;
  last_service_date?: string;
  next_service_date?: string;
  status: string;
  location?: string;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  date: string;
}

// Define the NotesRef interface to match the one in the Notes component
interface NotesRef {
  toggleAddNote: () => void;
  reloadNotes: () => void;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add reference for notes component
  const notesRef = useRef<NotesRef>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      // If user doesn't have a company_id, they shouldn't be here
      if (!user?.company_id) {
        setError("No company associated with your account.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching user's company with company_id:", user.company_id);
        
        // Fetch company details
        const companyResponse = await fetch(`/api/companies/${user.company_id}`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!companyResponse.ok) {
          const errorText = await companyResponse.text();
          console.error("Error response:", errorText);
          throw new Error(`Failed to fetch company: ${companyResponse.status} ${errorText}`);
        }
        
        const companyData = await companyResponse.json();
        setCompany(companyData);
        
        // Note: Equipment and activities endpoints appear to be unavailable
        // Using empty arrays for now so UI still works
        setEquipment([]);
        setActivities([]);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load your company information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.company_id, user?.token]);

  const handleCompanyClick = (companyId: string) => {
    navigate(`/company/${companyId}`);
  };
  
  const handleEquipmentClick = () => {
    if (company) {
      navigate(`/company/${company.id}/equipment`);
    }
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
  
  // Get equipment requiring service soon (next 30 days)
  const getUpcomingServices = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return equipment.filter(item => {
      if (!item.next_service_date) return false;
      const serviceDate = new Date(item.next_service_date);
      return serviceDate >= today && serviceDate <= thirtyDaysFromNow;
    });
  };
  
  const upcomingServices = getUpcomingServices();

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.first_name || user?.email}
          </p>
        </div>
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
        <div className="space-y-6">
          {/* Company Logo Banner */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                {company && (
                  <LogoUploader
                    companyId={company.id}
                    logoUrl={company.logo_url}
                    onUploadComplete={(logoUrl) => {
                      setCompany({
                        ...company,
                        logo_url: logoUrl
                      });
                    }}
                    inline
                    size="sm"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold">{company.company_name}</h1>
                  <p className="text-muted-foreground">{getFormattedAddress(company)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  {company && (
                    <LogoUploader
                      companyId={company.id}
                      logoUrl={company.logo_url}
                      onUploadComplete={(logoUrl) => {
                        setCompany({
                          ...company,
                          logo_url: logoUrl
                        });
                      }}
                      inline
                      size="sm"
                    />
                  )}
                  <div>
                    <CardTitle className="flex items-center">
                      {company.company_name}
                    </CardTitle>
                    <CardDescription>
                      {getFormattedAddress(company)}
                    </CardDescription>
                  </div>
                </div>
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
            
            {/* Equipment Status Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <ClipboardList className="mr-2 h-5 w-5 text-primary" />
                  Equipment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center px-4">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-green-500 w-16 h-16 flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Valid</span>
                    <span className="text-2xl font-bold">0</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-amber-500 w-16 h-16 flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Upcoming</span>
                    <span className="text-2xl font-bold">0</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-red-500 w-16 h-16 flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Invalid</span>
                    <span className="text-2xl font-bold">0</span>
                  </div>
                </div>
                <p className="text-sm text-center text-muted-foreground mt-4">
                  Data from company equipment service records
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Notes Section */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5 text-primary" />
                  Notes
                </CardTitle>
                <Button 
                  onClick={() => notesRef.current?.toggleAddNote()}
                  className="bg-a6e15a text-black hover:bg-opacity-90"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Notes 
                ref={notesRef}
                companyId={company.id} 
                isAdmin={false}
                hideHeader={true}
              />
            </CardContent>
          </Card>
          
          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activities</p>
              ) : (
                <div className="space-y-2">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex justify-between border-b pb-2">
                      <div>
                        <p className="text-sm font-medium">{activity.type}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
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