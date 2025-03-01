import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Phone, ExternalLink } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      navigate("/admin");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
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
              className="w-full bg-[#a6e15a] hover:bg-[#95cc50] text-white"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
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