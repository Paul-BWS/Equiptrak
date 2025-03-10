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

// Add this new function for admin user creation
export const createUserAsAdmin = async ({
  email,
  password,
  role,
  contact_id,
  company_id
}: {
  email: string;
  password: string;
  role: string;
  contact_id: string;
  company_id?: string;
}) => {
  try {
    console.log("Attempting to create user as admin:", { email, role, contact_id, company_id });
    
    // Try direct signup first (this will likely fail with "signups not allowed")
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            contact_id,
            company_id
          }
        }
      });
      
      console.log("Signup response:", { data, error });
      
      if (error) {
        // If we get the "signups not allowed" error, we need to use admin API
        if (error.message.includes("not allowed")) {
          console.log("Signups not allowed, trying admin approach");
          
          // This would require admin privileges in Supabase
          // In a real application, you would need to implement this differently
          // For example, by using a Supabase Edge Function or a serverless function
          
          console.error("User creation failed: Signups are not allowed and no admin API is available");
          return {
            error: {
              message: "User creation failed: Signups are not allowed. Please contact your administrator."
            }
          };
        }
        
        return { error };
      }
      
      // If direct signup worked, add to user_roles table
      if (data?.user) {
        console.log("User created directly, adding role:", { userId: data.user.id, role });
        
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role
          });
          
        console.log("Role assignment result:", { error: roleError });
        
        if (roleError) {
          console.error("Error setting user role:", roleError);
          return { user: data.user, error: "User created but role assignment failed" };
        }
      }
      
      return { user: data?.user, error: null };
    } catch (signupError: any) {
      console.error("Signup error:", signupError);
      throw signupError;
    }
  } catch (error: any) {
    console.error("Error creating user:", error);
    return { error: error.message };
  }
};