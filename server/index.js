// Load environment variables first
require('dotenv').config({ path: __dirname + '/.env' });

// Debug environment variables
console.log('Environment variables loaded:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('PORT:', process.env.PORT || 3003);

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Get environment variables with fallbacks
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!supabaseUrl) {
  console.error('ERROR: SUPABASE_URL is not defined in .env file');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is not defined in .env file');
  process.exit(1);
}

const app = express();

// Configure CORS to allow requests from your frontend - update with more permissive settings for development
app.use(cors({
  origin: '*', // Allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Add CORS preflight handling
app.options('*', cors());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// Create Supabase client with admin privileges
const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey
);

// Simple test endpoint - update with more verbose logging
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called from:', req.ip);
  console.log('Request headers:', req.headers);
  
  // Set CORS headers explicitly
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  // Set content type explicitly
  res.setHeader('Content-Type', 'application/json');
  
  res.json({ 
    message: 'Server is running correctly',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version
  });
});

// List users endpoint - moved higher in the file
app.get('/api/list-users', async (req, res) => {
  console.log('List users endpoint called');
  // Set content type explicitly to application/json
  res.setHeader('Content-Type', 'application/json');
  
  try {
    console.log('Fetching users with admin API...');
    
    // Get auth users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error listing auth users:', authError);
      return res.status(400).json({ 
        success: false, 
        error: 'Error listing auth users: ' + authError.message 
      });
    }
    
    console.log('Auth users fetched successfully, count:', authData.users.length);
    
    // Get profiles data - explicitly handle errors
    let profilesData = [];
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error('Error fetching profiles:', error);
        // Continue with empty profiles rather than failing completely
        console.log('Continuing with empty profiles list');
      } else {
        profilesData = data || [];
        console.log('Profiles fetched successfully, count:', profilesData.length);
      }
    } catch (profileError) {
      console.error('Exception fetching profiles:', profileError);
      // Continue with empty profiles
      console.log('Continuing with empty profiles list due to exception');
    }
    
    // Combine the data - use auth users as the primary source
    const users = authData.users.map(authUser => {
      // Find matching profile if it exists
      const profile = profilesData.find(p => p.id === authUser.id) || {};
      
      // Create a combined user object
      return {
        id: authUser.id,
        email: authUser.email,
        name: profile.name || authUser.user_metadata?.name || '',
        role: profile.role || authUser.user_metadata?.role || 'user',
        company_name: profile.company_name || '',
        telephone: profile.telephone || '',
        created_at: authUser.created_at
      };
    });
    
    console.log('Combined users data, count:', users.length);
    console.log('First user sample (redacted):', users.length > 0 ? 
      { ...users[0], id: '***', email: '***@***' } : 'No users');
    
    return res.status(200).json({ 
      success: true, 
      users
    });
  } catch (error) {
    console.error('Server error listing users:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error: ' + (error.message || 'Unknown error')
    });
  }
});

