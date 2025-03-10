import { supabase } from '@/integrations/supabase/client';

interface UserData {
  email: string;
  password: string;
  name: string;
  role: string;
  company_name?: string;
  telephone?: string;
  contact_id?: string;
}

export async function createUser(userData: UserData): Promise<any> {
  try {
    console.log('Creating user with create_customer RPC:', userData);
    
    // Get company_id from contact if available
    let company_id = null;
    let company_name = userData.company_name || '';
    
    if (userData.contact_id) {
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .select('company_id, company:companies(company_name)')
        .eq('id', userData.contact_id)
        .single();
        
      if (contactError) {
        console.error('Error fetching contact:', contactError);
      } else {
        company_id = contactData.company_id;
        // If the role is admin, use BWS LTD as the company
        if (userData.role === 'admin') {
          // Find BWS LTD company
          const { data: bwsCompany, error: bwsError } = await supabase
            .from('companies')
            .select('id, company_name')
            .eq('company_name', 'BWS LTD')
            .single();
            
          if (!bwsError && bwsCompany) {
            company_id = bwsCompany.id;
            company_name = 'BWS LTD';
          }
        } else if (contactData.company && contactData.company.company_name) {
          company_name = contactData.company.company_name;
        }
        console.log('Found company_id from contact:', company_id, 'company_name:', company_name);
      }
    }
    
    // Prepare request body for create_customer RPC
    const requestBody = {
      user_data: {
        email: userData.email,
        password: userData.password,
        role: userData.role,
        company_name: company_name,
        created_by: 'system'
      },
      profile_data: {
        email: userData.email,
        company_name: company_name,
        role: userData.role,
        telephone: userData.telephone || null,
        mobile: null,
        address: null,
        city: null,
        county: null,
        postcode: null,
        country: 'United Kingdom',
        contact_name: userData.name,
        contact_email: userData.email,
        stored_password: userData.password
      }
    };
    
    // Call the create_customer RPC function
    const { data, error } = await supabase.rpc('create_customer', {
      user_data: requestBody.user_data,
      profile_data: requestBody.profile_data
    });
    
    if (error) {
      console.error('Error calling create_customer RPC:', error);
      throw error;
    }
    
    console.log('User created successfully with create_customer RPC:', data);
    
    // Update the contact with user_id if contact_id was provided
    if (userData.contact_id && data?.user_id) {
      const { error: updateError } = await supabase
        .from('contacts')
        .update({ 
          has_system_access: true,
          is_user: true,
          user_id: data.user_id
        })
        .eq('id', userData.contact_id);
        
      if (updateError) {
        console.error('Error updating contact with user_id:', updateError);
      } else {
        console.log('Contact updated with user_id:', data.user_id);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}