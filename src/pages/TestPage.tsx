import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function TestPage() {
  const navigate = useNavigate();
  const acmeCompanyId = '0cd307a7-c938-49da-b005-17746587ca8a';
  
  const handleDirectNavigation = () => {
    console.log('Direct navigation to Acme company page');
    navigate(`/admin/customer/${acmeCompanyId}`);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Routing Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Test Links</h2>
          <div className="flex flex-col gap-2">
            <Link to={`/admin/customer/${acmeCompanyId}`} className="text-blue-600 hover:underline">
              Link to Acme Company Page
            </Link>
            
            <Link to="/admin" className="text-blue-600 hover:underline">
              Link to Admin Dashboard
            </Link>
            
            <Link to="/dashboard" className="text-blue-600 hover:underline">
              Link to User Dashboard
            </Link>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Test Buttons</h2>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDirectNavigation} className="bg-blue-600 hover:bg-blue-700">
              Navigate to Acme Company
            </Button>
            
            <Button onClick={() => navigate('/admin')} variant="outline">
              Navigate to Admin
            </Button>
            
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Navigate to Dashboard
            </Button>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-100 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
          <p><strong>Acme Company ID:</strong> {acmeCompanyId}</p>
          <p><strong>Current Path:</strong> {window.location.pathname}</p>
        </div>
      </div>
    </div>
  );
} 