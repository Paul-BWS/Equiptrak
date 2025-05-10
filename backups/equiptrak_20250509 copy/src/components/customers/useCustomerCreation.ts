import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CustomerFormValues } from "./types";
import { useAuth } from "@/contexts/AuthContext";

function generateReadablePassword() {
  const adjectives = ['Happy', 'Bright', 'Swift', 'Clever', 'Brave'];
  const nouns = ['Lion', 'Eagle', 'Tiger', 'Dolphin', 'Wolf'];
  const numbers = Math.floor(1000 + Math.random() * 9000);
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective}${noun}${numbers}`;
}

export function useCustomerCreation(onSuccess?: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const createCustomer = async (data: CustomerFormValues) => {
    try {
      // Check if user is admin
      if (!session?.user?.email || 
          (session.user.email !== 'paul@basicwelding.co.uk' && 
           session.user.email !== 'sales@basicwelding.co.uk')) {
        toast({
          variant: "destructive",
          title: "Unauthorized",
          description: "Only admins can create new customers",
        });
        return;
      }

      const password = generateReadablePassword();

      // Create the profile first
      const profileData = {
        email: data.contact_email,
        company_name: data.company_name,
        role: data.role,
        telephone: data.telephone || null,
        mobile: data.mobile || null,
        address: data.address || null,
        city: data.city || null,
        county: data.county || null,
        postcode: data.postcode || null,
        country: data.country || null,
        contact_name: data.contact_name || null,
        contact_email: data.contact_email,
        stored_password: password
      };

      // Create the user and profile in a single transaction
      const { data: result, error: createError } = await supabase.functions.invoke('create-customer', {
        body: {
          user_data: {
            email: data.contact_email,
            password: password,
            company_name: data.company_name,
            role: data.role,
            created_by: session.user.email
          },
          profile_data: profileData
        }
      });

      if (createError || (result && result.error)) {
        const errorMessage = createError?.message || result?.error || 'Failed to create customer';
        console.error('Error creating customer:', errorMessage);
        toast({
          variant: "destructive",
          title: "Error creating customer",
          description: errorMessage,
        });
        return;
      }

      // Show success messages with role-specific text
      toast({
        title: `🔑 ${data.role === 'admin' ? 'Admin' : 'Customer'} Login Details`,
        description: `Email: ${data.contact_email}\nPassword: ${password}\n\nPlease save these details!`,
        duration: 30000, // Show for 30 seconds
      });
      
      toast({
        title: "✅ Success",
        description: `${data.role === 'admin' ? 'Admin' : 'Customer'} created successfully.`,
      });
      
      // Refresh the customer list
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error('Customer creation error:', error);
      toast({
        variant: "destructive",
        title: "Error creating customer",
        description: error.message || "An unexpected error occurred",
      });
    }
  };

  return { createCustomer };
}