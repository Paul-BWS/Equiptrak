import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Phone, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CompanyDashboard() {
  const { companyId } = useParams();
  const { user, signOut } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) return;
      
      setIsLoading(true);
      
      try {
        // Fetch company details
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();
          
        if (companyError) {
          console.error('Error fetching company:', companyError);
          return;
        }
        
        setCompany(companyData);
        
        // Fetch company contacts
        const { data: contactsData, error: contactsError } = await supabase
          .from('contacts')
          .select('*')
          .eq('company_id', companyId);
          
        if (contactsError) {
          console.error('Error fetching contacts:', contactsError);
        } else {
          setContacts(contactsData || []);
        }
        
        // Fetch company equipment
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('*')
          .eq('company_id', companyId);
          
        if (equipmentError) {
          console.error('Error fetching equipment:', equipmentError);
        } else {
          setEquipment(equipmentData || []);
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCompanyData();
  }, [companyId]);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-6">Loading company data...</div>;
  }

  if (!company) {
    return <div className="container mx-auto py-6">Company not found</div>;
  }

  // Calculate equipment status
  const today = new Date();
  const validEquipment = equipment.filter(item => {
    if (!item.next_service) return true;
    const nextService = new Date(item.next_service);
    return nextService > today;
  });
  
  const upcomingService = equipment.filter(item => {
    if (!item.next_service) return false;
    const nextService = new Date(item.next_service);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return nextService <= thirtyDaysFromNow && nextService > today;
  });
  
  const overdueService = equipment.filter(item => {
    if (!item.next_service) return false;
    const nextService = new Date(item.next_service);
    return nextService <= today;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{company.company_name}</h1>
          <p className="text-muted-foreground">Welcome to your company dashboard</p>
        </div>
        <Button variant="destructive" onClick={handleLogout}>Log Out</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valid Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validEquipment.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingService.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueService.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipment.length}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span><strong>Name:</strong> {company.company_name}</span>
                </div>
                {company.address && (
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span><strong>Address:</strong> {company.address}</span>
                  </div>
                )}
                {company.telephone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span><strong>Phone:</strong> {company.telephone}</span>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span><strong>Email:</strong> {company.email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <p>No contacts found</p>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="border-b pb-3">
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {contact.position && <div>{contact.position}</div>}
                        {contact.email && (
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                              {contact.email}
                            </a>
                          </div>
                        )}
                        {contact.telephone && (
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            <a href={`tel:${contact.telephone}`} className="hover:underline">
                              {contact.telephone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              {equipment.length === 0 ? (
                <p>No equipment found for this company.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-left">Serial Number</th>
                        <th className="p-2 text-left">Last Service</th>
                        <th className="p-2 text-left">Next Service</th>
                        <th className="p-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipment.map((item) => {
                        // Determine status
                        let status = "Valid";
                        let statusColor = "text-green-600";
                        
                        if (item.next_service) {
                          const nextService = new Date(item.next_service);
                          const thirtyDaysFromNow = new Date();
                          thirtyDaysFromNow.setDate(today.getDate() + 30);
                          
                          if (nextService <= today) {
                            status = "Overdue";
                            statusColor = "text-red-600";
                          } else if (nextService <= thirtyDaysFromNow) {
                            status = "Upcoming";
                            statusColor = "text-amber-600";
                          }
                        }
                        
                        return (
                          <tr key={item.id} className="border-b">
                            <td className="p-2">{item.name || 'Unnamed Equipment'}</td>
                            <td className="p-2">{item.type || 'N/A'}</td>
                            <td className="p-2">{item.serial_number || 'N/A'}</td>
                            <td className="p-2">
                              {item.last_service ? new Date(item.last_service).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="p-2">
                              {item.next_service ? new Date(item.next_service).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className={`p-2 font-medium ${statusColor}`}>
                              {status}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CompanyDashboard; 