import { useState, useEffect } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Loader2, Phone, ExternalLink, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ApiClient from "@/utils/ApiClient";
import ThemeToggle from '@/components/ThemeToggle';

// Define a version number for tracking deployments
const APP_VERSION = "1.0.8";
// Set to true to show detailed error information
const DEBUG_MODE = true;

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
      const healthCheck = await ApiClient.get('/api/test');
      
      if (!healthCheck.ok) {
        throw new Error('Server health check failed');
      }

      console.log("Sending login request");
      const loginResponse = await ApiClient.post('/api/auth/login', { 
        email, 
        password 
      });
      
      console.log("Login response status:", loginResponse.status);
      
      if (!loginResponse.ok) {
        console.error("Server returned error:", loginResponse.error);
        setDebugInfo(`Server error (${loginResponse.status}): ${loginResponse.error || 'Unknown error'}`);
        throw new Error(loginResponse.error || 'Authentication failed');
      }

      const data = loginResponse.data;
      
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
    <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-[#18181b]">
      {/* Left side with background image and overlay text */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center relative m-4 rounded-lg overflow-hidden bg-[#f8f9fc] dark:bg-[#232329]">
        <img 
          src="/images/top-view-man-repairing-car.jpg" 
          alt="Top view man repairing car" 
          className="absolute inset-0 w-full h-full object-cover" 
          style={{ zIndex: 1 }}
        />
        {/* Purple overlay for hue effect */}
        <div className="absolute inset-0 bg-[#6c47ff] bg-opacity-20" style={{ zIndex: 2 }} />
        <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col justify-between" style={{ zIndex: 3 }}>
          <div className="p-6 flex justify-between items-start">
            <span className="text-3xl font-bold text-white tracking-widest">BWS</span>
            <a
              href="https://www.basicwelding.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto px-4 py-2 rounded-lg text-white bg-[#6d53b5] hover:bg-[#7e65d8] text-sm font-medium shadow transition-colors"
              style={{ minWidth: 'fit-content' }}
            >
              Go to website
            </a>
          </div>
          <div className="flex-1" />
          <div className="flex flex-col items-center justify-end pb-8">
            <h2 className="text-xl md:text-2xl font-light text-gray-100 text-center drop-shadow-lg">Your One Stop Shop For Bodyshop.</h2>
          </div>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 md:p-8 bg-[#f8f9fc] dark:bg-[#18181b]">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">Login</h1>
            <p className="text-sm text-gray-500 mt-2">v{APP_VERSION}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background text-foreground"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-background text-foreground"
                  required
                />
                <button 
                  type="button"
                  onClick={toggleShowPassword} 
                  className="absolute right-3 top-3 text-muted-foreground"
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
              className="w-full bg-[#6d53b5] hover:bg-[#7e65d8] text-white"
              style={{ background: '#6d53b5', color: '#fff' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => window.location.href = 'https://www.bws-ltd.co.uk/contact'}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Need spares or repairs?
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = 'tel:01612231843'}
            >
              <Phone className="mr-2 h-4 w-4" />
              0161 223 1843
            </Button>
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start mt-4">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Login failed</p>
                  <p className="text-sm">{error}</p>
                  {debugInfo && DEBUG_MODE && (
                    <p className="text-xs mt-1 opacity-80">{debugInfo}</p>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
}

export default Login; 