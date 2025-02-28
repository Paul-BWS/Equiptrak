import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const handleSignUp = async (
  email: string,
  password: string,
  company?: string
) => {
  const redirectUrl = window.location.origin.includes('localhost') 
    ? 'http://localhost:5173'
    : window.location.origin;
    
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined,
      data: {
        company: company,
      }
    }
  });
  
  if (error) throw error;
  return { error: null };
};

export const validateForm = (email: string, password: string, isSignUp: boolean) => {
  if (!email || !password) {
    throw new Error(isSignUp ? "Please fill in all required fields" : "Please enter both email and password");
  }
};