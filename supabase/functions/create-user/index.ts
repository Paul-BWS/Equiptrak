import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // CORS headers for browser requests
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers, status: 204 })
  }

  try {
    // Get the request body
    const { email, password, name, role, company_name, telephone } = await req.json()

    // Validate required fields
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { headers, status: 400 }
      )
    }

    console.log('Creating user with email:', email)

    // Create a Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create the user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { 
        name, 
        role, 
        company_name, 
        telephone 
      }
    })

    if (error) {
      console.error('Error creating user:', error)
      return new Response(
        JSON.stringify({ 
          error: error.message,
          code: error.code,
          status: error.status 
        }),
        { headers, status: 400 }
      )
    }

    console.log('User created successfully:', data.user.id)
    
    return new Response(
      JSON.stringify({ 
        success: true,
        user: data.user 
      }),
      { headers, status: 200 }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { headers, status: 500 }
    )
  }
})