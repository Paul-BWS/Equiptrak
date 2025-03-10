import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PasswordResetForm } from "./PasswordResetForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Debug function to check derek's contact record
const checkDerekContact = async () => {
  // Check derek's contact record
  const { data: derekContact, error: derekError } = await supabase
    .from('contacts')
    .select('*')
    .eq('email', 'derek@acme.com');
  
  console.log('Derek contact check:', derekContact, derekError);
  
  // If we found a contact, check the company details
  if (derekContact && derekContact.length > 0) {
    const companyId = derekContact[0].company_id;
    
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();
      
    console.log('Company associated with derek:', companyData, companyError);
    
    // Also check the Acme company
    const { data: acmeCompany, error: acmeError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', '0cd307a7-c938-49da-b005-17746587ca8a')
      .single();
      
    console.log('Acme company data:', acmeCompany, acmeError);
  }
};

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  // Run the check on component mount
  useEffect(() => {
    checkDerekContact();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Starting login process for:', email);
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error('No session created');
      }

      console.log('Login successful, checking user role...');

      // Get user profile to check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single();

      console.log('User profile:', profile);
      const isAdmin = profile?.role === 'admin' || email === 'paul@basicwelding.co.uk';
      console.log('Is admin?', isAdmin);

      if (isAdmin) {
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
      toast.error(error.message || 'Failed to log in');
      await supabase.auth.signOut();
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