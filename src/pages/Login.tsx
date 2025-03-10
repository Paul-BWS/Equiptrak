import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Phone, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, setUser } = useAuth();
  const { toast } = useToast();
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState('');

  // Debug: Log when component mounts and when user changes
  useEffect(() => {
    console.log("Login component mounted");
    
    return () => {
      console.log("Login component unmounted");
    };
  }, []);
  
  useEffect(() => {
    console.log("Current user state:", user, "Redirecting:", redirecting);
    
    // If user is already logged in, redirect based on role
    if (user && !redirecting) {
      console.log("User already logged in, checking metadata:", user.user_metadata);
      const userRole = user.user_metadata?.role;
      const companyId = user.user_metadata?.company_id;
      
      // Prevent multiple redirects
      setRedirecting(true);
      
      if (userRole === 'admin') {
        console.log('Redirecting logged-in admin to dashboard');
        setTimeout(() => {
          window.location.href = "/admin";
        }, 500);
      } else if (companyId) {
        console.log('Redirecting logged-in user to company page:', companyId);
        setTimeout(() => {
          window.location.href = `/dashboard/company-simple?id=${companyId}`;
        }, 500);
      } else {
        console.log('User has no role or company_id, redirecting to dashboard');
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      }
    }
  }, [user, redirecting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submitted for:", email);
    setIsLoading(true);
    setError('');
    
    try {
      // Sign in the user directly with Supabase
      console.log("Signing in with Supabase directly...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Sign in error:", error);
        setError(error.message || 'Authentication failed');
        setIsLoading(false);
        return;
      }
      
      if (!data.session) {
        console.error("No session after login");
        setError('No session after login. Please try again.');
        setIsLoading(false);
        return;
      }
      
      console.log("Login successful:", { 
        session: !!data.session, 
        user: data.user?.email,
        metadata: data.user?.user_metadata,
        sessionExpires: data.session?.expires_at,
        accessToken: data.session?.access_token ? "Present" : "Missing"
      });
      
      // Manually update the auth context
      setUser(data.user);
      
      // Check user role and metadata
      const userRole = data.user?.user_metadata?.role;
      const companyId = data.user?.user_metadata?.company_id;
      
      console.log('User logged in:', {
        email: data.user?.email,
        role: userRole,
        companyId: companyId,
        metadata: data.user?.user_metadata
      });
      
      // Set redirecting flag to prevent multiple redirects
      setRedirecting(true);
      
      // Preload data if user has a company ID
      if (companyId && userRole !== 'admin') {
        try {
          console.log(`Preloading company data for ID: ${companyId}`);
          
          // Fetch company details in the background
          const companyPromise = supabase
            .from('companies')
            .select('*')
            .eq('id', companyId)
            .single();
            
          // Fetch contacts in the background
          const contactsPromise = supabase
            .from('contacts')
            .select('*')
            .eq('company_id', companyId);
            
          // Wait for both to complete
          await Promise.all([companyPromise, contactsPromise]);
          
          console.log('Preloading complete, redirecting...');
        } catch (preloadError) {
          console.error('Error preloading data:', preloadError);
          // Continue with redirect even if preloading fails
        }
      }
      
      // Verify the session is stored in localStorage
      setTimeout(() => {
        const storedSession = localStorage.getItem('equiptrack-auth-token');
        console.log('Session stored in localStorage:', storedSession ? "Present" : "Missing");
        
        // Double-check the session with Supabase
        supabase.auth.getSession().then(({ data: { session } }) => {
          console.log('Double-checking session:', { 
            exists: !!session, 
            user: session?.user?.email
          });
          
          // Force a hard redirect to the appropriate page based only on role
          if (userRole === 'admin') {
            console.log('Admin user, redirecting to admin dashboard');
            window.location.replace("/admin");
          } else {
            // All non-admin users go to the company dashboard if they have a company ID
            if (companyId) {
              console.log(`User with company ID ${companyId}, redirecting to company dashboard`);
              window.location.replace(`/dashboard/company-simple?id=${companyId}`);
            } else {
              console.log('User has no company_id, redirecting to general dashboard');
              window.location.replace("/dashboard");
            }
          }
        });
      }, 1000);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login. Please check your credentials and try again.');
      setIsLoading(false);
      setRedirecting(false);
    }
  };

  // Display error message if there is one
  useEffect(() => {
    if (error) {
      toast({
        title: "Login Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left side - Image and company info - hidden on mobile */}
      <div className="hidden md:flex bg-[#7b96d4] text-white p-8 flex-col justify-between md:w-1/2 h-full">
        <div className="flex-grow flex items-center justify-center">
          <img 
            src="/lovable-uploads/robot.png" 
            alt="Equipment Tracking Robot" 
            className="max-w-full max-h-80 object-contain"
          />
        </div>
      </div>
      
      {/* Right side - Login form - full width on mobile */}
      <div className="p-8 flex flex-col justify-center w-full md:w-1/2 h-full overflow-y-auto">
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
              variant="primaryBlue"
              className="w-full"
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
          
          {/* Contact buttons styled like the image */}
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

export default Login; 