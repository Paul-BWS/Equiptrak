import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CompaniesListMobile from '@/components/mobile/CompaniesListMobile';
import { useToast } from '@/hooks/use-toast';

interface Company {
  id: string;
  name: string;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
}

export default function CompaniesListMobilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchCompanies = useCallback(async () => {
    if (!user?.token) return;

    try {
      const response = await fetch('/api/companies', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Transform the data to match the expected format
        const formattedCompanies = data.map((company: any) => ({
          id: company.id,
          name: company.company_name,
          address: company.address,
          city: company.city,
          county: company.county,
          postcode: company.postcode,
          country: company.country || 'England'
        }));
        setCompanies(formattedCompanies);
      } else {
        console.error('Failed to load companies:', response.status);
        toast({
          title: 'Error',
          description: 'Failed to load companies',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load companies',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user?.token, toast]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Memoize the handlers to prevent unnecessary re-renders
  const handleAdd = useCallback(() => {
    navigate('/mobile/companies/add');
  }, [navigate]);

  const handleSelect = useCallback((company: Company) => {
    navigate(`/mobile/company/${company.id}`);
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  return (
    <CompaniesListMobile
      companies={companies}
      onAdd={handleAdd}
      onSelect={handleSelect}
    />
  );
} 