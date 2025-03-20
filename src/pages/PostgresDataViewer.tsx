import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// API base URL
const API_BASE_URL = 'http://localhost:3001';

interface Company {
  id: string;
  company_name: string;
  address: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
  updated_at: string;
}

interface Contact {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  mobile: string;
  job_title: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export default function PostgresDataViewer() {
  const [activeTab, setActiveTab] = useState('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (activeTab === 'companies') {
      fetchCompanies();
    } else if (activeTab === 'contacts') {
      fetchContacts();
    }
  }, [activeTab]);

  const fetchCompanies = async () => {
    setIsLoadingCompanies(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/companies`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to load companies from PostgreSQL. Make sure the API server is running.');
      toast({
        title: 'Error',
        description: 'Failed to load companies from PostgreSQL',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const fetchContacts = async () => {
    setIsLoadingContacts(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/contacts`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to load contacts from PostgreSQL. Make sure the API server is running.');
      toast({
        title: 'Error',
        description: 'Failed to load contacts from PostgreSQL',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const refreshData = () => {
    if (activeTab === 'companies') {
      fetchCompanies();
    } else if (activeTab === 'contacts') {
      fetchContacts();
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center">
            <Database className="h-6 w-6 mr-2 text-primary" />
            <CardTitle>PostgreSQL Data Viewer</CardTitle>
          </div>
          <Button onClick={refreshData} variant="outline">Refresh Data</Button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
              <p className="mt-2 text-sm">
                To fix this, make sure the API server is running with:
                <br />
                <code className="bg-gray-100 p-1 rounded">node src/server/api.js</code>
              </p>
            </div>
          )}
          
          <p className="mb-4 text-sm text-muted-foreground">
            This page displays data directly from your PostgreSQL database via an API. Any changes made to the database will be reflected here.
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="mb-4">
              <TabsTrigger value="companies">Companies</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="companies">
              <Card>
                <CardHeader>
                  <CardTitle>Companies Table</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingCompanies ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : companies.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 px-4 text-left">Name</th>
                            <th className="py-2 px-4 text-left">Address</th>
                            <th className="py-2 px-4 text-left">Contact Name</th>
                            <th className="py-2 px-4 text-left">Contact Email</th>
                            <th className="py-2 px-4 text-left">Contact Phone</th>
                            <th className="py-2 px-4 text-left">Created At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {companies.map((company) => (
                            <tr key={company.id} className="border-b hover:bg-muted/50">
                              <td className="py-2 px-4">{company.company_name}</td>
                              <td className="py-2 px-4">{company.address}</td>
                              <td className="py-2 px-4">{company.contact_name}</td>
                              <td className="py-2 px-4">{company.contact_email}</td>
                              <td className="py-2 px-4">{company.contact_phone}</td>
                              <td className="py-2 px-4">{new Date(company.created_at).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-8">No companies found in the database.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="contacts">
              <Card>
                <CardHeader>
                  <CardTitle>Contacts Table</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingContacts ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : contacts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 px-4 text-left">Name</th>
                            <th className="py-2 px-4 text-left">Email</th>
                            <th className="py-2 px-4 text-left">Phone</th>
                            <th className="py-2 px-4 text-left">Mobile</th>
                            <th className="py-2 px-4 text-left">Job Title</th>
                            <th className="py-2 px-4 text-left">Primary</th>
                            <th className="py-2 px-4 text-left">Company ID</th>
                            <th className="py-2 px-4 text-left">Created At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contacts.map((contact) => (
                            <tr key={contact.id} className="border-b hover:bg-muted/50">
                              <td className="py-2 px-4">{`${contact.first_name} ${contact.last_name}`}</td>
                              <td className="py-2 px-4">{contact.email}</td>
                              <td className="py-2 px-4">{contact.telephone}</td>
                              <td className="py-2 px-4">{contact.mobile}</td>
                              <td className="py-2 px-4">{contact.job_title}</td>
                              <td className="py-2 px-4">{contact.is_primary ? 'Yes' : 'No'}</td>
                              <td className="py-2 px-4">{contact.company_id}</td>
                              <td className="py-2 px-4">{new Date(contact.created_at).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-8">No contacts found in the database.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 