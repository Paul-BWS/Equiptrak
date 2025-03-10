import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Phone, ExternalLink, Loader2, Building, User, Briefcase, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const queryClient = new QueryClient();

// Simple Login component
function SimpleLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Sign in the user
      await signIn(email, password);
      
      // Get the current session to access user metadata
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        throw error;
      }
      
      if (!session) {
        throw new Error('No session after login');
      }
      
      // Check user role and metadata
      const userRole = session.user.user_metadata?.role;
      const companyId = session.user.user_metadata?.company_id;
      
      console.log('User logged in:', {
        email: session.user.email,
        role: userRole,
        companyId: companyId
      });
      
      // Redirect based on role
      if (userRole === 'admin') {
        window.location.href = '/admin';
        return;
      }
      
      // If user has company_id, redirect to company dashboard
      if (companyId) {
        window.location.href = `/company?id=${companyId}`;
        return;
      }
      
      // If no company_id found in metadata, try to find it in the contacts table
      if (!companyId && session.user.email) {
        const { data: contactData, error: contactError } = await supabase
          .from('contacts')
          .select('company_id')
          .eq('email', session.user.email)
          .single();
          
        if (!contactError && contactData?.company_id) {
          // Update user metadata with company_id for future logins
          await supabase.auth.updateUser({
            data: { company_id: contactData.company_id }
          });
          
          // Redirect to company dashboard
          window.location.href = `/company?id=${contactData.company_id}`;
          return;
        }
      }
      
      // Fallback for users without company_id
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left side - Image and company info - hidden on mobile */}
      <div className="hidden md:flex bg-[#7b96d4] text-white p-8 flex-col justify-between md:w-1/2">
        <div className="flex-grow flex items-center justify-center">
          <img 
            src="/lovable-uploads/robot.png" 
            alt="Equipment Tracking Robot" 
            className="max-w-full max-h-80 object-contain"
          />
        </div>
      </div>
      
      {/* Right side - Login form - full width on mobile */}
      <div className="p-8 flex flex-col justify-center w-full md:w-1/2">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-[#7b96d4]">EquipTrack</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#7b96d4] hover:bg-[#6a85c3] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <a 
              href="/admin-login" 
              className="text-blue-600 hover:underline"
            >
              Admin Login
            </a>
          </div>
          
          {/* Contact buttons */}
          <div className="mt-8 space-y-4">
            <a 
              href="https://www.basicwelding.co.uk" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-between px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center text-[#7b96d4]">
                <ExternalLink className="h-5 w-5 mr-3" />
                <span className="font-medium">Need spares or repairs?</span>
              </div>
              <span className="text-[#7b96d4]">Visit basicwelding.co.uk</span>
            </a>
            
            <div className="grid grid-cols-2 gap-4">
              <a 
                href="tel:01612231843" 
                className="flex items-center justify-center px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <Phone className="h-5 w-5 mr-3 text-[#7b96d4]" />
                <span className="text-gray-700">0161 223 1843</span>
              </a>
              
              <a 
                href="mailto:support@basicwelding.co.uk" 
                className="flex items-center justify-center px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <Mail className="h-5 w-5 mr-3 text-[#7b96d4]" />
                <span className="text-gray-700">Email Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard component
function Dashboard() {
  const { user, signOut } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  
  useEffect(() => {
    // Check if user has company_id and redirect if needed
    if (user && !redirecting) {
      const companyId = user.user_metadata?.company_id;
      if (companyId) {
        setRedirecting(true);
        window.location.href = `/company?id=${companyId}`;
      }
    }
  }, [user, redirecting]);
  
  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  if (redirecting) {
    return <div className="p-8">Redirecting to company dashboard...</div>;
  }
  
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.email}</h2>
        <p className="mb-4">You don't have a company assigned to your account.</p>
        <p>Please contact your administrator to get access to your company dashboard.</p>
      </div>
    </div>
  );
}

// Company Dashboard component
function CompanyDashboard() {
  const { user, signOut } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get company ID from URL
  const searchParams = new URLSearchParams(window.location.search);
  const companyId = searchParams.get('id');
  
  useEffect(() => {
    async function fetchData() {
      if (!companyId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();
          
        if (error) throw error;
        setCompany(data);
      } catch (error) {
        console.error('Error fetching company:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [companyId]);
  
  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  if (isLoading) {
    return <div className="p-8">Loading company data...</div>;
  }
  
  if (!company) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Company Not Found</h1>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p>The company you're looking for doesn't exist or you don't have access to it.</p>
          <Button 
            onClick={() => window.location.href = '/dashboard'} 
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{company.company_name}</h1>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Company Information</h2>
          <div className="space-y-3">
            {company.address && (
              <div className="flex items-start">
                <Building className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                <div>
                  <p>{company.address}</p>
                  {company.city && <p>{company.city}</p>}
                  {company.postcode && <p>{company.postcode}</p>}
                </div>
              </div>
            )}
            
            {company.telephone && (
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-gray-500" />
                <p>{company.telephone}</p>
              </div>
            )}
            
            {company.email && (
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-gray-500" />
                <p>{company.email}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Account</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-gray-500" />
              <p>{user?.email}</p>
            </div>
            
            {user?.user_metadata?.role && (
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-gray-500" />
                <p>Role: {user.user_metadata.role}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Equipment</h2>
        <p>Your equipment information will be displayed here.</p>
        <Button 
          onClick={() => window.location.href = `/equipment?companyId=${companyId}`}
          className="mt-4"
        >
          View Equipment
        </Button>
      </div>
    </div>
  );
}

// Admin Dashboard component
function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('company_name');
          
        if (error) throw error;
        setCompanies(data || []);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCompanies();
  }, []);
  
  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Companies</h2>
        
        {isLoading ? (
          <div className="text-center py-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <p>No companies found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map(company => (
              <div key={company.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-lg mb-2">{company.company_name}</h3>
                
                {company.address && (
                  <div className="flex items-start mb-2 text-sm">
                    <Building className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                    <span>{company.address}</span>
                  </div>
                )}
                
                <div className="mt-4">
                  <a 
                    href={`/company?id=${company.id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Main App component
export default function SimpleApp() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  // Update current path when URL changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);
  
  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        return;
      }
      
      setIsAuthenticated(true);
      
      // Check if user is admin
      const userRole = session.user.user_metadata?.role;
      setIsAdmin(userRole === 'admin');
    }
    
    checkAuth();
  }, []);
  
  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  
  // Render the appropriate component based on the current path
  const renderContent = () => {
    // Public routes
    if (currentPath === '/' || currentPath === '/login') {
      return isAuthenticated ? (
        <Dashboard />
      ) : (
        <SimpleLogin />
      );
    }
    
    // Protected routes
    if (currentPath === '/dashboard') {
      return isAuthenticated ? <Dashboard /> : <SimpleLogin />;
    }
    
    if (currentPath === '/company') {
      return isAuthenticated ? <CompanyDashboard /> : <SimpleLogin />;
    }
    
    if (currentPath === '/admin') {
      return (isAuthenticated && isAdmin) ? <AdminDashboard /> : <SimpleLogin />;
    }
    
    // Default: redirect to home
    window.location.href = '/';
    return null;
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            {renderContent()}
          </div>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
} 