import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PasswordResetForm } from "./PasswordResetForm";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Starting login process for:', email);
      
      // Sign in with our API
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      console.log('Login successful, checking user role...');

      // Call signIn from AuthContext with the token and user data
      signIn(token, {
        id: user.id,
        email: user.email,
        role: user.role
      });

      if (user.role === 'admin') {
        console.log('Redirecting to admin dashboard');
        navigate('/admin');
        toast.success('Welcome back, Admin!');
      } else {
        console.log('Redirecting to user dashboard');
        navigate('/dashboard');
        toast.success('Logged in successfully');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  if (isResetting) {
    return (
      <PasswordResetForm
        onBack={() => setIsResetting(false)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white border-gray-200 text-gray-900 focus:border-[#7b96d4]"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-white border-gray-200 text-gray-900 focus:border-[#7b96d4]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#7b96d4] text-white hover:bg-[#6b86c4]"
        >
          {isLoading ? "Logging in..." : "Log In"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsResetting(true)}
          className="text-[#7b96d4] hover:text-[#6b86c4] hover:bg-[#f5f5f5]"
        >
          Forgot Password?
        </Button>
      </div>
    </form>
  );
};