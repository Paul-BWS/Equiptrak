import { useState, useEffect } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Loader2, Phone, ExternalLink, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ApiClient from "@/utils/ApiClient";

// Define a version number for tracking deployments
const APP_VERSION = "1.0.5";
// Set to true to show detailed error information
const DEBUG_MODE = true;

// API base URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Use relative URL in production
  : 'http://localhost:3001';

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Current user state:", user, "Redirecting:", redirecting);
    
    if (user && !redirecting) {
      console.log("User already logged in, checking role:", user.role);
      
      setRedirecting(true);
      
      if (user.role === 'admin') {
        console.log('Redirecting logged-in admin to dashboard');
        navigate("/admin");
      } else {
        console.log('Redirecting logged-in user to dashboard');
        navigate("/dashboard");
      }
    }
  }, [user, redirecting, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submitted for:", email);
    setIsLoading(true);
    setError('');
    setDebugInfo(null);
    
    try {
      // First check if the server is accessible
      console.log("Testing server connection...");
      try {
        const healthCheck = await fetch(`${API_BASE_URL}/api/test`, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include'
        });
        
        if (!healthCheck.ok) {
          throw new Error('Server health check failed');
        }
      } catch (healthError) {
        console.error("Server health check failed:", healthError);
        setDebugInfo(`Server connection failed: ${healthError.message}`);
        throw new Error('Unable to connect to server. Please check if the server is running.');
      }

      console.log("Sending login request directly with fetch");
      const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: email, 
          password: password 
        }),
        credentials: 'include',
        mode: 'cors'
      });
      
      console.log("Login response status:", loginResponse.status);
      
      if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        console.error("Server returned error:", errorText);
        setDebugInfo(`Server error (${loginResponse.status}): ${errorText || 'Unknown error'}`);
        throw new Error(errorText || 'Authentication failed');
      }

      const data = await loginResponse.json();
      
      // Log the response for debugging
      console.log('Server response:', data);

      // Validate response structure
      if (!data.token || !data.user) {
        console.error('Invalid response structure:', data);
        setDebugInfo(`Invalid server response: Missing token or user data`);
        throw new Error('Invalid response from server');
      }

      // Validate required user data fields
      const { user: userData } = data;
      if (!userData.id || !userData.email || typeof userData.role !== 'string') {
        console.error('Missing required user data:', userData);
        setDebugInfo(`Invalid user data: Missing id, email, or role`);
        throw new Error('Invalid user data received');
      }

      // Call the signIn function from AuthContext with the user data and token
      await signIn({
        ...userData,
        token: data.token,
        role: userData.role as UserRole // Ensure role is properly typed
      });
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      // Redirect based on role
      if (userData.role === 'admin') {
        console.log('Redirecting admin user to /admin');
        navigate("/admin");
      } else {
        console.log('Redirecting regular user to /dashboard');
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left side with robot image */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-[#7496da]">
        <div className="w-3/4 flex justify-center">
          <img 
            src="/images/robot.png" 
            alt="Robot Assistant" 
            className="w-auto h-auto max-h-[80vh]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "https://placehold.co/400x500/7496da/white?text=Robot+Image";
            }}
          />
        </div>
      </div>

      {/* Right side with login form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">EquipTrack</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  placeholder="Enter your email"
                  type="email"
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
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button 
                  type="button"
                  onClick={toggleShowPassword} 
                  className="absolute right-3 top-3 text-gray-400"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#7496da] hover:bg-[#5f7ab8]"
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
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Login failed</p>
                <p className="text-sm">{error}</p>
                {debugInfo && DEBUG_MODE && (
                  <details className="mt-2 text-xs bg-red-100 p-2 rounded">
                    <summary>Technical details</summary>
                    <pre className="whitespace-pre-wrap">{debugInfo}</pre>
                  </details>
                )}
              </div>
            </div>
          )}
          
          {/* Contact buttons */}
          <div className="mt-8 space-y-4">
            <a 
              href="https://www.basicwelding.co.uk" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center text-[#7496da]">
                <ExternalLink className="h-5 w-5 mr-3" />
                <span className="font-medium">Need spares or repairs?</span>
              </div>
            </a>
            
            <div className="grid grid-cols-2 gap-4">
              <a 
                href="tel:01612231843" 
                className="flex items-center justify-center px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <Phone className="h-5 w-5 mr-3 text-[#7496da]" />
                <span className="text-gray-700">0161 223 1843</span>
              </a>
              
              <div className="flex items-center justify-center px-6 py-3 bg-white rounded-lg shadow-md">
                <span className="text-xs text-gray-500">v{APP_VERSION}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 