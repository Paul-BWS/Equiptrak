import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface Company {
  id: string;
  company_name: string;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
}

export default function CompaniesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!user?.token) return;

      try {
        const response = await fetch('/api/companies', {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }

        const data = await response.json();
        setCompanies(data);
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast({
          title: "Error",
          description: "Failed to load companies",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [user?.token, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="fixed top-0 left-0 right-0 bg-white z-50">
        <div className="p-4">
          <h1 className="text-lg font-semibold">Companies</h1>
        </div>
      </div>

      <div className="pt-16 px-4 pb-6">
        <div className="space-y-4">
          {companies.map((company) => (
            <div
              key={company.id}
              onClick={() => navigate(`/mobile/companies/${company.id}`)}
              className="bg-white rounded-xl p-4 shadow-sm cursor-pointer"
            >
              <h2 className="text-lg font-medium mb-2">{company.company_name}</h2>
              {company.address && (
                <p className="text-sm text-gray-500">
                  {[company.address, company.city, company.county, company.postcode]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 