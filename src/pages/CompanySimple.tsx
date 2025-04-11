import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Phone, Mail, FileText, Wrench, ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Notes } from "@/components/shared/Notes";

export function CompanySimple() {
  const { user, signOut } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get companyId from URL query parameter
  const searchParams = new URLSearchParams(window.location.search);
  const companyId = searchParams.get('id');

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) {
        console.error('No company ID provided in URL');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        console.log(`Fetching company data for ID: ${companyId}`);
        
        // Fetch company details
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();
          
        if (companyError) {
          console.error('Error fetching company:', companyError);
          setIsLoading(false);
          return;
        }
        
        if (!companyData) {
          console.error('No company found with ID:', companyId);
          setIsLoading(false);
          return;
        }
        
        console.log('Company data fetched successfully:', companyData);
        setCompany(companyData);
        
        // Fetch company contacts
        const { data: contactsData, error: contactsError } = await supabase
          .from('contacts')
          .select('*')
          .eq('company_id', companyId);
          
        if (contactsError) {
          console.error('Error fetching contacts:', contactsError);
        } else {
          console.log('Contacts fetched successfully:', contactsData);
          setContacts(contactsData || []);
        }
        
        // Fetch company equipment
        try {
          if (companyId === "0cd307a7-c938-49da-b005-17746587ca8a") {
            // Instead of using mock data for Acme, fetch from service_records
            console.log('Fetching service records for Acme');
            const { data: serviceRecords, error: serviceError } = await supabase
              .from('service_records')
              .select('*')
              .eq('company_id', companyId);
              
            if (serviceError) {
              console.error('Error fetching service records:', serviceError);
              setEquipment([]);
            } else if (serviceRecords && serviceRecords.length > 0) {
              console.log('Service records fetched successfully:', serviceRecords);
              
              // Convert service records to equipment format
              const equipmentItems: any[] = [];
              
              // Process all equipment fields from service_records 
              serviceRecords.forEach((record: any) => {
                // Process equipment1 through equipment8
                for (let i = 1; i <= 8; i++) {
                  const nameField = `equipment${i}_name` as keyof typeof record;
                  const serialField = `equipment${i}_serial` as keyof typeof record;
                  
                  if (record[nameField] && record[serialField]) {
                    equipmentItems.push({
                      id: `${record.id}-${i}`, // Create unique ID
                      name: record[nameField],
                      serial_number: record[serialField],
                      last_test_date: record.test_date,
                      next_test_date: record.retest_date,
                      status: getEquipmentStatus({
                        next_test_date: record.retest_date
                      })
                    });
                  }
                }
              });
              
              console.log('Converted equipment items:', equipmentItems);
              setEquipment(equipmentItems);
            } else {
              console.log('No service records found for Acme');
              setEquipment([]);
            }
          } else {
            // For other companies, try to fetch from the database
            const { data: equipmentData, error: equipmentError } = await supabase
              .from('equipment')
              .select(`
                *,
                equipment_types(*)
              `)
              .eq('company_id', companyId);
              
            if (equipmentError) {
              console.error('Error fetching equipment with company_id:', equipmentError);
              
              // Try fetching from service_records as fallback for all companies
              const { data: serviceRecords, error: serviceError } = await supabase
                .from('service_records')
                .select('*')
                .eq('company_id', companyId);
                
              if (serviceError) {
                console.error('Error fetching service records:', serviceError);
                setEquipment([]);
              } else if (serviceRecords && serviceRecords.length > 0) {
                console.log('Service records fetched successfully:', serviceRecords);
                
                // Convert service records to equipment format (same logic as above)
                const equipmentItems: any[] = [];
                
                // Process all equipment fields from service_records 
                serviceRecords.forEach((record: any) => {
                  // Process equipment1 through equipment8
                  for (let i = 1; i <= 8; i++) {
                    const nameField = `equipment${i}_name` as keyof typeof record;
                    const serialField = `equipment${i}_serial` as keyof typeof record;
                    
                    if (record[nameField] && record[serialField]) {
                      equipmentItems.push({
                        id: `${record.id}-${i}`, // Create unique ID
                        name: record[nameField],
                        serial_number: record[serialField],
                        last_test_date: record.test_date,
                        next_test_date: record.retest_date,
                        status: getEquipmentStatus({
                          next_test_date: record.retest_date
                        })
                      });
                    }
                  }
                });
                
                console.log('Converted equipment items from service records:', equipmentItems);
                setEquipment(equipmentItems);
              } else {
                console.log('No equipment or service records found');
                setEquipment([]);
              }
            } else if (equipmentData && equipmentData.length > 0) {
              console.log('Equipment fetched with company_id successfully:', equipmentData);
              setEquipment(equipmentData);
            } else {
              // Try service records as fallback if no equipment found
              const { data: serviceRecords, error: serviceError } = await supabase
                .from('service_records')
                .select('*')
                .eq('company_id', companyId);
                
              if (serviceError) {
                console.error('Error fetching service records:', serviceError);
                setEquipment([]);
              } else if (serviceRecords && serviceRecords.length > 0) {
                // Same conversion logic as above
                const equipmentItems: any[] = [];
                
                serviceRecords.forEach((record: any) => {
                  for (let i = 1; i <= 8; i++) {
                    const nameField = `equipment${i}_name` as keyof typeof record;
                    const serialField = `equipment${i}_serial` as keyof typeof record;
                    
                    if (record[nameField] && record[serialField]) {
                      equipmentItems.push({
                        id: `${record.id}-${i}`,
                        name: record[nameField],
                        serial_number: record[serialField],
                        last_test_date: record.test_date,
                        next_test_date: record.retest_date,
                        status: getEquipmentStatus({
                          next_test_date: record.retest_date
                        })
                      });
                    }
                  }
                });
                
                console.log('Converted equipment items from service records:', equipmentItems);
                setEquipment(equipmentItems);
              } else {
                console.log('No equipment found');
                setEquipment([]);
              }
            }
          }
        } catch (error) {
          console.error('Error processing equipment data:', error);
          setEquipment([]);
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
          <p className="text-lg">Loading company information...</p>
        </div>
      </div>
    );
  }

  // Show error state if no company found
  if (!company) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">Company Not Found</h2>
          <p>The company information could not be loaded. Please check the company ID and try again.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.href = "/dashboard"}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Calculate equipment status
  const today = new Date();
  
  // Function to determine equipment status
  const getEquipmentStatus = (item: any) => {
    if (!item.next_test_date) return 'unknown';
    
    const nextTestDate = new Date(item.next_test_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    if (nextTestDate < today) {
      return 'overdue';
    } else if (nextTestDate <= thirtyDaysFromNow) {
      return 'upcoming';
    } else {
      return 'valid';
    }
  };
  
  // Group equipment by status
  const equipmentByStatus = equipment.reduce((acc: any, item: any) => {
    const status = getEquipmentStatus(item);
    if (!acc[status]) acc[status] = [];
    acc[status].push(item);
    return acc;
  }, { valid: [], upcoming: [], overdue: [], unknown: [] });
  
  const validCount = equipmentByStatus.valid.length;
  const upcomingCount = equipmentByStatus.upcoming.length;
  const overdueCount = equipmentByStatus.overdue.length;
  const totalEquipment = equipment.length;

  return (
    <div className="bg-[#f5f5f5] min-h-screen -mt-6 -mx-4 px-4 pt-6 pb-20 md:pb-6">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{company.company_name}</h1>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
        
        {/* First row: Company Information and Equipment Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Company Information Card */}
          <Card className="bg-white shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start">
                  <Building className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-muted-foreground">
                      {company.address || 'No address provided'}
                    </p>
                  </div>
                </div>
                
                {company.phone && (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground">{company.phone}</p>
                    </div>
                  </div>
                )}
                
                {company.email && (
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">{company.email}</p>
                    </div>
                  </div>
                )}
                
                {company.phone && (
                  <div className="mt-4">
                    <WhatsAppButton 
                      phoneNumber={company.phone}
                      message={`Hello, I'm contacting you regarding your equipment at ${company.company_name}.`}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Equipment Status Card */}
          <Card className="bg-white shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Equipment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{validCount}</p>
                  <p className="text-sm text-green-700">Valid</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">{upcomingCount}</p>
                  <p className="text-sm text-yellow-700">Due Soon</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
                  <p className="text-sm text-red-700">Overdue</p>
                </div>
              </div>
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = "/dashboard/equipment"}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  View All Equipment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Second row: Notes and Upcoming Service */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notes Section */}
          <Card className="bg-white shadow-md">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Notes</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).toggleAddNote) {
                    (window as any).toggleAddNote();
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Note
              </Button>
            </CardHeader>
            <CardContent className="notes-container">
              <Notes 
                companyId={companyId || ''} 
                isAdmin={false}
                hideHeader={true}
              />
            </CardContent>
          </Card>
          
          {/* Upcoming Service Section */}
          <Card className="bg-white shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Upcoming Service</CardTitle>
            </CardHeader>
            <CardContent>
              {equipmentByStatus.upcoming.length > 0 || equipmentByStatus.overdue.length > 0 ? (
                <div className="space-y-4">
                  {equipmentByStatus.overdue.length > 0 && (
                    <div>
                      <h3 className="font-medium text-red-600 mb-2">Overdue</h3>
                      <div className="space-y-2">
                        {equipmentByStatus.overdue.map((item: any) => (
                          <div key={item.id} className="bg-red-50 p-3 rounded-md">
                            <div className="flex justify-between">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-red-600">
                                {new Date(item.next_test_date).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">S/N: {item.serial_number}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {equipmentByStatus.upcoming.length > 0 && (
                    <div>
                      <h3 className="font-medium text-yellow-600 mb-2">Due Soon</h3>
                      <div className="space-y-2">
                        {equipmentByStatus.upcoming.map((item: any) => (
                          <div key={item.id} className="bg-yellow-50 p-3 rounded-md">
                            <div className="flex justify-between">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-yellow-600">
                                {new Date(item.next_test_date).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">S/N: {item.serial_number}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No upcoming service needed
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 