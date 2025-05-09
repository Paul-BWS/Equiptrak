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
const APP_VERSION = "1.0.7";
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
    <div className="flex min-h-screen bg-background">
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
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">EquipTrack</h1>
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
              className="w-full bg-[#a6e15a] hover:bg-[#95cc4f] text-black dark:text-black"
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

            {/* Version display */}
            <div className="text-center text-sm text-muted-foreground mt-4">
              Version {APP_VERSION}
            </div>
            
            {/* Need spares button */}
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => window.location.href = 'https://www.bws-ltd.co.uk/contact'}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Need spares or repairs?
            </Button>

            {/* Phone number */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = 'tel:01612231843'}
            >
              <Phone className="mr-2 h-4 w-4" />
              0161 223 1843
            </Button>

            {/* Error display */}
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
    </div>
  );
}

export default Login; 