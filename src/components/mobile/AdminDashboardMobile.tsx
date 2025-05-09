import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Building, Plus, Search, Bell, Settings, LogOut, MapPin, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: string;
  company_name: string;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  contacts?: {
    first_name?: string;
    last_name?: string;
    firstName?: string;
    lastName?: string;
    mobile?: string;
    mobilePhone?: string;
    telephone?: string;
    officePhone?: string;
    email: string;
    postcode: string;
    is_primary?: boolean;
    isPrimaryContact?: boolean;
    job_title?: string;
    jobTitle?: string;
  }[];
}

export function AdminDashboardMobile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies', {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCompanies(data);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast({
          title: "Error",
          description: "Failed to load companies",
          variant: "destructive",
        });
      }
    };

    fetchCompanies();
  }, [user?.token, toast]);

  const filteredCompanies = companies.filter(company =>
    company.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50">
        <div className="flex items-center justify-between p-4">
          <div className="w-10 h-10 flex items-center justify-center bg-[#f0f2f5] rounded-full cursor-pointer">
            <Menu className="h-6 w-6 text-gray-600" />
          </div>
          <h1 className="text-lg font-semibold">Companies</h1>
          <div className="w-10 h-10 flex items-center justify-center bg-[#f0f2f5] rounded-full cursor-pointer"
               onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-6 w-6 text-[#a6e15a]" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#f0f2f5] border-0 h-12 text-base rounded-xl w-full placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 px-4 pb-20">
        <div className="space-y-4">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/company/${company.id}`)}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#e8eeff] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building className="h-6 w-6 text-[#7496da]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{company.company_name}</h3>
                  {(company.address || company.city || company.county || company.postcode) && (
                    <div className="flex items-start space-x-2 text-gray-500">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div className="text-sm truncate">
                        {company.address && <span>{company.address}, </span>}
                        {company.city && <span>{company.city}, </span>}
                        {company.county && <span>{company.county}, </span>}
                        {company.postcode && <span>{company.postcode}</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-2 px-4 z-50">
        <div className="flex flex-col items-center cursor-pointer" onClick={handleSignOut}>
          <LogOut className="h-6 w-6 text-gray-600" />
          <span className="text-xs mt-1 text-gray-600">Sign Out</span>
        </div>
        <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate("/admin-reminders")}>
          <Bell className="h-6 w-6 text-gray-600" />
          <span className="text-xs mt-1 text-gray-600">Reminders</span>
        </div>
        <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate("/settings")}>
          <Settings className="h-6 w-6 text-gray-600" />
          <span className="text-xs mt-1 text-gray-600">Settings</span>
        </div>
      </div>
    </div>
  );
} 