// Add a test endpoint to verify Supabase connection
app.get('/api/test-supabase', async (req, res) => {
  try {
    console.log('Testing Supabase connection...');
    console.log('Using URL:', supabaseUrl);
    console.log('Service key exists and length:', !!supabaseServiceKey, supabaseServiceKey.length);
    
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return res.status(400).json({ success: false, error: error.message });
    }
    
    console.log('Supabase connection successful');
    return res.status(200).json({ 
      success: true, 
      message: 'Supabase connection successful',
      userCount: data.users.length
    });
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update the test-create-user endpoint with more detailed error handling
app.get('/api/test-create-user-simple', async (req, res) => {
  try {
    console.log('Testing user creation with minimal data (simple approach)...');
    
    // Generate a unique test email
    const testEmail = `test-simple-${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    
    console.log('Creating test user with email:', testEmail);
    console.log('Using Supabase URL:', supabaseUrl);
    console.log('Service key exists and length:', !!supabaseServiceKey, supabaseServiceKey.length);
    
    // Try the most basic user creation possible
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {} // Empty metadata
    });
    
    if (error) {
      console.error('Test user creation failed:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error status:', error.status);
      console.error('Error code:', error.code);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      // Try to get more information about the Supabase project
      try {
        console.log('Checking Supabase project status...');
        const { data: projectData, error: projectError } = await supabaseAdmin.rpc('get_service_status');
        
        if (projectError) {
          console.error('Error checking project status:', projectError);
        } else {
          console.log('Project status:', projectData);
        }
      } catch (statusError) {
        console.error('Error checking project status:', statusError);
      }
      
      return res.status(400).json({ 
        success: false, 
        error: error.message,
        code: error.code,
        status: error.status
      });
    }
    
    console.log('Test user created successfully:', data.user.id);
    return res.status(200).json({ 
      success: true, 
      message: 'Test user created successfully',
      user: {
        id: data.user.id,
        email: data.user.email
      }
    });
  } catch (error) {
    console.error('Exception in test user creation:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
});

// Find the create-user endpoint and enhance the error handling
app.post('/api/create-user', async (req, res) => {
  console.log('Create user request received:', req.body);
  
  try {
    const { email, password, name, role, company_name, telephone } = req.body;
    
    // Validate required fields
    if (!email) {
      console.log('Email is required');
      return res.status(400).json({ error: 'Email is required' });
    }
    
    if (!password) {
      console.log('Password is required');
      return res.status(400).json({ error: 'Password is required' });
    }
    
    // Log Supabase connection details (safely)
    console.log('Using Supabase URL:', supabaseUrl);
    console.log('Service key exists and length:', !!supabaseServiceKey, supabaseServiceKey ? supabaseServiceKey.length : 0);
    
    // Check if user already exists
    try {
      console.log('Checking if user already exists with email:', email);
      const { data: existingUsers, error: checkError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .limit(1);
      
      if (checkError) {
        console.error('Error checking for existing user:', checkError);
        // Continue with user creation attempt even if check fails
      } else if (existingUsers && existingUsers.length > 0) {
        console.log('User already exists with email:', email);
        return res.status(400).json({ error: 'A user with this email already exists' });
      }
    } catch (error) {
      console.error('Exception checking for existing user:', error);
      // Continue with user creation attempt even if check fails
    }
    
    // Test Supabase connection before attempting user creation
    try {
      console.log('Testing Supabase connection...');
      const { data: testData, error: testError } = await supabaseAdmin
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('Supabase connection test failed:', testError);
        console.error('Full error object:', JSON.stringify(testError, null, 2));
        return res.status(500).json({ 
          error: 'Failed to connect to Supabase database', 
          details: testError.message 
        });
      }
      
      console.log('Supabase connection test successful, result:', testData);
    } catch (testError) {
      console.error('Exception testing Supabase connection:', testError);
      console.error('Full error stack:', testError.stack);
      return res.status(500).json({ 
        error: 'Exception testing Supabase connection', 
        details: testError.message 
      });
    }
    
    // Create user with Supabase Admin API
    console.log('Creating user with Supabase Admin API');
    let newUser;
    try {
      // First try with minimal data to isolate the issue
      console.log('Attempting to create user with email:', email);
      console.log('Using createUser API with email_confirm: true');
      
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      
      if (error) {
        console.error('Supabase Auth error creating user:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        console.error('Error code:', error.code);
        console.error('Error status:', error.status);
        
        // Provide more specific error messages based on the error code
        if (error.message.includes('Database error')) {
          return res.status(500).json({ 
            error: 'Database error creating user. Please check your Supabase configuration and permissions.',
            details: error.message,
            code: error.code || 'unknown',
            status: error.status || 500
          });
        }
        
        if (error.message.includes('already exists')) {
          return res.status(400).json({ 
            error: 'A user with this email already exists',
            details: error.message
          });
        }
        
        return res.status(error.status || 400).json({ 
          error: `Auth error creating user: ${error.message}`,
          code: error.code || 'unknown',
          status: error.status || 400
        });
      }
      
      if (!data || !data.user) {
        console.error('No user data returned from createUser');
        return res.status(500).json({ error: 'No user data returned from createUser' });
      }
      
      newUser = data.user;
      console.log('User created successfully:', newUser.id);
    } catch (error) {
      console.error('Exception during user creation:', error);
      console.error('Full error stack:', error.stack);
      return res.status(500).json({ 
        error: `Exception creating user: ${error.message}`,
        stack: error.stack
      });
    }
    
    // Create profile record
    console.log('Creating profile record for user:', newUser.id);
    try {
      // Prepare profile data with required fields
      const profileDataToInsert = {
        id: newUser.id,
        email,
        role: role || 'customer'
      };
      
      // Add optional fields if provided
      if (name) profileDataToInsert.name = name;
      if (company_name) profileDataToInsert.company_name = company_name;
      if (telephone) profileDataToInsert.telephone = telephone;
      
      console.log('Inserting profile with data:', JSON.stringify(profileDataToInsert, null, 2));
      
      // Check if profiles table exists
      console.log('Checking if profiles table exists...');
      const { data: tableCheck, error: tableCheckError } = await supabaseAdmin
        .from('profiles')
        .select('count')
        .limit(1);
        
      if (tableCheckError) {
        console.error('Error checking profiles table:', tableCheckError);
        console.error('Full error object:', JSON.stringify(tableCheckError, null, 2));
        console.log('Profiles table may not exist, will try to create user without profile');
        
        // Return success even without profile
        return res.status(200).json({ 
          success: true, 
          user: {
            id: newUser.id,
            email: newUser.email,
            name,
            role
          },
          warning: 'User created but profile could not be created: profiles table may not exist'
        });
      }
      
      console.log('Profiles table exists, proceeding with profile creation');
      
      // Insert the profile
      const { data: createdProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert(profileDataToInsert)
        .select();
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
        console.error('Full error object:', JSON.stringify(profileError, null, 2));
        console.error('Profile data attempted:', JSON.stringify(profileDataToInsert, null, 2));
        
        // If profile creation fails, we should delete the auth user to maintain consistency
        console.log('Deleting auth user due to profile creation failure');
        try {
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(newUser.id);
          if (deleteError) {
            console.error('Error deleting user after profile creation failure:', deleteError);
          } else {
            console.log('Successfully deleted user after profile creation failure');
          }
        } catch (deleteError) {
          console.error('Exception deleting user after profile creation failure:', deleteError);
        }
        
        return res.status(400).json({ 
          error: 'User created but profile creation failed: ' + profileError.message,
          details: profileError
        });
      }
      
      console.log('Profile created successfully:', createdProfile);
      
      return res.status(200).json({ 
        success: true, 
        user: {
          id: newUser.id,
          email: newUser.email,
          name,
          role,
          company_name,
          telephone
        }
      });
    } catch (profileError) {
      console.error('Exception creating profile:', profileError);
      console.error('Full error stack:', profileError.stack);
      
      // If profile creation fails, we should delete the auth user to maintain consistency
      console.log('Deleting auth user due to profile creation exception');
      try {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(newUser.id);
        if (deleteError) {
          console.error('Error deleting user after profile creation exception:', deleteError);
        } else {
          console.log('Successfully deleted user after profile creation exception');
        }
      } catch (deleteError) {
        console.error('Exception deleting user after profile creation exception:', deleteError);
      }
      
      return res.status(500).json({ 
        error: 'Exception creating profile: ' + profileError.message,
        stack: profileError.stack
      });
    }
  } catch (error) {
    console.error('Unhandled exception in create-user endpoint:', error);
    console.error('Full error stack:', error.stack);
    return res.status(500).json({ 
      error: `Server error: ${error.message}`,
      stack: error.stack
    });
  }
});

// Add endpoints for updating user password and deleting users
app.post('/api/update-user-password', async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    if (!userId || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and password are required' 
      });
    }
    
    console.log('Updating password for user:', userId);
    
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password }
    );
    
    if (error) {
      console.error('Error updating password:', error);
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Password updated successfully' 
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

app.post('/api/delete-user', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }
    
    console.log('Deleting user:', userId);
    
    // Delete from auth
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (error) {
      console.error('Error deleting user:', error);
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
    
    // The profile should be automatically deleted by RLS or cascade delete
    
    return res.status(200).json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    console.log('Received request to create user:', JSON.stringify(req.body, null, 2));
    const { email, password, role, contact_id, company_id } = req.body;
    
    // Validate inputs
    if (!email) {
      console.error('Missing required field: email');
      return res.status(400).json({ error: 'Email is required' });
    }
    
    if (!password) {
      console.error('Missing required field: password');
      return res.status(400).json({ error: 'Password is required' });
    }
    
    // Check if user already exists
    console.log('Checking if user already exists with email:', email);
    const { data: existingUsers, error: checkError } = await supabaseAdmin
      .auth.admin.listUsers();
    
    if (checkError) {
      console.error('Error checking existing users:', checkError);
      return res.status(400).json({ error: 'Error checking existing users' });
    }
    
    const existingUser = existingUsers.users.find(user => 
      user.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingUser) {
      console.log('User already exists with email:', email, 'User ID:', existingUser.id);
      
      // Update the contact to mark it as having system access
      const { error: accessError } = await supabaseAdmin
        .from('contacts')
        .update({ has_system_access: true })
        .eq('id', contact_id);
        
      if (accessError) {
        console.error('Error updating contact access flag:', accessError);
      }
      
      return res.status(200).json({ 
        success: true, 
        user: existingUser,
        message: 'User already exists' 
      });
    }
    
    // Log connection details (safely)
    console.log('Using Supabase URL:', supabaseUrl);
    console.log('Service key exists and length:', !!supabaseServiceKey, supabaseServiceKey.length);
    
    // Create the user with admin privileges
    console.log('Creating user with Supabase admin client...');
    try {
      // First, check if the contact exists and has a role
      const { data: contactData, error: contactError } = await supabaseAdmin
        .from('contacts')
        .select('*')
        .eq('id', contact_id)
        .single();
      
      if (contactError) {
        console.error('Error fetching contact:', contactError);
        return res.status(400).json({ error: 'Contact not found' });
      }
      
      if (!contactData.role) {
        console.error('Contact has no role:', contactData);
        
        // Update the contact with a default role
        const { error: updateError } = await supabaseAdmin
          .from('contacts')
          .update({ role: role || 'Contact' })
          .eq('id', contact_id);
        
        if (updateError) {
          console.error('Error updating contact role:', updateError);
          return res.status(400).json({ error: 'Failed to update contact role' });
        }
        
        console.log('Updated contact with default role');
      }
      
      // Prepare user metadata
      const userMetadata = {
        role: role || 'user',
        contact_id
      };
      
      // Add company_id to metadata if provided
      if (company_id) {
        userMetadata.company_id = company_id;
      }
      
      console.log('User metadata:', userMetadata);
      
      // Create the user
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: userMetadata
      });
      
      if (error) {
        console.error('Supabase error creating user:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        return res.status(400).json({ error: error.message });
      }
      
      console.log('User created successfully:', data.user.id);
      
      // Update the contact to mark it as having system access
      const { error: accessError } = await supabaseAdmin
        .from('contacts')
        .update({ has_system_access: true })
        .eq('id', contact_id);
      
      if (accessError) {
        console.error('Error updating contact access flag:', accessError);
        // Continue anyway, as the user was created
      }
      
      // Add user role to database
      if (data.user) {
        console.log('Adding user role to database...');
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: role || 'user'
          });
        
        if (roleError) {
          console.error('Error setting user role:', roleError);
          // Continue anyway, as the user was created
        } else {
          console.log('User role added successfully');
        }
      }
      
      res.status(200).json({ success: true, user: data.user });
    } catch (supabaseError) {
      console.error('Detailed Supabase error:', supabaseError);
      return res.status(400).json({ error: supabaseError.message });
    }
  } catch (error) {
    console.error('Server error creating user:', error);
    res.status(500).json({ error: 'Server error creating user' });
  }
});

// Add a simple JSON-only test endpoint if it doesn't exist
app.get('/api/test-json', (req, res) => {
  // Set content type explicitly to application/json
  res.setHeader('Content-Type', 'application/json');
  res.json({ 
    success: true, 
    message: 'Server is responding with JSON correctly',
    timestamp: new Date().toISOString()
  });
});

// Add a new endpoint to update user profiles
app.post('/api/update-user', async (req, res) => {
  try {
    const { userId, name, role, company_name, telephone } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }
    
    console.log('Updating user profile:', userId);
    
    // Prepare update data
    const updateData = {};
    if (role) updateData.role = role;
    if (name) updateData.name = name;
    if (company_name !== undefined) updateData.company_name = company_name;
    if (telephone !== undefined) updateData.telephone = telephone;
    
    // Update the profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId);
    
    if (profileError) {
      console.error('Error updating profile:', profileError);
      return res.status(400).json({ 
        success: false, 
        error: 'Error updating profile: ' + profileError.message 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'User updated successfully' 
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error: ' + error.message 
    });
  }
});

// Update the server startup to provide more information
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`List users endpoint: http://localhost:${PORT}/api/list-users`);
  console.log(`Server started at: ${new Date().toISOString()}`);
  console.log('Node.js version:', process.version);
  console.log('Available endpoints:');
  console.log('- GET /api/test');
  console.log('- GET /api/test-json');
  console.log('- GET /api/list-users');
  console.log('- GET /api/test-supabase');
  console.log('- POST /api/create-user');
  console.log('- POST /api/update-user');
  console.log('- POST /api/delete-user');
  console.log('- POST /api/update-user-password');
});

// Add a catch-all route to log any unmatched routes
app.use((req, res, next) => {
  console.log(`Unmatched route: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`
  });
}); 