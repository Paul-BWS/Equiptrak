import { useState, useEffect } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Loader2, Phone, ExternalLink, Eye, EyeOff, AlertCircle, Info } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ApiClient from "@/utils/ApiClient";

// Define a version number for tracking deployments
const APP_VERSION = "1.0.5";
// Set to true to show detailed error information
const DEBUG_MODE = true;

export function Login() {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for session messages passed via location state
    if (location.state?.message) {
      setSessionMessage(location.state.message);
      // Clear the state so the message doesn't persist on page refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

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
    setSessionMessage(null);
    
    try {
      console.log("Sending login request to API server");
      const response = await ApiClient.post('/api/auth/login', {
        email,
        password
      });

      if (!response.ok || !response.data) {
        console.error("Login failed:", response.error);
        setDebugInfo(`Login failed (${response.status}): ${response.error || 'Unknown error'}`);
        throw new Error(response.error || 'Authentication failed');
      }

      const data = response.data;
      
      // Log the response for debugging
      console.log('Server response:', data);

      // Validate response structure
      if (!data.token || !data.user) {
        console.error('Invalid response structure:', data);
        setDebugInfo(`Invalid server response: Missing token or user data`);
        throw new Error('Invalid response from server');
      }

      // Validate required user data fields
      const { user } = data;
      if (!user.id || !user.email || typeof user.role !== 'string') {
        console.error('Missing required user data:', user);
        setDebugInfo(`Invalid user data: Missing id, email, or role`);
        throw new Error('Invalid user data received');
      }

      // Extract token expiration if available
      let tokenExpiry;
      if (data.tokenExpiry) {
        console.log('Using tokenExpiry directly from server:', data.tokenExpiry);
        tokenExpiry = data.tokenExpiry;
      } else if (data.expiresIn) {
        // Calculate expiry from expiresIn seconds
        console.log('Calculating tokenExpiry from expiresIn:', data.expiresIn, 'seconds');
        tokenExpiry = Math.floor(Date.now() / 1000) + data.expiresIn;
        console.log('Calculated tokenExpiry:', tokenExpiry, '(', new Date(tokenExpiry * 1000).toISOString(), ')');
      } else {
        // Default to 24 hours if not specified
        console.log('No expiry information provided by server, using default 24h');
        tokenExpiry = Math.floor(Date.now() / 1000) + 86400;
        console.log('Default tokenExpiry:', tokenExpiry, '(', new Date(tokenExpiry * 1000).toISOString(), ')');
      }

      // Call the signIn function from AuthContext with the user data and token
      await signIn({
        ...data.user,
        token: data.token,
        tokenExpiry,
        role: data.user.role as UserRole // Ensure role is properly typed
      });
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      // Redirect based on role
      if (data.user.role === 'admin') {
        console.log('Redirecting admin user to /admin');
        navigate("/admin");
      } else {
        console.log('Redirecting regular user to /dashboard');
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Authentication failed',
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
            <p className="text-sm text-gray-500 mt-2">Version {APP_VERSION}</p>
          </div>
          
          {/* Session expired message */}
          {sessionMessage && (
            <Alert className="mb-4 border-amber-300 bg-amber-50">
              <Info className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-800">Session Notice</AlertTitle>
              <AlertDescription className="text-amber-700">
                {sessionMessage}
              </AlertDescription>
            </Alert>
          )}
          
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

          {/* Need spares card */}
          <a 
            href="https://basicwelding.co.uk" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-10 rounded-lg border border-gray-200 shadow-sm overflow-hidden block hover:bg-gray-50 transition-colors"
          >
            <div className="flex flex-wrap items-center gap-2 p-5 text-blue-500">
              <ExternalLink size={20} className="text-blue-500" />
              <span className="text-lg">Need spares or repairs?</span>
              <span className="ml-auto">Visit basicwelding.co.uk</span>
            </div>
          </a>
          
          {/* Phone and Email cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
            <a 
              href="tel:01612231843" 
              className="flex items-center justify-center md:justify-start gap-3 p-5 bg-white text-blue-500 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Phone size={20} className="text-blue-500" />
              <span className="text-lg">0161 223 1843</span>
            </a>
            
            <a 
              href="mailto:support@equiptrak.com" 
              className="flex items-center justify-center md:justify-start gap-3 p-5 bg-white text-blue-500 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Mail size={20} className="text-blue-500" />
              <span className="text-lg">Email Support</span>
            </a>
          </div>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Version {APP_VERSION}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 