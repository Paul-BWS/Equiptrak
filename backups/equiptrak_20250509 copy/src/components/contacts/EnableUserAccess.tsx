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
    const isAdmin = session.user.user_metadata?.role === 'admin';
    if (!isAdmin) {
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
          role: contact.email.includes('basicwelding.co.uk') ? 'admin' : 'customer',
          company_name: company.company_name.trim(),
          created_by: session.user.email.toLowerCase().trim()
        },
        profile_data: {
          email: contact.email.toLowerCase().trim(),
          company_name: company.company_name.trim(),
          role: contact.email.includes('basicwelding.co.uk') ? 'admin' : 'customer',
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

      // If the role is Admin, ensure they are associated with BWS LTD
      if (requestBody.user_data.role === 'admin' || requestBody.profile_data.role === 'admin') {
        console.log('Admin user detected, ensuring association with BWS LTD');
        
        // Find the BWS LTD company
        const { data: bwsCompany, error: bwsError } = await supabase
          .from('companies')
          .select('id, company_name')
          .eq('company_name', 'BWS LTD')
          .single();
          
        if (bwsError) {
          console.error('Error finding BWS LTD company:', bwsError);
          throw new Error('Failed to find BWS LTD company: ' + bwsError.message);
        }
        
        if (!bwsCompany) {
          console.error('BWS LTD company not found');
          throw new Error('BWS LTD company not found');
        }
        
        // Update the requestBody with BWS LTD company info
        requestBody.user_data.company_name = 'BWS LTD';
        requestBody.profile_data.company_name = 'BWS LTD';
        
        // Also update the contact's company_id to BWS LTD
        const { error: updateContactError } = await supabase
          .from('contacts')
          .update({ company_id: bwsCompany.id })
          .eq('id', contact.id);
          
        if (updateContactError) {
          console.error('Error updating contact company_id:', updateContactError);
          // Continue anyway, as we'll still create the user
        }
      }

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

      // Ensure the user metadata includes the company_id
      if (data?.user_id) {
        console.log('Updating user metadata with company_id:', contact.company_id);
        
        // Get the current user metadata
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(data.user_id);
        
        if (userError) {
          console.error('Error getting user metadata:', userError);
        } else if (userData?.user) {
          // Update the user metadata with company_id
          const updatedMetadata = {
            ...userData.user.user_metadata,
            company_id: contact.company_id
          };
          
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            data.user_id,
            { user_metadata: updatedMetadata }
          );
          
          if (updateError) {
            console.error('Error updating user metadata:', updateError);
          } else {
            console.log('Successfully updated user metadata with company_id');
          }
        }
      }

      // Update the contact with user access
      const { error: updateError } = await supabase
        .from('contacts')
        .update({ 
          has_user_access: true,
          is_user: true,
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