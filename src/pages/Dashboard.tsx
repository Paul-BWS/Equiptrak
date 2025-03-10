import { useState, useEffect } from "react";
import { CustomerList } from "@/components/CustomerList";
import { Button } from "@/components/ui/button";
import { Plus, Building, User, Phone, Mail } from "lucide-react";
import { CustomerDialogs } from "@/components/CustomerDialogs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const { user } = useAuth();
  const [userCompany, setUserCompany] = useState<any>(null);
  const [companyContacts, setCompanyContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user has a company_id and redirect to company page
  useEffect(() => {
    if (user?.user_metadata?.company_id) {
      const companyId = user.user_metadata.company_id;
      console.log('User has company_id in metadata, redirecting to company page:', companyId);
      navigate(`/admin/customer/${companyId}`);
      return;
    }
    
    // Continue with normal dashboard loading if no company_id in metadata
  }, [user, navigate]);

  useEffect(() => {
    const fetchUserCompanyData = async () => {
      if (!user?.email) return;
      
      console.log('Dashboard: Fetching company data for user:', user.email);
      setIsLoading(true);
      
      try {
        // First check if company_id exists in user metadata
        const companyIdFromMetadata = user.user_metadata?.company_id;
        let companyId = null;
        
        if (companyIdFromMetadata) {
          console.log('Dashboard: Found company_id in user metadata:', companyIdFromMetadata);
          companyId = companyIdFromMetadata;
        } else {
          console.log('Dashboard: No company_id in user metadata, checking contacts table');
          
          // Try to find the contact with this email
          const { data: contactData, error: contactError } = await supabase
            .from('contacts')
            .select('id, company_id, user_id')
            .eq('email', user.email)
            .single();
            
          console.log('Dashboard: Contact data:', contactData, 'Error:', contactError);
            
          if (contactError) {
            console.error('Error fetching contact:', contactError);
            
            // If no contact found, check if user is an admin
            if (user.user_metadata?.role === 'admin') {
              console.log('Dashboard: User is admin but no contact found, showing admin dashboard');
              return; // Show the default admin dashboard
            }
            
            return;
          }
          
          if (!contactData?.company_id) {
            console.log('No company associated with this user');
            return;
          }
          
          companyId = contactData.company_id;
          
          // If contact exists but user_id is not set, update it
          if (contactData && !contactData.user_id) {
            console.log('Dashboard: Updating contact with user_id:', user.id);
            const { error: updateError } = await supabase
              .from('contacts')
              .update({ 
                user_id: user.id,
                is_user: true,
                has_user_access: true
              })
              .eq('id', contactData.id);
              
            if (updateError) {
              console.error('Error updating contact with user_id:', updateError);
            }
          }
        }
        
        if (!companyId) {
          console.log('No company ID found for user');
          return;
        }
        
        console.log('Dashboard: Using company_id:', companyId);
        
        // Fetch company details
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();
          
        console.log('Dashboard: Company data:', companyData, 'Error:', companyError);
        
        if (companyError) {
          console.error('Error fetching company:', companyError);
          return;
        }
        
        setUserCompany(companyData);
        
        // Fetch company contacts
        const { data: contactsData, error: contactsError } = await supabase
          .from('contacts')
          .select('*')
          .eq('company_id', companyId);
          
        if (contactsError) {
          console.error('Error fetching contacts:', contactsError);
          return;
        }
        
        setCompanyContacts(contactsData || []);
      } catch (error) {
        console.error('Error in fetchUserCompanyData:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserCompanyData();
  }, [user]);

  // If user is associated with a company, show company-specific dashboard
  if (userCompany) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{userCompany.name}</h1>
            <p className="text-muted-foreground">Welcome to your company dashboard</p>
          </div>
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
                    <span><strong>Name:</strong> {userCompany.name}</span>
                  </div>
                  {userCompany.address && (
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span><strong>Address:</strong> {userCompany.address}</span>
                    </div>
                  )}
                  {userCompany.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span><strong>Phone:</strong> {userCompany.phone}</span>
                    </div>
                  )}
                  {userCompany.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span><strong>Email:</strong> {userCompany.email}</span>
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
                {companyContacts.length === 0 ? (
                  <p>No contacts found</p>
                ) : (
                  <div className="space-y-4">
                    {companyContacts.map((contact) => (
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
                <p>No equipment found for this company.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Default dashboard for users not associated with a company
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Customers</h2>
          <Button 
            onClick={() => setIsAddCustomerOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
        
        <CustomerList />
      </div>

      <CustomerDialogs.Create
        open={isAddCustomerOpen} 
        onOpenChange={setIsAddCustomerOpen} 
      />
    </div>
  );
}