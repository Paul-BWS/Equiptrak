import React, { useState, useMemo, useCallback } from 'react';
import { LogOut, Plus, Search, MapPin, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export interface Company {
  id: string;
  name: string;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
}

interface CompaniesListMobileProps {
  companies: Company[];
  onAdd?: () => void;
  onSelect?: (company: Company) => void;
}

const CompaniesListMobile: React.FC<CompaniesListMobileProps> = React.memo(({ companies, onAdd, onSelect }) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return companies.filter(c =>
      c.name.toLowerCase().includes(s) ||
      [c.address, c.city, c.county, c.postcode, c.country].filter(Boolean).join(' ').toLowerCase().includes(s)
    );
  }, [companies, search]);

  const handleCompanySelect = useCallback((company: Company) => {
    if (onSelect) onSelect(company);
  }, [onSelect]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [signOut, navigate]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#1D2125]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white dark:bg-[#1E2227] z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div 
            className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={handleLogout}
          >
            <LogOut className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Companies</h1>
          <div 
            className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={onAdd}
          >
            <Plus className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={handleSearchChange}
              className="pl-10 bg-gray-100 dark:bg-gray-800 border-0 h-12 text-base rounded-xl w-full 
                placeholder:text-gray-400 dark:placeholder:text-gray-500 
                focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 
                text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Companies List */}
      <div className="pt-32 px-4 pb-20">
        <div className="space-y-4">
          {filtered.map((company) => (
            <div
              key={company.id}
              className="bg-white dark:bg-[#1E2227] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 
                cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              onClick={() => handleCompanySelect(company)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-full">
                  <Building className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{company.name}</h3>
                  {(company.address || company.city || company.postcode) && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">
                        {[company.address, company.city, company.postcode]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

CompaniesListMobile.displayName = 'CompaniesListMobile';

export default CompaniesListMobile; 