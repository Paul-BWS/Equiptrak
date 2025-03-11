import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Phone, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Define a version number for tracking deployments
const APP_VERSION = "1.0.2";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, setUser } = useAuth();
  const { toast } = useToast();
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState('');
  const [supabaseDebug, setSupabaseDebug] = useState<any>(null);

  // Debug: Log when component mounts and when user changes
  useEffect(() => {
    console.log("Login component mounted");
    
    // Debug Supabase configuration
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    setSupabaseDebug({
      url: supabaseUrl ? `${supabaseUrl.substring(0, 10)}...` : 'missing',
      key: supabaseAnonKey ? 'present' : 'missing',
      envVars: Object.keys(import.meta.env).filter(key => key.includes('SUPABASE'))
    });
    
    console.log("Supabase config:", {
      url: supabaseUrl,
      keyPresent: !!supabaseAnonKey,
      envVars: Object.keys(import.meta.env).filter(key => key.includes('SUPABASE'))
    });
    
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
    <div style={{
      width: '100%',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: '#f9fafb',
    }}>
      {/* Blue background panel - fixed position */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '50%',
        height: '100%',
        backgroundColor: '#7b96d4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      }}>
        <img 
          src="/lovable-uploads/robot.png" 
          alt="Equipment Tracking Robot" 
          style={{
            maxWidth: '80%',
            maxHeight: '50%',
            objectFit: 'contain',
          }}
        />
      </div>
      
      {/* Login form panel - fixed position */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '50%',
        height: '100%',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        zIndex: 1,
        overflowY: 'auto',
      }}>
        <div style={{
          maxWidth: '400px',
          width: '100%',
          margin: '0 auto',
        }}>
          <div style={{
            marginBottom: '2rem',
            textAlign: 'center',
          }}>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              color: '#7b96d4',
            }}>EquipTrack</h1>
          </div>
          
          <form onSubmit={handleSubmit} style={{marginBottom: '1.5rem'}}>
            <div style={{marginBottom: '1rem'}}>
              <Label htmlFor="email">Email</Label>
              <div style={{position: 'relative'}}>
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
            
            <div style={{marginBottom: '1.5rem'}}>
              <Label htmlFor="password">Password</Label>
              <div style={{position: 'relative'}}>
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
          
          <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
            <a 
              href="/admin-login" 
              className="text-blue-600 hover:underline"
            >
              Admin Login
            </a>
          </div>
          
          {/* Contact buttons */}
          <div style={{marginTop: '2rem'}}>
            <a 
              href="https://www.basicwelding.co.uk" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-between px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow mb-4"
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
      
      {/* Mobile view - hide blue panel and adjust form panel */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 767px) {
            div[style*="position: absolute"][style*="left: 0"] {
              display: none !important;
            }
            div[style*="position: absolute"][style*="right: 0"] {
              width: 100% !important;
              left: 0 !important;
            }
          }
        `
      }} />
      
      {/* Version number */}
      <div style={{
        position: 'absolute',
        bottom: '0.5rem',
        left: '0.5rem',
        fontSize: '0.75rem',
        color: '#6b7280',
        zIndex: 10,
      }}>
        v{APP_VERSION}
        {supabaseDebug && (
          <span style={{marginLeft: '0.5rem'}}>
            API: {supabaseDebug.url} ({supabaseDebug.key})
          </span>
        )}
      </div>
    </div>
  );
} 