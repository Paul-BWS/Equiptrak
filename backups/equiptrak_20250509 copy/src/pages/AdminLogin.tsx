import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Loader2 } from "lucide-react";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log("Sending admin login request to API server");
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
        }),
        mode: 'cors',
        cache: 'no-cache',
      });

      console.log("Login response status:", response.status);
      
      let data;
      try {
        data = await response.json();
        console.log("Response data received", { ok: response.ok });
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        throw new Error('Invalid response format from server');
      }
      
      if (!response.ok) {
        console.error("Server returned error:", data.error);
        throw new Error(data.error || 'Authentication failed');
      }

      // Validate response structure
      if (!data.token || !data.user) {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response from server');
      }

      // Validate required user data fields
      const { user } = data;
      if (!user.id || !user.email || typeof user.role !== 'string') {
        console.error('Missing required user data:', user);
        throw new Error('Invalid user data received');
      }

      // Check if user is admin
      if (user.role !== 'admin') {
        throw new Error('Access denied: Admin rights required');
      }

      // Call the signIn function from AuthContext with the user data and token
      await signIn({
        ...data.user,
        token: data.token,
        role: data.user.role as UserRole
      });
      
      toast({
        title: "Success",
        description: "Admin logged in successfully",
      });

      // Redirect to admin dashboard
      navigate("/admin");
    } catch (error) {
      console.error("Admin login error:", error);
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Left side - Image and company info - hidden on mobile */}
      <div className="hidden md:flex bg-[#7b96d4] text-white p-8 flex-col justify-between md:w-1/2">
        <div className="flex-grow flex items-center justify-center">
          <img 
            src="/images/robot.png" 
            alt="Equipment Tracking Robot" 
            className="max-w-full max-h-80 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "https://placehold.co/400x400/7b96d4/white?text=Robot";
            }}
          />
        </div>
      </div>
      
      {/* Right side - Login form - full width on mobile */}
      <div className="p-8 flex flex-col justify-center w-full md:w-1/2">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-[#7b96d4]">EquipTrack Admin</h1>
            <p className="mt-2 text-gray-600">Admin access only</p>
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
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Admin Sign In"
              )}
            </Button>
          </form>
          
          {error && (
            <div className="mt-4 text-sm text-red-500">
              {error}
            </div>
          )}
          
          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="text-blue-600 hover:underline"
            >
              Back to Customer Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin; 