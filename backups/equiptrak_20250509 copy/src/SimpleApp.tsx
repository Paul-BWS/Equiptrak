import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Phone, ExternalLink, Loader2, Building, User, Briefcase, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";

const queryClient = new QueryClient();

// Simple Login component
function SimpleLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Attempting login for:', email);
      
      // Sign in the user using your SQL Server authentication
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('Login response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }
      
      if (!data.user || !data.token || typeof data.user.role !== 'string') {
        throw new Error('Invalid response from server');
      }
      
      // Call the signIn function from AuthContext with the user data and token
      await signIn({
        ...data.user,
        token: data.token
      });
      
      console.log('User signed in, role:', data.user.role);
      
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });

      // Redirect based on role
      if (data.user.role === 'admin') {
        console.log('Redirecting to admin dashboard');
        navigate('/admin');
      } else {
        console.log('Redirecting to user dashboard');
        navigate('/dashboard');
      }
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
          
          {/* Contact buttons */}
          <div className="mt-8 space-y-4">
            <a 
              href="https://www.basicwelding.co.uk" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center text-[#7b96d4]">
                <ExternalLink className="h-5 w-5 mr-3" />
                <span className="font-medium">Need spares or repairs?</span>
              </div>
            </a>
            
            <div className="grid grid-cols-2 gap-4">
              <a 
                href="tel:01612231843" 
                className="flex items-center justify-center px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <Phone className="h-5 w-5 mr-3 text-[#7b96d4]" />
                <span className="text-gray-700">0161 223 1843</span>
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
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.email}</h2>
          {/* Add your dashboard content here */}
        </div>
      </div>
    </div>
  );
}

// Admin Dashboard component
function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    // Fetch companies from your API
    const fetchCompanies = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/companies', {
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
      }
    };

    if (user?.token) {
      fetchCompanies();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Companies</h2>
          <div className="grid gap-4">
            {companies.map((company: any) => (
              <div key={company.id} className="border p-4 rounded-lg">
                <h3 className="font-medium">{company.company_name}</h3>
                <p className="text-sm text-gray-600">{company.address}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App component
export default function SimpleApp() {
  return (
    <Router>
      <ThemeProvider defaultTheme="light" storageKey="equiptrak-theme">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<SimpleLogin />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/" element={<SimpleLogin />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Router>
  );
}

// Add ProtectedRoute component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('No user found, redirecting to login');
      navigate('/');
      return;
    }

    if (!isLoading && user && requiredRole) {
      console.log('Checking role:', user.role, 'Required:', requiredRole);
      if (user.role !== requiredRole) {
        console.log('Wrong role, redirecting');
        navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      }
    }
  }, [user, isLoading, requiredRole, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
} 