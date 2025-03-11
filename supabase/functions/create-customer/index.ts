// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

console.log("Hello from Functions!")

serve(async (req) => {
  console.log('Request received:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey
    );

    // Log request body for debugging
    const body = await req.json();
    console.log('Request body received:', {
      email: body.email,
      name: body.name,
      role: body.role,
      companyName: body.company_name
    });

    // Extract user data from request
    const { email, password, name, role, company_name, telephone, contact_id } = body;

    // Validate required fields
    if (!email || !password || !role) {
      throw new Error('Missing required fields: email, password, and role are required');
    }

    // Create the user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(`User creation failed: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('User creation failed: No user returned');
    }

    // Create the user profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        name,
        role,
        company_name: company_name || '',
        telephone: telephone || '',
        contact_id
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    console.log('User created successfully:', authData.user.id);
    return new Response(
      JSON.stringify({ 
        message: 'User created successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-customer function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-customer' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
