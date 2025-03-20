import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import db from '@/lib/db';

interface Company {
  id: string;
  company_name: string;
  address: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
  telephone: string;
  website: string;
  industry: string;
  created_at: string;
  updated_at: string;
}

export default function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    company_name: '',
    address: '',
    city: '',
    county: '',
    postcode: '',
    country: 'United Kingdom',
    telephone: '',
    website: '',
    industry: ''
  });

  // Load companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Fetch companies from database
  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const data = await db.query<Company>(`
        SELECT * FROM companies 
        ORDER BY company_name ASC
      `);
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load companies. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.company_name) {
        throw new Error('Company name is required');
      }

      // Insert new company
      const result = await db.query<{ id: string }>(`
        INSERT INTO companies (
          company_name, address, city, county, postcode, 
          country, telephone, website, industry
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        ) RETURNING id
      `, [
        formData.company_name,
        formData.address,
        formData.city,
        formData.county,
        formData.postcode,
        formData.country,
        formData.telephone,
        formData.website,
        formData.industry
      ]);

      if (result && result.length > 0) {
        const newCompanyId = result[0].id;
        
        // Show success message
        toast({
          title: 'Success',
          description: 'Company added successfully!',
          variant: 'default'
        });

        // Reset form
        setFormData({
          company_name: '',
          address: '',
          city: '',
          county: '',
          postcode: '',
          country: 'United Kingdom',
          telephone: '',
          website: '',
          industry: ''
        });

        // Refresh companies list
        fetchCompanies();

        // Navigate to the new company page
        navigate(`/admin/customer/${newCompanyId}`);
      }
    } catch (error) {
      console.error('Error adding company:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add company. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Company Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Company</CardTitle>
            <CardDescription>
              Enter the details of the new company
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="county">County</Label>
                  <Input
                    id="county"
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    placeholder="Enter county"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleChange}
                    placeholder="Enter postcode"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Enter country"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telephone">Telephone</Label>
                <Input
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="Enter telephone number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Enter website URL"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="Enter industry"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-a6e15a text-black hover:bg-opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Company'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Companies</CardTitle>
              <CardDescription>
                Recently added companies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <p>Loading companies...</p>
                ) : companies.length === 0 ? (
                  <p>No companies found. Add your first company!</p>
                ) : (
                  <div className="space-y-2">
                    {companies.slice(0, 10).map(company => (
                      <div 
                        key={company.id} 
                        className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/admin/customer/${company.id}`)}
                      >
                        <h3 className="font-medium">{company.company_name}</h3>
                        <p className="text-sm text-gray-500">
                          {[company.city, company.county, company.postcode].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={fetchCompanies}
                disabled={isLoading}
              >
                Refresh List
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 