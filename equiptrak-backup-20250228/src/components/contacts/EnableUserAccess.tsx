import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface EnableUserAccessProps {
  contact: {
    id: string;
    name: string;
    email: string;
    has_user_access: boolean;
    company_id: string;
    phone?: string;
    mobile?: string;
  };
  onSuccess?: () => void;
}

export function EnableUserAccess({ contact, onSuccess }: EnableUserAccessProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const handleEnableAccess = async () => {
    if (!session?.access_token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to enable user access",
      });
      return;
    }

    // Check if user is admin
    if (session.user.email !== 'paul@basicwelding.co.uk' && 
        session.user.email !== 'sales@basicwelding.co.uk') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Only admins can enable user access",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Auth status:', {
        isLoggedIn: !!session,
        hasAccessToken: !!session?.access_token,
        userEmail: session?.user?.email,
        tokenLength: session?.access_token?.length
      });
      
      console.log('Enabling access for contact:', {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        company_id: contact.company_id,
        phone: contact.phone,
        mobile: contact.mobile
      });
      
      // Generate a password
      const adjectives = ['Happy', 'Bright', 'Swift', 'Clever', 'Brave'];
      const nouns = ['Lion', 'Eagle', 'Tiger', 'Dolphin', 'Wolf'];
      const numbers = Math.floor(1000 + Math.random() * 9000);
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const password = `${adjective}${noun}${numbers}`;

      console.log('Generated password:', password);

      // Get the company details
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', contact.company_id)
        .single();

      if (companyError) {
        console.error('Error fetching company:', companyError);
        throw new Error('Failed to fetch company details: ' + companyError.message);
      }

      if (!company) {
        throw new Error('Company not found');
      }

      console.log('Found company:', company);

      // Validate required fields before sending
      if (!contact.email) throw new Error('Contact email is required');
      if (!contact.name) throw new Error('Contact name is required');
      if (!company.company_name) throw new Error('Company name is required');
      if (!session.user.email) throw new Error('Creator email is required');

      // Prepare request body
      const requestBody = {
        user_data: {
          email: contact.email.toLowerCase().trim(),
          password: password,
          role: 'customer',
          company_name: company.company_name.trim(),
          created_by: session.user.email.toLowerCase().trim()
        },
        profile_data: {
          email: contact.email.toLowerCase().trim(),
          company_name: company.company_name.trim(),
          role: 'customer',
          telephone: contact.phone?.trim() || null,
          mobile: contact.mobile?.trim() || null,
          address: company.address?.trim() || null,
          city: company.city?.trim() || null,
          county: company.county?.trim() || null,
          postcode: company.postcode?.trim() || null,
          country: company.country?.trim() || 'United Kingdom',
          contact_name: contact.name.trim(),
          contact_email: contact.email.toLowerCase().trim(),
          stored_password: password
        }
      };

      // Validate the request body matches Edge Function requirements
      const missingUserFields = ['email', 'password', 'company_name', 'role'].filter(
        field => !requestBody.user_data[field]
      );
      const missingProfileFields = ['email', 'company_name', 'role'].filter(
        field => !requestBody.profile_data[field]
      );

      if (missingUserFields.length > 0) {
        throw new Error(`Missing required user_data fields: ${missingUserFields.join(', ')}`);
      }
      if (missingProfileFields.length > 0) {
        throw new Error(`Missing required profile_data fields: ${missingProfileFields.join(', ')}`);
      }

      console.log('Sending request to create customer...');

      // Call the database function directly to create customer
      const { data, error } = await supabase.rpc('create_customer', {
        user_data: requestBody.user_data,
        profile_data: requestBody.profile_data
      });

      console.log('Response from create_customer:', { 
        data, 
        error,
        errorMessage: error?.message,
        details: error?.details
      });

      if (error) {
        console.error('Database function error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(error.message || 'Failed to create customer');
      }

      // Update the contact with user access
      const { error: updateError } = await supabase
        .from('contacts')
        .update({ 
          has_user_access: true,
          user_id: data?.user_id // Changed to match the database function's return value
        })
        .eq('id', contact.id);

      if (updateError) {
        console.error('Error updating contact:', updateError);
        throw updateError;
      }

      // Show the login credentials in a toast
      toast({
        title: "🔑 Login Credentials",
        description: `Email: ${contact.email}\nPassword: ${password}\n\nPlease save these details!`,
        duration: 30000, // Show for 30 seconds
      });

      toast({
        title: "✅ Access Enabled",
        description: "User access has been enabled successfully.",
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error enabling user access:', {
        message: error.message,
        name: error.name,
        cause: error.cause,
        stack: error.stack
      });
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to enable user access",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (contact.has_user_access) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Lock className="h-4 w-4 mr-2" />
        Has Access
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleEnableAccess}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Lock className="h-4 w-4 mr-2" />
      )}
      Enable Access
    </Button>
  );
} 